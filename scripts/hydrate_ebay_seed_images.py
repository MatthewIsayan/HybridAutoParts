from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


DEFAULT_ITEMS_JSON = Path(r"c:\HybridAutoParts\seed-import\hybridonlyparts\items.json")
DEFAULT_OUTPUT_DIR = Path(r"c:\HybridAutoParts\frontend\public\images\seed\ebay\hybridonlyparts")
REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/135.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}
OG_IMAGE_PATTERNS = [
    re.compile(r'<meta\s+property="og:image"\s+content="([^"]+)"', re.IGNORECASE),
    re.compile(r'<meta\s+content="([^"]+)"\s+property="og:image"', re.IGNORECASE),
    re.compile(r'<meta\s+name="twitter:image"\s+content="([^"]+)"', re.IGNORECASE),
    re.compile(r'"image"\s*:\s*"([^"]+)"', re.IGNORECASE),
]


def fetch_text(url: str) -> str:
    request = Request(url, headers=REQUEST_HEADERS)
    with urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", "ignore")


def fetch_bytes(url: str) -> bytes:
    request = Request(url, headers=REQUEST_HEADERS)
    with urlopen(request, timeout=30) as response:
        return response.read()


def extract_image_url(html: str) -> str | None:
    for pattern in OG_IMAGE_PATTERNS:
        match = pattern.search(html)
        if match:
            return match.group(1).replace("&amp;", "&")
    return None


def hydrate_item_image(item: dict[str, object], output_dir: Path, force: bool, pause_seconds: float) -> tuple[bool, str]:
    listing_id = str(item["listingId"])
    target_path = output_dir / f"{listing_id}.jpg"
    if target_path.exists() and not force:
        return True, "cached"

    item_url = str(item.get("itemUrl") or "").strip()
    if not item_url:
        return False, "missing itemUrl"

    try:
        html = fetch_text(item_url)
        image_url = extract_image_url(html)
        if not image_url:
            return False, "missing og:image"

        image_bytes = fetch_bytes(image_url)
        if not image_bytes:
            return False, "empty image response"

        target_path.write_bytes(image_bytes)
        if pause_seconds > 0:
            time.sleep(pause_seconds)
        return True, image_url
    except HTTPError as error:
        return False, f"http {error.code}"
    except URLError as error:
        return False, f"url error: {error.reason}"
    except TimeoutError:
        return False, "timeout"


def main() -> int:
    parser = argparse.ArgumentParser(description="Hydrate missing local Hybrid Auto Parts seed images from live eBay listing pages.")
    parser.add_argument("--items-json", default=str(DEFAULT_ITEMS_JSON), help="Path to the seed items.json file.")
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT_DIR), help="Path to the local seed image directory.")
    parser.add_argument("--limit", type=int, default=0, help="Optional maximum number of items to hydrate.")
    parser.add_argument("--force", action="store_true", help="Re-download images even when local files already exist.")
    parser.add_argument("--verify-only", action="store_true", help="Only verify that every expected local seed image exists.")
    parser.add_argument("--pause-seconds", type=float, default=0.15, help="Delay between successful downloads.")
    args = parser.parse_args()

    items_json = Path(args.items_json)
    output_dir = Path(args.output_dir)
    if not items_json.exists():
        print(f"Seed JSON not found: {items_json}", file=sys.stderr)
        return 1

    payload = json.loads(items_json.read_text(encoding="utf-8"))
    items = payload.get("items", [])
    if not isinstance(items, list) or not items:
        print("No seed items found in JSON payload.", file=sys.stderr)
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)

    selected_items = items[: args.limit] if args.limit and args.limit > 0 else items

    if args.verify_only:
        missing = []
        for item in selected_items:
            listing_id = str(item.get("listingId") or "unknown")
            expected_path = output_dir / f"{listing_id}.jpg"
            if not expected_path.exists():
                missing.append(str(expected_path))

        print(
            json.dumps(
                {
                    "checked": len(selected_items),
                    "missing": len(missing),
                    "outputDir": str(output_dir),
                },
                indent=2,
            )
        )
        if missing:
            print("Missing seed images:", file=sys.stderr)
            for path in missing[:20]:
                print(f"  - {path}", file=sys.stderr)
            return 2
        return 0

    successes = 0
    failures: list[str] = []

    for item in selected_items:
        ok, detail = hydrate_item_image(item, output_dir, args.force, args.pause_seconds)
        listing_id = str(item.get("listingId") or "unknown")
        if ok:
            successes += 1
            print(f"[ok] {listing_id}: {detail}")
        else:
            failures.append(f"{listing_id}: {detail}")
            print(f"[warn] {listing_id}: {detail}", file=sys.stderr)

    print(
        json.dumps(
            {
                "attempted": len(selected_items),
                "downloadedOrCached": successes,
                "failed": len(failures),
                "outputDir": str(output_dir),
            },
            indent=2,
        )
    )

    if failures:
        print("Failed listings:", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)

    return 0 if not failures else 2


if __name__ == "__main__":
    raise SystemExit(main())
