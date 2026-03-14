insert into company_config (
    id,
    company_name,
    support_email,
    phone,
    address_line,
    city,
    state,
    postal_code,
    hero_headline,
    hero_subheadline,
    about_text
) values (
    1,
    'Hybrid Auto Parts',
    'sales@hybridautoparts.local',
    '(555) 010-4227',
    '451 Salvage Row',
    'Phoenix',
    'Arizona',
    '85001',
    'Recycled OEM parts with a clear digital inventory path',
    'Phase 0 seed data powers the shell app until public browsing and admin editing land in later phases.',
    'Hybrid Auto Parts specializes in reusable OEM inventory. This placeholder content exists so frontend routes, generated types, and backend controllers can integrate against realistic sample company data early.'
);

insert into admin_users (
    username,
    email,
    display_name,
    password_hash,
    role,
    active
) values (
    'admin',
    'admin@hybridautoparts.local',
    'Local Admin',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoO.HR.jR1iKs6vTmyaKOA1NVuMcZV8K4W',
    'ADMIN',
    true
);

insert into parts (
    sku,
    title,
    description,
    manufacturer,
    vehicle_make,
    vehicle_model,
    vehicle_year,
    condition,
    status,
    location_code,
    price,
    featured
) values
(
    'ENG-2018-CIVIC-001',
    '2018 Honda Civic 2.0L Engine Assembly',
    'Low-mileage engine assembly pulled from a front-end collision donor vehicle.',
    'Honda',
    'Honda',
    'Civic',
    '2018',
    'Grade A',
    'AVAILABLE',
    'A1-14',
    1899.00,
    true
),
(
    'TRN-2017-CAMRY-002',
    '2017 Toyota Camry Automatic Transmission',
    'Transmission unit inspected and tagged for local phase zero sample inventory.',
    'Toyota',
    'Toyota',
    'Camry',
    '2017',
    'Grade A',
    'AVAILABLE',
    'B2-03',
    1249.00,
    true
),
(
    'DR-2019-F150-003',
    '2019 Ford F-150 Passenger Door',
    'Complete passenger-side door with mirror and trim included.',
    'Ford',
    'Ford',
    'F-150',
    '2019',
    'Grade B',
    'AVAILABLE',
    'C4-22',
    525.00,
    true
);

insert into part_images (part_id, url, alt_text, sort_order, placeholder) values
((select id from parts where sku = 'ENG-2018-CIVIC-001'), '/placeholders/engine-assembly.svg', 'Engine assembly placeholder image', 1, true),
((select id from parts where sku = 'TRN-2017-CAMRY-002'), '/placeholders/transmission.svg', 'Transmission placeholder image', 1, true),
((select id from parts where sku = 'DR-2019-F150-003'), '/placeholders/door.svg', 'Passenger door placeholder image', 1, true);
