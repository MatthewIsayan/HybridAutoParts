create unique index if not exists ux_parts_sku_lower
    on parts (lower(sku));

create unique index if not exists ux_admin_users_username_lower
    on admin_users (lower(username));

create unique index if not exists ux_admin_users_email_lower
    on admin_users (lower(email));

create index if not exists idx_parts_featured_id
    on parts (featured, id);
