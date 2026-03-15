from __future__ import annotations

import argparse
import html
import json
import re
import shutil
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlsplit


REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SOURCE_HTML = Path.home() / "Downloads" / "Items for sale by hybridonlyparts _ eBay.htm"
DEFAULT_JSON_OUTPUT = REPO_ROOT / "seed-import" / "hybridonlyparts" / "items.json"
DEFAULT_IMAGE_OUTPUT_DIR = REPO_ROOT / "frontend" / "public" / "images" / "seed" / "ebay" / "hybridonlyparts"


CARD_PATTERN = re.compile(
    r'(<li[^>]*data-listingid="(?P<listing_id>\d+)"[^>]*class="s-card.*?</li>)',
    re.IGNORECASE | re.DOTALL,
)


def extract_first(pattern: str, source: str) -> str | None:
    match = re.search(pattern, source, re.IGNORECASE | re.DOTALL)
    if not match:
        return None
    return normalize_text(match.group(1))


def extract_all(pattern: str, source: str) -> list[str]:
    return [normalize_text(value) for value in re.findall(pattern, source, re.IGNORECASE | re.DOTALL)]


def normalize_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = re.sub(r"<[^>]+>", " ", value)
    cleaned = html.unescape(cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned or None


def slugify(value: str, fallback: str) -> str:
    lowered = value.lower()
    lowered = re.sub(r"[^a-z0-9]+", "-", lowered).strip("-")
    return lowered or fallback


def looks_like_listing_url(value: str | None) -> bool:
    if not value:
        return False
    parsed = urlsplit(value)
    return "ebay.com" in parsed.netloc and "/itm/" in parsed.path


def extract_seller_details(card_html: str) -> tuple[str | None, str | None]:
    match = re.search(
        r'<div class="s-card__attribute-row"><span class="su-styled-text primary large">(.*?)</span><span class="su-styled-text primary large">(.*?)</span></div>',
        card_html,
        re.IGNORECASE | re.DOTALL,
    )
    if not match:
        return None, None
    return normalize_text(match.group(1)), normalize_text(match.group(2))


def parse_card(card_html: str, listing_id: str, html_dir: Path, image_output_dir: Path) -> dict[str, Any]:
    image_anchor_url = extract_first(r'<a class="s-card__link image-treatment" href="([^"]+)"', card_html)
    content_url = extract_first(r'<a class="s-card__link"[^>]*href="([^"]+)"', card_html)
    item_url = image_anchor_url if looks_like_listing_url(image_anchor_url) else content_url

    title = extract_first(
        r'<div role="heading"[^>]*class="s-card__title">.*?<span class="su-styled-text primary default">(.*?)</span>',
        card_html,
    )
    subtitle = extract_first(
        r'<div class="s-card__subtitle">.*?<span class="su-styled-text secondary default">(.*?)</span>',
        card_html,
    )
    price = extract_first(
        r'<span class="su-styled-text primary bold large-1 s-card__price">(.*?)</span>',
        card_html,
    )
    image_src = extract_first(r'<img[^>]*class="s-card__image"[^>]*src="([^"]+)"', card_html)
    image_alt = extract_first(r'<img[^>]*class="s-card__image"[^>]*alt="([^"]*)"', card_html)
    attributes = extract_all(
        r'<div class="s-card__attribute-row"><span class="su-styled-text (?:secondary|primary)(?: [^"]*)?">(.*?)</span>',
        card_html,
    )

    seller, seller_feedback = extract_seller_details(card_html)

    non_seller_attributes = attributes
    if seller:
        non_seller_attributes = [value for value in attributes if value not in {seller, seller_feedback}]

    local_image_url = None
    local_image_path = None
    source_image_path = None
    if image_src:
        decoded_image_src = unquote(image_src)
        candidate_path = (html_dir / decoded_image_src).resolve()
        if candidate_path.exists():
            source_image_path = str(candidate_path)
            extension = candidate_path.suffix.lower() or ".jpg"
            image_file_name = f"{listing_id}{extension}"
            target_path = image_output_dir / image_file_name
            shutil.copy2(candidate_path, target_path)
            local_image_path = str(target_path)
            local_image_url = f"/images/seed/ebay/hybridonlyparts/{image_file_name}"

    return {
        "listingId": listing_id,
        "title": title or image_alt or f"eBay item {listing_id}",
        "subtitle": subtitle,
        "priceText": price,
        "itemUrl": item_url,
        "imageAlt": image_alt,
        "sourceImage": source_image_path,
        "localImagePath": local_image_path,
        "localImageUrl": local_image_url,
        "seller": seller,
        "sellerFeedback": seller_feedback,
        "attributes": non_seller_attributes,
        "slug": slugify(title or image_alt or listing_id, listing_id),
        "rawHtmlSnippet": card_html[:1200],
    }


def should_keep_item(item: dict[str, Any]) -> bool:
    title = (item.get("title") or "").strip().lower()
    if title == "shop on ebay":
        return False
    listing_id = str(item.get("listingId") or "")
    if not listing_id.isdigit() or len(listing_id) > 12:
        return False
    item_url = item.get("itemUrl") or ""
    return "www.ebay.com/itm/" in item_url


def import_saved_html(source_html: Path, json_output_path: Path, image_output_dir: Path) -> dict[str, Any]:
    html_text = source_html.read_text(encoding="utf-8", errors="ignore")
    cards = list(CARD_PATTERN.finditer(html_text))
    if not cards:
        raise RuntimeError("No eBay listing cards were found in the saved HTML.")

    image_output_dir.mkdir(parents=True, exist_ok=True)
    for existing_file in image_output_dir.iterdir():
        if existing_file.is_file():
            existing_file.unlink()

    items: list[dict[str, Any]] = []
    for match in cards:
        items.append(parse_card(match.group(1), match.group("listing_id"), source_html.parent, image_output_dir))

    unique_items: list[dict[str, Any]] = []
    seen_listing_ids: set[str] = set()
    for item in items:
        if not should_keep_item(item):
            continue
        listing_id = item["listingId"]
        if listing_id in seen_listing_ids:
            continue
        seen_listing_ids.add(listing_id)
        unique_items.append(item)

    payload = {
        "sourceHtml": str(source_html),
        "itemCount": len(unique_items),
        "itemsWithLocalImages": sum(1 for item in unique_items if item["localImagePath"]),
        "items": unique_items,
    }

    json_output_path.parent.mkdir(parents=True, exist_ok=True)
    json_output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")
    return payload


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert a saved eBay store HTML page into local JSON and copied images.")
    parser.add_argument(
        "--source-html",
        default=str(DEFAULT_SOURCE_HTML),
        help="Path to the saved eBay HTML file.",
    )
    parser.add_argument(
        "--json-output",
        default=str(DEFAULT_JSON_OUTPUT),
        help="Path for the generated JSON output.",
    )
    parser.add_argument(
        "--image-output-dir",
        default=str(DEFAULT_IMAGE_OUTPUT_DIR),
        help="Directory where local copied images should be written.",
    )
    args = parser.parse_args()

    payload = import_saved_html(
        source_html=Path(args.source_html),
        json_output_path=Path(args.json_output),
        image_output_dir=Path(args.image_output_dir),
    )

    print(
        json.dumps(
            {
                "itemCount": payload["itemCount"],
                "itemsWithLocalImages": payload["itemsWithLocalImages"],
                "jsonOutput": args.json_output,
                "imageOutputDir": args.image_output_dir,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
