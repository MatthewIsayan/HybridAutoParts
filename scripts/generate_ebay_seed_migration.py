from __future__ import annotations

import json
import re
import unicodedata
from decimal import Decimal
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
SOURCE_JSON = REPO_ROOT / "seed-import" / "hybridonlyparts" / "items.json"
OUTPUT_SQL = REPO_ROOT / "backend" / "src" / "main" / "resources" / "db" / "migration" / "V3__import_hybridonlyparts_seed_inventory.sql"

COMPANY = {
    "company_name": "Hybrid Auto Parts",
    "support_email": "sales@hybridautoparts.local",
    "phone": "818-767-5656 / 818-293-9630",
    "address_line": "9787 Glenoaks Blvd",
    "city": "Sun Valley",
    "state": "CA",
    "postal_code": "91352",
    "hero_headline": "OEM recycled inventory from Hybrid Auto Parts in Sun Valley",
    "hero_subheadline": "Browse locally hosted seed inventory imported from the business catalog and styled for a real customer-facing launch.",
    "about_text": (
        "Hybrid Auto Parts is a Sun Valley, California auto recycling business focused on late-model OEM parts. "
        "This local seed set mirrors imported catalog listings and images so public browsing can be tested against realistic inventory."
    ),
}

KNOWN_MAKES = [
    "Tesla",
    "Toyota",
    "Lexus",
    "Honda",
    "Ford",
    "Chevrolet",
    "Chevy",
    "Nissan",
    "Hyundai",
    "Kia",
    "BMW",
    "Mercedes",
    "Audi",
    "Volkswagen",
    "VW",
]

TESLA_MODELS = ["Model S", "Model 3", "Model X", "Model Y"]
GLOBAL_MODELS = {
    "Tesla": TESLA_MODELS,
    "Toyota": ["Prius", "Camry", "Corolla", "Prius V", "Prius Prime"],
    "Lexus": ["CT200h", "RX450h", "ES300h", "NX300h", "HS250H"],
    "Honda": ["Civic", "Accord", "CR-V", "Insight"],
    "Ford": ["Fusion", "Escape", "F-150", "C-Max"],
}


def to_ascii(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    return normalized.encode("ascii", "ignore").decode("ascii")


def clean_text(value: str, max_length: int | None = None) -> str:
    cleaned = to_ascii(value)
    cleaned = cleaned.replace("&", "and")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if max_length is not None:
        cleaned = cleaned[:max_length].rstrip()
    return cleaned


def sql_string(value: str | None) -> str:
    if value is None:
        return "null"
    return "'" + value.replace("'", "''") + "'"


def parse_price(value: str) -> Decimal:
    digits = re.sub(r"[^0-9.]", "", value)
    if not digits:
        return Decimal("0.00")
    return Decimal(digits).quantize(Decimal("0.01"))


def extract_vehicle_year(title: str) -> str | None:
    year_range = re.search(r"\b(20\d{2}-20\d{2}|\d{2}-\d{2})\b", title)
    if year_range:
        return year_range.group(1)
    single_year = re.search(r"\b(20\d{2})\b", title)
    return single_year.group(1) if single_year else None


def extract_manufacturer(title: str) -> str | None:
    for make in KNOWN_MAKES:
        if re.search(rf"\b{re.escape(make)}\b", title, re.IGNORECASE):
            return "Volkswagen" if make == "VW" else "Chevrolet" if make == "Chevy" else make

    for make, models in GLOBAL_MODELS.items():
        for model in models:
            if model.lower() in title.lower():
                return make
    return None


def extract_vehicle_model(title: str, manufacturer: str | None) -> str | None:
    if not manufacturer:
        for make, models in GLOBAL_MODELS.items():
            for model in models:
                if model.lower() in title.lower():
                    return model
        return None

    for model in GLOBAL_MODELS.get(manufacturer, []):
        if model.lower() in title.lower():
            return model
    return None


def build_description(item: dict[str, object]) -> str:
    title = clean_text(str(item["title"]), 160)
    subtitle = clean_text(str(item.get("subtitle") or "Pre-Owned"), 40)
    attributes = [clean_text(str(value), 60) for value in item.get("attributes", []) if value]
    notes = ", ".join(attributes[:4])
    description = (
        f"Imported from the Hybrid Auto Parts catalog snapshot. "
        f"Condition: {subtitle}. "
        f"Listing title: {title}."
    )
    if notes:
        description += f" Marketplace notes: {notes}."
    return clean_text(description, 1000)


def make_location_code(index: int) -> str:
    return f"SV-EBAY-{index:03d}"


def build_part_row(item: dict[str, object], index: int) -> str:
    title = clean_text(str(item["title"]), 160)
    manufacturer = extract_manufacturer(title)
    vehicle_make = manufacturer
    vehicle_model = extract_vehicle_model(title, manufacturer)
    vehicle_year = extract_vehicle_year(title)
    description = build_description(item)
    sku = f"EBAY-{item['listingId']}"
    price = parse_price(str(item.get("priceText") or "$0.00"))
    featured = "true" if index < 6 else "false"

    return "(" + ", ".join(
        [
            sql_string(sku[:64]),
            sql_string(title),
            sql_string(description),
            sql_string(clean_text(manufacturer, 100) if manufacturer else None),
            sql_string(clean_text(vehicle_make, 100) if vehicle_make else None),
            sql_string(clean_text(vehicle_model, 100) if vehicle_model else None),
            sql_string(clean_text(vehicle_year, 10) if vehicle_year else None),
            sql_string(clean_text(str(item.get("subtitle") or "Pre-Owned"), 40)),
            sql_string("AVAILABLE"),
            sql_string(make_location_code(index + 1)),
            str(price),
            featured,
        ]
    ) + ")"


def build_image_row(item: dict[str, object]) -> str:
    sku = f"EBAY-{item['listingId']}"
    local_image_url = clean_text(str(item.get("localImageUrl") or ""), 512)
    alt_text = clean_text(str(item.get("imageAlt") or item["title"]), 160)
    return "(" + ", ".join(
        [
            f"(select id from parts where sku = {sql_string(sku[:64])})",
            sql_string(local_image_url),
            sql_string(alt_text),
            "1",
            "false",
        ]
    ) + ")"


def main() -> None:
    data = json.loads(SOURCE_JSON.read_text(encoding="utf-8"))
    items: list[dict[str, object]] = data["items"]

    part_rows = [build_part_row(item, index) for index, item in enumerate(items)]
    image_rows = [build_image_row(item) for item in items]

    lines: list[str] = [
        "update company_config",
        "set company_name = " + sql_string(COMPANY["company_name"]) + ",",
        "    support_email = " + sql_string(COMPANY["support_email"]) + ",",
        "    phone = " + sql_string(COMPANY["phone"]) + ",",
        "    address_line = " + sql_string(COMPANY["address_line"]) + ",",
        "    city = " + sql_string(COMPANY["city"]) + ",",
        "    state = " + sql_string(COMPANY["state"]) + ",",
        "    postal_code = " + sql_string(COMPANY["postal_code"]) + ",",
        "    hero_headline = " + sql_string(COMPANY["hero_headline"]) + ",",
        "    hero_subheadline = " + sql_string(COMPANY["hero_subheadline"]) + ",",
        "    about_text = " + sql_string(COMPANY["about_text"]),
        "where id = 1;",
        "",
        "delete from part_images;",
        "delete from parts;",
        "alter sequence parts_id_seq restart with 1;",
        "alter sequence part_images_id_seq restart with 1;",
        "",
        "insert into parts (",
        "    sku,",
        "    title,",
        "    description,",
        "    manufacturer,",
        "    vehicle_make,",
        "    vehicle_model,",
        "    vehicle_year,",
        "    condition,",
        "    status,",
        "    location_code,",
        "    price,",
        "    featured",
        ") values",
        ",\n".join(part_rows) + ";",
        "",
        "insert into part_images (part_id, url, alt_text, sort_order, placeholder) values",
        ",\n".join(image_rows) + ";",
        "",
    ]

    OUTPUT_SQL.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote migration to {OUTPUT_SQL}")


if __name__ == "__main__":
    main()
