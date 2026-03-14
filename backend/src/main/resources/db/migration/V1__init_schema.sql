create table company_config (
    id bigint primary key,
    company_name varchar(160) not null,
    support_email varchar(160) not null,
    phone varchar(40) not null,
    address_line varchar(160) not null,
    city varchar(100) not null,
    state varchar(100) not null,
    postal_code varchar(20) not null,
    hero_headline varchar(160) not null,
    hero_subheadline varchar(255) not null,
    about_text text
);

create table admin_users (
    id bigserial primary key,
    username varchar(80) not null unique,
    email varchar(160) not null unique,
    display_name varchar(120) not null,
    password_hash varchar(255) not null,
    role varchar(40) not null,
    active boolean not null default true
);

create table parts (
    id bigserial primary key,
    sku varchar(64) not null unique,
    title varchar(160) not null,
    description text,
    manufacturer varchar(100),
    vehicle_make varchar(100),
    vehicle_model varchar(100),
    vehicle_year varchar(10),
    condition varchar(40),
    status varchar(40),
    location_code varchar(40),
    price numeric(10, 2) not null,
    featured boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table part_images (
    id bigserial primary key,
    part_id bigint not null references parts(id) on delete cascade,
    url varchar(512) not null,
    alt_text varchar(160),
    sort_order integer not null default 0,
    placeholder boolean not null default true
);

create index idx_parts_featured on parts(featured);
create index idx_part_images_part_id on part_images(part_id);
