create extension if not exists pg_trgm;

create index if not exists idx_part_images_part_sort_order
    on part_images (part_id, sort_order, id);

create index if not exists idx_parts_status_upper
    on parts (upper(status));

create index if not exists idx_parts_search_fts
    on parts using gin (
        to_tsvector(
            'simple',
            coalesce(sku, '')
            || ' ' || coalesce(title, '')
            || ' ' || coalesce(description, '')
            || ' ' || coalesce(manufacturer, '')
            || ' ' || coalesce(vehicle_make, '')
            || ' ' || coalesce(vehicle_model, '')
            || ' ' || coalesce(vehicle_year, '')
        )
    );

create index if not exists idx_parts_search_trgm
    on parts using gin (
        lower(
            coalesce(sku, '')
            || ' ' || coalesce(title, '')
            || ' ' || coalesce(description, '')
            || ' ' || coalesce(manufacturer, '')
            || ' ' || coalesce(vehicle_make, '')
            || ' ' || coalesce(vehicle_model, '')
            || ' ' || coalesce(vehicle_year, '')
        ) gin_trgm_ops
    );
