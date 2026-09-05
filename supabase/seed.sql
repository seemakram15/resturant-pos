-- =============================================================================
-- Khalifa Foods · Seed data
-- One tenant, one branch. 24 deals + à la carte skeleton from the menu PDF.
-- =============================================================================

-- Fixed IDs for a stable seed
insert into tenants (id, name, plan)
values ('00000000-0000-0000-0000-000000000001', 'Khalifa Foods', 'single')
on conflict do nothing;

insert into branches (id, tenant_id, name, address, phone, email, tax_rate_bps)
values (
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-000000000001',
  'DHA Lahore',
  '18-F Commercial, PCHS, New Gourmet Bakery, DHA Lahore',
  '0323-4748660',
  'orders@khalifafoods.com',
  0
) on conflict do nothing;

insert into terminals (id, tenant_id, branch_id, name, device_hint)
values (
  '00000000-0000-0000-0000-0000000000b1',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-0000000000a1',
  'Counter 1',
  'Windows POS · main till'
) on conflict do nothing;

-- Set current tenant for the rest of the seed (so RLS-style checks pass in dev)
set app.tenant_id = '00000000-0000-0000-0000-000000000001';
set app.branch_id = '00000000-0000-0000-0000-0000000000a1';

-- -----------------------------------------------------------------------------
-- Categories
-- -----------------------------------------------------------------------------
insert into categories (tenant_id, slug, name_en, name_ur, sort_order) values
  ('00000000-0000-0000-0000-000000000001','deals','Deals','ڈیلز',1),
  ('00000000-0000-0000-0000-000000000001','burgers','Burgers','برگرز',2),
  ('00000000-0000-0000-0000-000000000001','chicken','Chicken','چکن',3),
  ('00000000-0000-0000-0000-000000000001','shawarma','Shawarma','شاورما',4),
  ('00000000-0000-0000-0000-000000000001','pizza','Pizza','پیزا',5),
  ('00000000-0000-0000-0000-000000000001','steaks','Steaks','اسٹیکس',6),
  ('00000000-0000-0000-0000-000000000001','sides','Sides','سائیڈز',7),
  ('00000000-0000-0000-0000-000000000001','drinks','Drinks','مشروبات',8)
on conflict (tenant_id, slug) do nothing;

-- -----------------------------------------------------------------------------
-- À la carte items (prices are placeholders where owner hasn't confirmed)
-- -----------------------------------------------------------------------------
insert into items (tenant_id, category_id, sku, name_en, name_ur, base_price, tags, sort_order) values
  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='burgers'), 'BUR-SZ',  'Super Zinger Burger',        'سپر زنگر برگر',      450, '{"halal","spicy"}', 1),
  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='burgers'), 'BUR-CP',  'Chicken Patty Burger',       'چکن پیٹی برگر',      380, '{"halal"}',         2),
  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='burgers'), 'BUR-GC',  'Grilled Chicken Burger',     'گرلڈ چکن برگر',      520, '{"halal","grilled"}',3),
  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='burgers'), 'BUR-BF',  'Beef Burger (Double Filled)','بیف برگر ڈبل',        620, '{"halal","beef"}',  4),
  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='burgers'), 'BUR-ZG',  'Zinger Burger',              'زنگر برگر',          400, '{"halal","spicy"}', 5),

  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='chicken'), 'CHK-FRD', 'Fried Chicken (per pc)',    'فرائیڈ چکن',         240, '{"halal"}',         1),
  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='chicken'), 'CHK-BRO', 'Broast Chicken (per pc)',   'بروسٹ چکن',          260, '{"halal"}',         2),
  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='chicken'), 'CHK-HW',  'Hot Wings (per pc)',        'ہاٹ ونگز',            65, '{"halal","spicy"}', 3),
  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='chicken'), 'CHK-NG4', 'Nuggets (4 pcs)',           'نگٹس',               250, '{"halal"}',         4),

  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='shawarma'), 'SHW-SUP','Khalifa Super Shawarma',    'خلیفہ سپر شاورما',    350, '{"halal","spicy"}', 1),
  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='shawarma'), 'SHW-SZ', 'Super Zinger Shawarma',     'سپر زنگر شاورما',     320, '{"halal","spicy"}', 2),
  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='shawarma'), 'SHW-DNR','Donner Shawarma',           'ڈونر شاورما',        380, '{"halal"}',         3),

  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='pizza'), 'PZA-SM',    'Small Pizza',               'چھوٹا پیزا',         750, '{"halal"}',         1),
  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='pizza'), 'PZA-MD',    'Medium Pizza',              'درمیانہ پیزا',       1200,'{"halal"}',         2),
  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='pizza'), 'PZA-LG',    'Large Pizza',               'بڑا پیزا',           1650,'{"halal"}',         3),

  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='sides'), 'SD-FRIES',  'Fries',                     'فرائز',              180, '{}',                1),
  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='sides'), 'SD-PARTHA', 'Cocktail Paratha Platter',  'کاک ٹیل پراٹھا',      620, '{"halal"}',         2),

  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='steaks'), 'STK-PP',   'Special Peri Peri Steak',   'اسپیشل پیری پیری اسٹیک', 1000, '{"halal","spicy","grilled"}', 1),

  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='drinks'), 'DRK-R',    'Regular Drink (250 ml)',    'ریگولر ڈرنک',         80, '{}',                1),
  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='drinks'), 'DRK-HL',   'Half-Litre Drink',          'ہاف لیٹر ڈرنک',       150,'{}',                2),
  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='drinks'), 'DRK-1L',   '1 Litre Coke',              '1 لیٹر کوک',         230,'{}',                3),
  ('00000000-0000-0000-0000-000000000001', (select id from categories where slug='drinks'), 'DRK-1_5L', '1.5 Litre Coke',            '1.5 لیٹر کوک',       290,'{}',                4)
on conflict (tenant_id, sku) do nothing;

-- -----------------------------------------------------------------------------
-- Combos · 24 deals from the menu
-- -----------------------------------------------------------------------------
-- Technologia deals (single-person)
insert into combos (tenant_id, slug, category, name_en, name_ur, price, description_en, sort_order) values
  ('00000000-0000-0000-0000-000000000001','black-barry','technologia','Black Barry Deal',NULL,549,'1 Super Zinger Burger + Fries + 1 R. Drink',1),
  ('00000000-0000-0000-0000-000000000001','nokia',      'technologia','Nokia Deal',      NULL,499,'1 Chicken Patty Burger + Fries + 1 R. Drink',2),
  ('00000000-0000-0000-0000-000000000001','samsung',    'technologia','Samsung Deal',    NULL,649,'1 Grilled Chicken Burger + Fries + 1 R. Drink',3),
  ('00000000-0000-0000-0000-000000000001','galaxy',     'technologia','Galaxy Deal',     NULL,649,'1 Super Zinger Burger + 1 Pc Chicken + Fries + 1 R. Drink',4),
  ('00000000-0000-0000-0000-000000000001','techno',     'technologia','Techno Deal',     NULL,749,'1 Beef Burger (Double Filled) + Fries + 1 R. Drink',5),
  ('00000000-0000-0000-0000-000000000001','vivo',       'technologia','Vivo Deal',       NULL,599,'1 Chicken Patty Burger + 4 Pcs Nuggets + 1 R. Drink',6),

  -- Twins deals
  ('00000000-0000-0000-0000-000000000001','ham-tum',    'twins','Ham Tum Deal',          NULL,649,'9 Pcs Hot Wings + 1 R. Drink',7),
  ('00000000-0000-0000-0000-000000000001','janu-manu',  'twins','Janu Manu Deal',        NULL,599,'2 Pcs Chicken + 1 R. Drink',8),
  ('00000000-0000-0000-0000-000000000001','bhai-bhai',  'twins','Bhai Bhai Deal',        NULL,999,'2 Super Zinger Burgers + Fries + 1 Half-Litre Drink',9),
  ('00000000-0000-0000-0000-000000000001','shony-mony', 'twins','Shony Mony Deal',       NULL,999,'1 Chicken Patty Burger + 1 Super Zinger Burger + Fries + 1 Half-Litre Drink',10),
  ('00000000-0000-0000-0000-000000000001','mama-papa',  'twins','Mama Papa Deal',        NULL,1199,'1 Cocktail Paratha Platter + 2 R. Drinks',11),
  ('00000000-0000-0000-0000-000000000001','laila-majnu','twins','Laila Majnu Deal',      NULL,749,'2 Khalifa Super Shawarma (Black Olives, Jalapeño) + 2 R. Drinks',12),

  -- Family deals
  ('00000000-0000-0000-0000-000000000001','joined-family',   'family','Joined Family Deal',   NULL,2199,'3 Super Zinger Burgers + 1 Chicken Patty Burger + 3 Pcs Chicken + Fries + 1.5 L Coke',13),
  ('00000000-0000-0000-0000-000000000001','lovely-cousin',   'family','Lovely Cousin Deal',   NULL,1499,'3 Super Zinger Burgers + 6 Pcs Hot Wings + 1 L Coke',14),
  ('00000000-0000-0000-0000-000000000001','group-bandi',     'family','Group Bandi Deal',     NULL,1999,'5 Super Zinger Burgers + Fries + 1.5 L Coke',15),
  ('00000000-0000-0000-0000-000000000001','family-function', 'family','Family Function Deal', NULL,1999,'9 Pcs Broast Chicken + 1.5 L Coke',16),
  ('00000000-0000-0000-0000-000000000001','chachu-family',   'family','Chachu ki Family Deal',NULL,1949,'6 Super Zinger Shawarmas + 1.5 L Coke',17),
  ('00000000-0000-0000-0000-000000000001','mamo-family',     'family','Mamo ki Family Deal',  NULL,2249,'2 Donner Shawarmas + 2 Grilled Chicken Burgers + 9 Pcs Hot Wings + 1.5 L Coke',18),

  -- Pizza deals (with real Urdu names as per menu)
  ('00000000-0000-0000-0000-000000000001','muslim-league-n', 'pizza','Muslim League N Deal', 'پاکستان مسلم لیگ ن ڈیل',   1199,'2 Small Pizzas + Half-Litre Drink',19),
  ('00000000-0000-0000-0000-000000000001','tehreek-insaf',   'pizza','Tehreek-e-Insaf Deal', 'پاکستان تحریک انصاف ڈیل',   1299,'1 Small Pizza + 1 Zinger Burger + 4 Pcs Hot Wings + Half-Litre Drink',20),
  ('00000000-0000-0000-0000-000000000001','tehreek-labbaik', 'pizza','Tehreek-e-Labbaik Deal','پاکستان تحریک لبیک ڈیل',    2299,'2 Medium Pizzas + 1.5 L Coke',21),
  ('00000000-0000-0000-0000-000000000001','peoples-party',   'pizza','Peoples Party Deal',   'پاکستان پیپلز پارٹی ڈیل',   2399,'2 Small Pizzas + 2 Zinger Burgers + 8 Pcs Hot Wings + 1.5 L Coke',22),
  ('00000000-0000-0000-0000-000000000001','mqm',             'pizza','MQM Deal',             'ایم کیو ایم ڈیل',            3299,'2 Large Pizzas + 1.5 L Coke',23),
  ('00000000-0000-0000-0000-000000000001','azad-umeedwar',   'pizza','Azad Umeedwar Deal',   'آزاد امیدوار ڈیل',           3599,'1 Large Pizza + 4 Zinger Burgers + Fries + 1.5 L Coke',24)
on conflict (tenant_id, slug) do nothing;

-- -----------------------------------------------------------------------------
-- Combo lines (which items each deal contains, for stock deduction)
-- -----------------------------------------------------------------------------
-- Helper CTE-style inserts: look up items by SKU
insert into combo_lines (combo_id, item_id, qty, sort_order)
select c.id, i.id, cl.qty, cl.ord from (values
  -- Technologia
  ('black-barry','BUR-SZ',   1, 1), ('black-barry','SD-FRIES', 1, 2), ('black-barry','DRK-R',   1, 3),
  ('nokia',      'BUR-CP',   1, 1), ('nokia',      'SD-FRIES', 1, 2), ('nokia',      'DRK-R',   1, 3),
  ('samsung',    'BUR-GC',   1, 1), ('samsung',    'SD-FRIES', 1, 2), ('samsung',    'DRK-R',   1, 3),
  ('galaxy',     'BUR-SZ',   1, 1), ('galaxy',     'CHK-FRD',  1, 2), ('galaxy',     'SD-FRIES',1, 3), ('galaxy','DRK-R',1,4),
  ('techno',     'BUR-BF',   1, 1), ('techno',     'SD-FRIES', 1, 2), ('techno',     'DRK-R',   1, 3),
  ('vivo',       'BUR-CP',   1, 1), ('vivo',       'CHK-NG4',  1, 2), ('vivo',       'DRK-R',   1, 3),

  -- Twins
  ('ham-tum',    'CHK-HW',   9, 1), ('ham-tum',    'DRK-R',    1, 2),
  ('janu-manu',  'CHK-FRD',  2, 1), ('janu-manu',  'DRK-R',    1, 2),
  ('bhai-bhai',  'BUR-SZ',   2, 1), ('bhai-bhai',  'SD-FRIES', 1, 2), ('bhai-bhai',  'DRK-HL',  1, 3),
  ('shony-mony', 'BUR-CP',   1, 1), ('shony-mony', 'BUR-SZ',   1, 2), ('shony-mony', 'SD-FRIES',1, 3), ('shony-mony','DRK-HL',1,4),
  ('mama-papa',  'SD-PARTHA',1, 1), ('mama-papa',  'DRK-R',    2, 2),
  ('laila-majnu','SHW-SUP',  2, 1), ('laila-majnu','DRK-R',    2, 2),

  -- Family
  ('joined-family',  'BUR-SZ',   3, 1), ('joined-family',  'BUR-CP',   1, 2), ('joined-family','CHK-FRD',3,3), ('joined-family','SD-FRIES',1,4),('joined-family','DRK-1_5L',1,5),
  ('lovely-cousin',  'BUR-SZ',   3, 1), ('lovely-cousin',  'CHK-HW',   6, 2), ('lovely-cousin','DRK-1L',1,3),
  ('group-bandi',    'BUR-SZ',   5, 1), ('group-bandi',    'SD-FRIES', 1, 2), ('group-bandi',  'DRK-1_5L',1,3),
  ('family-function','CHK-BRO',  9, 1), ('family-function','DRK-1_5L', 1, 2),
  ('chachu-family',  'SHW-SZ',   6, 1), ('chachu-family',  'DRK-1_5L', 1, 2),
  ('mamo-family',    'SHW-DNR',  2, 1), ('mamo-family',    'BUR-GC',   2, 2), ('mamo-family',  'CHK-HW',   9, 3), ('mamo-family','DRK-1_5L',1,4),

  -- Pizza
  ('muslim-league-n','PZA-SM',   2, 1), ('muslim-league-n','DRK-HL',   1, 2),
  ('tehreek-insaf',  'PZA-SM',   1, 1), ('tehreek-insaf',  'BUR-ZG',   1, 2), ('tehreek-insaf','CHK-HW',   4, 3), ('tehreek-insaf','DRK-HL',1,4),
  ('tehreek-labbaik','PZA-MD',   2, 1), ('tehreek-labbaik','DRK-1_5L', 1, 2),
  ('peoples-party',  'PZA-SM',   2, 1), ('peoples-party',  'BUR-ZG',   2, 2), ('peoples-party','CHK-HW',   8, 3), ('peoples-party','DRK-1_5L',1,4),
  ('mqm',            'PZA-LG',   2, 1), ('mqm',            'DRK-1_5L', 1, 2),
  ('azad-umeedwar',  'PZA-LG',   1, 1), ('azad-umeedwar',  'BUR-ZG',   4, 2), ('azad-umeedwar','SD-FRIES', 1, 3), ('azad-umeedwar','DRK-1_5L',1,4)
) as cl(combo_slug, item_sku, qty, ord)
join combos c on c.slug = cl.combo_slug and c.tenant_id = '00000000-0000-0000-0000-000000000001'
join items i on i.sku  = cl.item_sku and i.tenant_id = '00000000-0000-0000-0000-000000000001'
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- Dining tables (10 tables in the DHA branch)
-- -----------------------------------------------------------------------------
insert into dining_tables (tenant_id, branch_id, label, seats, x_pos, y_pos)
select
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-0000000000a1',
  'T-' || lpad(n::text, 2, '0'),
  case when n <= 4 then 2 when n <= 8 then 4 else 6 end,
  ((n - 1) % 5) * 100,
  ((n - 1) / 5) * 100
from generate_series(1, 10) n
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- Modifier groups (shared: spice level, add-ons)
-- -----------------------------------------------------------------------------
with sg as (
  insert into modifier_groups (tenant_id, name_en, name_ur, min_select, max_select)
  values ('00000000-0000-0000-0000-000000000001','Spice level','مصالحہ',0,1)
  returning id
)
insert into modifiers (group_id, name_en, name_ur, price_delta)
select id, m.name_en, m.name_ur, 0 from sg,
  (values ('Mild','ہلکا'),('Regular','عام'),('Extra spicy','بہت مصالحہ دار')) as m(name_en, name_ur);

with ag as (
  insert into modifier_groups (tenant_id, name_en, name_ur, min_select, max_select)
  values ('00000000-0000-0000-0000-000000000001','Add-ons','اضافی',0,5)
  returning id
)
insert into modifiers (group_id, name_en, name_ur, price_delta)
select id, m.name_en, m.name_ur, m.price from ag,
  (values ('Extra cheese','اضافی چیز',60),('Extra sauce','اضافی ساس',30),('No onion','بغیر پیاز',0),('Jalapeño','جیلاپینو',50)) as m(name_en, name_ur, price);

-- -----------------------------------------------------------------------------
-- Sample bill counter
-- -----------------------------------------------------------------------------
insert into bill_counters (tenant_id, branch_id, next_no)
values ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000a1', 13831)
on conflict do nothing;
