-- =============================================================================
-- Khalifa Foods · Full menu import (matches printed menu card)
-- Adds sandwiches / appetizers / paratha-wraps / pasta categories,
-- updates prices on existing items, inserts all missing à la carte items
-- and pizza flavours (Special + Luxury) with S / M / L per flavour.
-- Idempotent: safe to re-run.
-- =============================================================================

set app.tenant_id = '00000000-0000-0000-0000-000000000001';
set app.branch_id = '00000000-0000-0000-0000-0000000000a1';

-- New categories -------------------------------------------------------------
insert into categories (tenant_id, slug, name_en, name_ur, sort_order) values
  ('00000000-0000-0000-0000-000000000001','sandwiches',   'Sandwiches',    'سینڈوچ',       5),
  ('00000000-0000-0000-0000-000000000001','appetizers',   'Appetizers',    'اپیٹائزر',     6),
  ('00000000-0000-0000-0000-000000000001','paratha-wraps','Paratha Wraps', 'پراٹھا ریپ',   9),
  ('00000000-0000-0000-0000-000000000001','pasta',        'Pasta & More',  'پاستا',        11)
on conflict (tenant_id, slug) do nothing;

-- Renumber existing categories so the menu chip order matches the printed card
update categories set sort_order = 1  where tenant_id='00000000-0000-0000-0000-000000000001' and slug='deals';
update categories set sort_order = 2  where tenant_id='00000000-0000-0000-0000-000000000001' and slug='burgers';
update categories set sort_order = 3  where tenant_id='00000000-0000-0000-0000-000000000001' and slug='pizza';
update categories set sort_order = 4  where tenant_id='00000000-0000-0000-0000-000000000001' and slug='shawarma';
update categories set sort_order = 5  where tenant_id='00000000-0000-0000-0000-000000000001' and slug='sandwiches';
update categories set sort_order = 6  where tenant_id='00000000-0000-0000-0000-000000000001' and slug='appetizers';
update categories set sort_order = 7  where tenant_id='00000000-0000-0000-0000-000000000001' and slug='steaks';
update categories set sort_order = 8  where tenant_id='00000000-0000-0000-0000-000000000001' and slug='chicken';
update categories set sort_order = 9  where tenant_id='00000000-0000-0000-0000-000000000001' and slug='paratha-wraps';
update categories set sort_order = 10 where tenant_id='00000000-0000-0000-0000-000000000001' and slug='sides';
update categories set sort_order = 11 where tenant_id='00000000-0000-0000-0000-000000000001' and slug='pasta';
update categories set sort_order = 12 where tenant_id='00000000-0000-0000-0000-000000000001' and slug='drinks';

-- Price updates on existing items to match printed card ---------------------
update items set base_price = 379 where tenant_id='00000000-0000-0000-0000-000000000001' and sku='BUR-SZ';
update items set base_price = 349 where tenant_id='00000000-0000-0000-0000-000000000001' and sku='BUR-CP';
update items set base_price = 499, name_en='Khalifa Special Grilled Chicken Burger' where tenant_id='00000000-0000-0000-0000-000000000001' and sku='BUR-GC';
update items set base_price = 649, name_en='Khalifa Special Beef Burger (Double Fillet)' where tenant_id='00000000-0000-0000-0000-000000000001' and sku='BUR-BF';
update items set base_price = 399 where tenant_id='00000000-0000-0000-0000-000000000001' and sku='SHW-DNR';
update items set base_price = 349 where tenant_id='00000000-0000-0000-0000-000000000001' and sku='SHW-SUP';
update items set base_price = 359 where tenant_id='00000000-0000-0000-0000-000000000001' and sku='SHW-SZ';
update items set base_price = 899, name_en='Khalifa Special Peri Peri Steak' where tenant_id='00000000-0000-0000-0000-000000000001' and sku='STK-PP';
-- Cocktail Paratha Platter is really a paratha-wrap item on the printed card
update items
  set base_price = 999,
      category_id = (select id from categories where tenant_id='00000000-0000-0000-0000-000000000001' and slug='paratha-wraps')
  where tenant_id='00000000-0000-0000-0000-000000000001' and sku='SD-PARTHA';

-- New items ------------------------------------------------------------------
insert into items (tenant_id, category_id, sku, name_en, name_ur, base_price, tags, sort_order) values
  -- Burgers
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='burgers'),      'BUR-JAL','Khalifa Special Jalapeno Burger',           'خلیفہ اسپیشل جیلاپینو برگر', 549,'{"halal","spicy"}',6),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='burgers'),      'BUR-LAV','Khalifa Special Lava Burger',               'خلیفہ اسپیشل لاوا برگر',     649,'{"halal","spicy"}',7),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='burgers'),      'BUR-KRZ','Khalifa Special Krizma Burger',             'خلیفہ اسپیشل کرزما برگر',    649,'{"halal"}',        8),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='burgers'),      'BUR-YP', 'Khalifa Special Yum Pum Burger',            'خلیفہ اسپیشل یم پم برگر',    699,'{"halal"}',        9),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='burgers'),      'BUR-WT', 'Khalifa Special Wahshi Tower Burger',       'خلیفہ اسپیشل واحشی ٹاور برگر',699,'{"halal","spicy"}',10),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='burgers'),      'BUR-BAT','Khalifa Special Batmeeeez Burger',          'خلیفہ اسپیشل بیٹمیز برگر',   699,'{"halal"}',        11),

  -- Sandwiches
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='sandwiches'),   'SND-GC', 'Khalifa Special Grilled Chicken Sandwich',  'گرلڈ چکن سینڈوچ',           499,'{"halal","grilled"}',1),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='sandwiches'),   'SND-BF', 'Beef Sandwich',                             'بیف سینڈوچ',                499,'{"halal","beef"}',   2),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='sandwiches'),   'SND-KBB','Kababish Sandwich',                         'کبابش سینڈوچ',              499,'{"halal"}',         3),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='sandwiches'),   'SND-ARB','Khalifa Special Arabic Sandwich',           'عربی سینڈوچ',               499,'{"halal"}',         4),

  -- Appetizers
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='appetizers'),   'APP-HW9', 'Khalifa Special Hot Wings (9 pcs)',        'ہاٹ ونگز (9)',              599,'{"halal","spicy"}', 1),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='appetizers'),   'APP-HS9', 'Khalifa Special Hot Shots (9 pcs)',        'ہاٹ شاٹس (9)',              649,'{"halal","spicy"}', 2),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='appetizers'),   'APP-GSW9','Grilled Spicy Wings (9 pcs)',              'گرلڈ اسپائسی ونگز (9)',     649,'{"halal","spicy","grilled"}',3),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='appetizers'),   'APP-NG9', 'Nuggets (9 pcs)',                          'نگٹس (9)',                  549,'{"halal"}',         4),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='appetizers'),   'APP-FCP', 'Fried Chicken Piece',                      'فرائیڈ چکن پیس',            299,'{"halal"}',         5),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='appetizers'),   'APP-FRY', 'Plain Fries',                              'پلین فرائز',                249,'{}',                6),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='appetizers'),   'APP-GMF', 'Khalifa Garlic Mayo Fries',                'گارلک میو فرائز',           349,'{}',                7),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='appetizers'),   'APP-LF',  'Khalifa Special Loaded Fries',             'لوڈڈ فرائز',                499,'{}',                8),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='appetizers'),   'APP-HST6','Khalifa Special Hot Stips (6 pcs)',        'ہاٹ اسٹرپس (6)',            549,'{"halal","spicy"}', 9),

  -- Shawarma additions
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='shawarma'),     'SHW-GRL', 'Khalifa Special Grilled Shawarma',         'گرلڈ شاورما',              399,'{"halal","grilled"}',4),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='shawarma'),     'SHW-BF',  'Beef Shawarma',                            'بیف شاورما',               399,'{"halal","beef"}',  5),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='shawarma'),     'SHW-CHK', 'Chicken Shawarma (Regular)',               'چکن شاورما',               350,'{"halal"}',         6),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='shawarma'),     'SHW-PLT', 'Shawarma Platter',                         'شاورما پلیٹر',             599,'{"halal"}',         7),

  -- Paratha Wraps
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='paratha-wraps'),'WRP-TWS','Twister Paratha Wrap',                      'ٹوئسٹر پراٹھا ریپ',          599,'{"halal"}',         2),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='paratha-wraps'),'WRP-KBB','Kababish Paratha Wrap',                     'کبابش پراٹھا ریپ',           599,'{"halal"}',         3),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='paratha-wraps'),'WRP-TRT','Khalifa Special Tortilla Wrap',             'ٹورٹیلا ریپ',                699,'{"halal"}',         4),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='paratha-wraps'),'WRP-ARB','Khalifa Special Arabic Paratha Wrap',       'عربی پراٹھا ریپ',            599,'{"halal"}',         5),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='paratha-wraps'),'WRP-PZA','Khalifa Special Pizza Paratha',             'پیزا پراٹھا',                599,'{"halal"}',         6),

  -- Steaks
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='steaks'),       'STK-GC', 'Khalifa Special Grilled Chicken Steak',     'گرلڈ چکن اسٹیک',            899,'{"halal","grilled"}',1),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='steaks'),       'STK-ARB','Khalifa Special Arabic Steak',              'عربی اسٹیک',                899,'{"halal","grilled"}',2),

  -- Pasta & More
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pasta'),        'MSC-CCP','Chicken Cheese Pasta',                      'چکن چیز پاستا',              499,'{"halal"}',         1),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pasta'),        'MSC-PC', 'Pizza Container',                           'پیزا کنٹینر',               499,'{"halal"}',         2),

  -- Pizza Special Flavours (S / M / L)
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-COR-S','Corolla Tikka (Small)',   'کرولا تکہ (چھوٹا)',   599, '{"halal","spicy"}', 10),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-COR-M','Corolla Tikka (Medium)',  'کرولا تکہ (درمیانہ)',1099, '{"halal","spicy"}', 11),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-COR-L','Corolla Tikka (Large)',   'کرولا تکہ (بڑا)',    1649, '{"halal","spicy"}', 12),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-FER-S','Ferrari Fajita (Small)',  'فراری فاجیتا (چھوٹا)',   599,'{"halal","spicy"}', 13),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-FER-M','Ferrari Fajita (Medium)', 'فراری فاجیتا (درمیانہ)',1099,'{"halal","spicy"}', 14),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-FER-L','Ferrari Fajita (Large)',  'فراری فاجیتا (بڑا)',    1649,'{"halal","spicy"}', 15),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-BMW-S','BMW BBQ (Small)',         'BMW بی بی کیو (چھوٹا)',   599,'{"halal"}',        16),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-BMW-M','BMW BBQ (Medium)',        'BMW بی بی کیو (درمیانہ)',1099,'{"halal"}',        17),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-BMW-L','BMW BBQ (Large)',         'BMW بی بی کیو (بڑا)',    1649,'{"halal"}',        18),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-CIV-S','Civic Supreme (Small)',   'سوک سپریم (چھوٹا)',      599,'{"halal"}',        19),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-CIV-M','Civic Supreme (Medium)',  'سوک سپریم (درمیانہ)',   1099,'{"halal"}',        20),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-CIV-L','Civic Supreme (Large)',   'سوک سپریم (بڑا)',       1649,'{"halal"}',        21),

  -- Pizza Luxury Flavours
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-AUD-M','Audi Crown Crust (Medium)','آڈی کراؤن کرسٹ (درمیانہ)',1299,'{"halal","luxury"}', 22),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-AUD-L','Audi Crown Crust (Large)', 'آڈی کراؤن کرسٹ (بڑا)',    1999,'{"halal","luxury"}', 23),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-KIA-S','Kia Kababish (Small)',     'کیا کبابش (چھوٹا)',        699,'{"halal","luxury"}', 24),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-KIA-M','Kia Kababish (Medium)',    'کیا کبابش (درمیانہ)',     1299,'{"halal","luxury"}', 25),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-KIA-L','Kia Kababish (Large)',     'کیا کبابش (بڑا)',         1999,'{"halal","luxury"}', 26),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-MER-S','Mercedes Malai Boti (Small)', 'مرسڈیز ملائی بوٹی (چھوٹا)', 699,'{"halal","luxury"}', 27),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-MER-M','Mercedes Malai Boti (Medium)','مرسڈیز ملائی بوٹی (درمیانہ)',1299,'{"halal","luxury"}', 28),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-MER-L','Mercedes Malai Boti (Large)', 'مرسڈیز ملائی بوٹی (بڑا)',   1999,'{"halal","luxury"}', 29),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-LUX-M','Luxury Lasagna (Medium)',  'لگژری لاسانیا (درمیانہ)', 1299,'{"halal","luxury"}', 30),
  ('00000000-0000-0000-0000-000000000001',(select id from categories where slug='pizza'),'PZA-LUX-L','Luxury Lasagna (Large)',   'لگژری لاسانیا (بڑا)',    1999,'{"halal","luxury"}', 31)
on conflict (tenant_id, sku) do nothing;

-- Extra topping modifier group (Cheese / Bread / Olive & Jalapeño / Extra Mayo, all Rs. 70)
with tg as (
  insert into modifier_groups (tenant_id, name_en, name_ur, min_select, max_select)
  select '00000000-0000-0000-0000-000000000001','Khalifa extra topping','خلیفہ ایکسٹرا ٹاپنگ',0,4
  where not exists (
    select 1 from modifier_groups
    where tenant_id='00000000-0000-0000-0000-000000000001' and name_en='Khalifa extra topping'
  )
  returning id
)
insert into modifiers (group_id, name_en, name_ur, price_delta)
select id, m.name_en, m.name_ur, 70 from tg,
  (values ('Cheese','چیز'),('Bread','بریڈ'),('Olive & Jalapeño','زیتون اور جیلاپینو'),('Extra Mayo','ایکسٹرا میو')) as m(name_en, name_ur);
