-- ─────────────────────────────────────────────────────────────────────────────
-- Aureon — Development Seed Data
-- Run via: supabase db seed  (or supabase db reset)
-- All passwords: test1234!
-- ─────────────────────────────────────────────────────────────────────────────

-- Bypass FK constraints so we can insert into auth.users directly
SET session_replication_role = replica;

-- ── Auth Users ────────────────────────────────────────────────────────────────

INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES
  -- Admin
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'admin@aureon.io', crypt('test1234!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Aureon Admin"}',
   FALSE, NOW(), NOW(), '', '', '', ''),

  -- Support agent
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'support@aureon.io', crypt('test1234!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Aureon Support"}',
   FALSE, NOW(), NOW(), '', '', '', ''),

  -- Sellers
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'watchvault@aureon.io', crypt('test1234!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Marcus Breitling"}',
   FALSE, NOW(), NOW(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'prestige@aureon.io', crypt('test1234!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Sophie Aubert"}',
   FALSE, NOW(), NOW(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'arthouse@aureon.io', crypt('test1234!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Darius Chen"}',
   FALSE, NOW(), NOW(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'galerienoir@aureon.io', crypt('test1234!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Isabelle Moreau"}',
   FALSE, NOW(), NOW(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'maisonresell@aureon.io', crypt('test1234!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Alexis Fontaine"}',
   FALSE, NOW(), NOW(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'archiveluxury@aureon.io', crypt('test1234!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Ren Nakamura"}',
   FALSE, NOW(), NOW(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'rarefinds@aureon.io', crypt('test1234!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"James Okafor"}',
   FALSE, NOW(), NOW(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'numismatic@aureon.io', crypt('test1234!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Helena Vasquez"}',
   FALSE, NOW(), NOW(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'lumiere@aureon.io', crypt('test1234!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Céline Dupont"}',
   FALSE, NOW(), NOW(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'tokyodrops@aureon.io', crypt('test1234!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Kenji Watanabe"}',
   FALSE, NOW(), NOW(), '', '', '', ''),

  -- Buyers
  ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'buyer1@aureon.io', crypt('test1234!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Emma Wilson"}',
   FALSE, NOW(), NOW(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'buyer2@aureon.io', crypt('test1234!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Luca Ferretti"}',
   FALSE, NOW(), NOW(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'buyer3@aureon.io', crypt('test1234!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Priya Sharma"}',
   FALSE, NOW(), NOW(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Auth identities (required for email/password login to work locally)
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
SELECT
  id, id,
  jsonb_build_object('sub', id::text, 'email', email),
  'email',
  NOW(), NOW(), NOW()
FROM auth.users
WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000014',
  '00000000-0000-0000-0000-000000000015',
  '00000000-0000-0000-0000-000000000016',
  '00000000-0000-0000-0000-000000000017',
  '00000000-0000-0000-0000-000000000018',
  '00000000-0000-0000-0000-000000000019',
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000031',
  '00000000-0000-0000-0000-000000000032',
  '00000000-0000-0000-0000-000000000033'
)
ON CONFLICT (provider, provider_id) DO NOTHING;

-- Re-enable FK enforcement
SET session_replication_role = DEFAULT;

-- ── Profiles ──────────────────────────────────────────────────────────────────

INSERT INTO public.profiles (id, role, full_name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin',    'Aureon Admin'),
  ('00000000-0000-0000-0000-000000000002', 'support',  'Aureon Support'),
  ('00000000-0000-0000-0000-000000000011', 'seller',   'Marcus Breitling'),
  ('00000000-0000-0000-0000-000000000012', 'seller',   'Sophie Aubert'),
  ('00000000-0000-0000-0000-000000000013', 'seller',   'Darius Chen'),
  ('00000000-0000-0000-0000-000000000014', 'seller',   'Isabelle Moreau'),
  ('00000000-0000-0000-0000-000000000015', 'seller',   'Alexis Fontaine'),
  ('00000000-0000-0000-0000-000000000016', 'seller',   'Ren Nakamura'),
  ('00000000-0000-0000-0000-000000000017', 'seller',   'James Okafor'),
  ('00000000-0000-0000-0000-000000000018', 'seller',   'Helena Vasquez'),
  ('00000000-0000-0000-0000-000000000019', 'seller',   'Céline Dupont'),
  ('00000000-0000-0000-0000-000000000020', 'seller',   'Kenji Watanabe'),
  ('00000000-0000-0000-0000-000000000031', 'customer', 'Emma Wilson'),
  ('00000000-0000-0000-0000-000000000032', 'customer', 'Luca Ferretti'),
  ('00000000-0000-0000-0000-000000000033', 'customer', 'Priya Sharma')
ON CONFLICT (id) DO NOTHING;

-- ── Seller Profiles ───────────────────────────────────────────────────────────

INSERT INTO public.seller_profiles (id, user_id, business_name, description, verified, total_sales, total_revenue, rating, review_count) VALUES
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011',
   'WatchVault Geneva',
   'Premier destination for ultra-rare Swiss horology. Every timepiece comes with full box, papers, and independent authentication.',
   TRUE, 47, 3850000, 4.92, 31),

  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000012',
   'Prestige Horology',
   'Curated selection of investment-grade watches from Patek, AP, and Rolex. Decade of expertise, 100% verified.',
   TRUE, 38, 2640000, 4.87, 25),

  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000013',
   'ArtHouse Collective',
   'Contemporary and modern art by emerging and established artists. Physical certificates included with every piece.',
   TRUE, 22, 890000, 4.78, 18),

  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000014',
   'Galerie Noir',
   'Specialising in post-war and contemporary works. Direct relationships with estates and galleries worldwide.',
   TRUE, 15, 1420000, 4.93, 12),

  ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000015',
   'Maison Resell',
   'Hermès, Chanel, Louis Vuitton — authenticated with Entrupy and real.authentication. Only pristine condition pieces.',
   TRUE, 63, 1980000, 4.81, 49),

  ('a0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000016',
   'Archive Luxury',
   'Fashion archive specialists. Vintage Prada, Balenciaga, Dior, and McQueen. Worn once or deadstock only.',
   FALSE, 11, 320000, 4.64, 9),

  ('a0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000017',
   'Rare Finds Co.',
   'The rarest of the rare. First editions, signed memorabilia, one-of-a-kind artefacts. Provenance documented.',
   TRUE, 29, 740000, 4.76, 22),

  ('a0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000018',
   'The Numismatic',
   'Investment-grade coins, banknotes, and currency. Graded by PCGS and NGC. Portfolio-quality pieces only.',
   TRUE, 55, 610000, 4.88, 41),

  ('a0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000019',
   'Lumière Jewels',
   'Estate and fine jewellery from Cartier, Van Cleef, Tiffany, and Bvlgari. GIA-certified diamonds only.',
   TRUE, 19, 1650000, 4.95, 16),

  ('a0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000020',
   'Tokyo Drops',
   'Exclusive Japanese collectibles: KAWS, Medicom BE@RBRICK, Nike Japan, and limited Harajuku drops.',
   FALSE, 34, 480000, 4.71, 28)
ON CONFLICT (id) DO NOTHING;

-- ── Categories ────────────────────────────────────────────────────────────────

INSERT INTO public.categories (id, name, slug, description, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Watches',       'watches',      'Luxury and investment-grade timepieces',     1),
  ('b0000000-0000-0000-0000-000000000002', 'Fine Art',      'fine-art',     'Original paintings, prints, and sculpture',  2),
  ('b0000000-0000-0000-0000-000000000003', 'Designer',      'designer',     'Authenticated luxury handbags and fashion',  3),
  ('b0000000-0000-0000-0000-000000000004', 'Rare Items',    'rare-items',   'Coins, memorabilia, and curios',             4),
  ('b0000000-0000-0000-0000-000000000005', 'Jewellery',     'jewellery',    'Estate and fine jewellery',                  5),
  ('b0000000-0000-0000-0000-000000000006', 'Collectibles',  'collectibles', 'Limited figures, sneakers, and drops',       6)
ON CONFLICT (id) DO NOTHING;

-- ── Products (50 total) ───────────────────────────────────────────────────────

INSERT INTO public.products (
  id, seller_id, category_id, title, slug, description, condition, status,
  price, original_price, attributes, is_featured, is_trending, view_count, wishlist_count
) VALUES

-- ── Watches: WatchVault Geneva (5) ──────────────────────────────────────────

('c0000000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
 'Patek Philippe Nautilus 5711/1A-010', 'patek-nautilus-5711-1a-010',
 'One of the most coveted references in modern horology. Blue sunburst dial, full set including original box and papers. 2019 production date, pristine condition.',
 'mint', 'active', 8750000, NULL,
 '{"brand":"Patek Philippe","model":"Nautilus","reference":"5711/1A-010","year":2019,"movement":"Automatic Cal. 324 SC","case_material":"Steel","dial":"Blue","diameter_mm":40}',
 TRUE, TRUE, 8420, 312),

('c0000000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
 'Rolex Daytona 116500LN White Dial', 'rolex-daytona-116500ln-white',
 'Ceramic bezel Daytona in steel. White "Panda" dial. Full set, 2021. One of the most liquid watches on the secondary market.',
 'mint', 'active', 3850000, NULL,
 '{"brand":"Rolex","model":"Daytona","reference":"116500LN","year":2021,"movement":"Automatic Cal. 4130","case_material":"Oystersteel","dial":"White","diameter_mm":40}',
 TRUE, FALSE, 5210, 198),

('c0000000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
 'F.P. Journe Chronomètre Bleu', 'fpj-chronometre-bleu',
 'The iconic blue tantalum and brass movement. Annual production under 200 pieces. Direct from collector with original F.P.J. service.',
 'excellent', 'active', 6500000, NULL,
 '{"brand":"F.P. Journe","model":"Chronomètre Bleu","year":2018,"movement":"Manual Cal. 1304","case_material":"Tantalum","dial":"Blue Tantalum","diameter_mm":40}',
 FALSE, TRUE, 3180, 154),

('c0000000-0000-0000-0000-000000000004',
 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
 'Richard Mille RM 11-03 McLaren', 'richard-mille-rm11-03-mclaren',
 'Flyback chronograph with McLaren orange accents. Limited to 500 pieces. Full set, 2020. Titanium case in outstanding condition.',
 'excellent', 'active', 18500000, NULL,
 '{"brand":"Richard Mille","model":"RM 11-03","variant":"McLaren","year":2020,"movement":"Automatic Cal. RHMV3","case_material":"Titanium/Carbon TPT","diameter_mm":49}',
 TRUE, FALSE, 9820, 441),

('c0000000-0000-0000-0000-000000000005',
 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
 'A. Lange & Söhne Datograph Perpetual', 'lange-datograph-perpetual',
 'The pinnacle of German watchmaking. Perpetual calendar with flyback chronograph. Platinum case, 2017. Rare opportunity.',
 'excellent', 'active', 9200000, NULL,
 '{"brand":"A. Lange & Söhne","model":"Datograph Perpetual","reference":"410.025","year":2017,"movement":"Manual Cal. L952.1","case_material":"Platinum","diameter_mm":41}',
 FALSE, FALSE, 2940, 89),

-- ── Watches: Prestige Horology (5) ──────────────────────────────────────────

('c0000000-0000-0000-0000-000000000006',
 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001',
 'Audemars Piguet Royal Oak 15500ST Blue', 'ap-royal-oak-15500st-blue',
 'Jumbo Extra-Thin in steel with blue tapisserie dial. 2022, full set. The most wearable Royal Oak ever made.',
 'mint', 'active', 6200000, NULL,
 '{"brand":"Audemars Piguet","model":"Royal Oak","reference":"15500ST.OO.1220ST.01","year":2022,"movement":"Automatic Cal. 7121","case_material":"Steel","diameter_mm":41}',
 TRUE, TRUE, 7130, 267),

('c0000000-0000-0000-0000-000000000007',
 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001',
 'Patek Philippe Calatrava 5196P Platinum', 'patek-calatrava-5196p',
 'Classic dress watch in platinum. Manual winding, 2016. A timeless heirloom piece with original papers.',
 'very_good', 'active', 3200000, NULL,
 '{"brand":"Patek Philippe","model":"Calatrava","reference":"5196P","year":2016,"movement":"Manual Cal. 215 PS","case_material":"Platinum","diameter_mm":37}',
 FALSE, FALSE, 1820, 64),

('c0000000-0000-0000-0000-000000000008',
 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001',
 'Vacheron Constantin Overseas Dual Time', 'vc-overseas-dual-time',
 'Dual time zone complication in steel, blue dial. 2023, unworn. Includes three interchangeable straps.',
 'mint', 'active', 2850000, NULL,
 '{"brand":"Vacheron Constantin","model":"Overseas Dual Time","reference":"47450/B01A-9226","year":2023,"movement":"Automatic Cal. 5110 DT","case_material":"Steel","diameter_mm":41}',
 FALSE, TRUE, 3490, 112),

('c0000000-0000-0000-0000-000000000009',
 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001',
 'Rolex GMT-Master II 126710BLRO Pepsi', 'rolex-gmt-master-ii-pepsi',
 'The "Pepsi" GMT on Jubilee bracelet. 2022, full set. No waiting list required.',
 'mint', 'active', 1850000, NULL,
 '{"brand":"Rolex","model":"GMT-Master II","reference":"126710BLRO","year":2022,"movement":"Automatic Cal. 3285","case_material":"Oystersteel","bracelet":"Jubilee","diameter_mm":40}',
 FALSE, TRUE, 4720, 183),

('c0000000-0000-0000-0000-000000000010',
 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001',
 'Cartier Santos Large WSSA0018', 'cartier-santos-large-wssa0018',
 'Interchangeable strap system, steel case. 2021. The ultimate everyday luxury sports watch.',
 'excellent', 'active', 850000, NULL,
 '{"brand":"Cartier","model":"Santos","reference":"WSSA0018","year":2021,"movement":"Automatic Cal. 1847 MC","case_material":"Steel","diameter_mm":39.8}',
 FALSE, FALSE, 2140, 97),

-- ── Fine Art: ArtHouse Collective (5) ────────────────────────────────────────

('c0000000-0000-0000-0000-000000000011',
 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002',
 'KAWS "SHARE" Original Painting', 'kaws-share-original-painting',
 'Acrylic on canvas, 48" × 48". Signed and dated verso 2021. COA from the artist's studio. Exhibited at KAWS TOKYO FIRST.',
 'mint', 'active', 28500000, NULL,
 '{"artist":"KAWS","year":2021,"medium":"Acrylic on canvas","dimensions":"48x48 inches","signed":true,"exhibited":true}',
 TRUE, TRUE, 12400, 521),

('c0000000-0000-0000-0000-000000000012',
 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002',
 'Jean-Michel Basquiat "Warrior" Lithograph', 'basquiat-warrior-lithograph',
 'Rare signed lithograph, edition 12/50. Published 1983 by Annina Nosei. Full provenance documentation.',
 'excellent', 'active', 8500000, NULL,
 '{"artist":"Jean-Michel Basquiat","year":1983,"medium":"Lithograph","edition":"12/50","signed":true,"publisher":"Annina Nosei"}',
 TRUE, FALSE, 6320, 218),

('c0000000-0000-0000-0000-000000000013',
 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002',
 'Yayoi Kusama Infinity Net Print', 'kusama-infinity-net-print',
 'Screenprint in colours, 2012, signed in pencil. Edition of 100. Accompanied by Ota Fine Arts COA.',
 'mint', 'active', 3200000, NULL,
 '{"artist":"Yayoi Kusama","year":2012,"medium":"Screenprint","edition":"67/100","signed":true}',
 FALSE, TRUE, 4180, 176),

('c0000000-0000-0000-0000-000000000014',
 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002',
 'George Condo "Portrait of a Man" Oil', 'george-condo-portrait-oil',
 'Oil on linen, 24" × 18". Signed and dated 2019 on reverse. Exhibited at Simon Lee Gallery, London.',
 'mint', 'active', 4800000, NULL,
 '{"artist":"George Condo","year":2019,"medium":"Oil on linen","dimensions":"24x18 inches","signed":true}',
 FALSE, FALSE, 2730, 98),

('c0000000-0000-0000-0000-000000000015',
 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002',
 'Banksy "Girl with Balloon" Print', 'banksy-girl-balloon-print',
 'Signed screen print, red edition. Pest Control COA. One of 150 signed copies. Framed under conservation glass.',
 'mint', 'active', 9500000, NULL,
 '{"artist":"Banksy","year":2004,"medium":"Screen print","edition":"Signed Red Edition","signed":true,"pest_control_coa":true}',
 TRUE, TRUE, 18200, 740),

-- ── Fine Art: Galerie Noir (5) ────────────────────────────────────────────────

('c0000000-0000-0000-0000-000000000016',
 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002',
 'Damien Hirst "Butterfly" Spot Painting', 'hirst-butterfly-spot-painting',
 'Household gloss on canvas, 2002. 48 × 48 inches. Includes Hirst Other Criteria documentation.',
 'excellent', 'active', 6200000, NULL,
 '{"artist":"Damien Hirst","year":2002,"medium":"Household gloss on canvas","dimensions":"48x48 inches"}',
 FALSE, FALSE, 3410, 121),

('c0000000-0000-0000-0000-000000000017',
 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002',
 'Jeff Koons "Balloon Dog" Porcelain', 'koons-balloon-dog-porcelain',
 'Blue porcelain, edition 2298/2300. Unique gift box with COA. From the 2001 collaboration with Bernardaud.',
 'mint', 'active', 5800000, NULL,
 '{"artist":"Jeff Koons","year":2001,"medium":"Limoges porcelain","edition":"2298/2300","color":"Blue"}',
 TRUE, FALSE, 5920, 231),

('c0000000-0000-0000-0000-000000000018',
 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002',
 'Takashi Murakami "Flowers" Canvas Print', 'murakami-flowers-canvas-print',
 'Archival pigment print on canvas, 2020. Edition 48/100. Kaikai Kiki Co., Ltd. COA.',
 'mint', 'active', 1850000, NULL,
 '{"artist":"Takashi Murakami","year":2020,"medium":"Archival pigment print on canvas","edition":"48/100"}',
 FALSE, TRUE, 4820, 192),

-- ── Designer: Maison Resell (6) ───────────────────────────────────────────────

('c0000000-0000-0000-0000-000000000019',
 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003',
 'Hermès Birkin 30 Bleu Électrique Togo', 'hermes-birkin-30-bleu-electrique',
 'Stunning electric blue Togo leather with palladium hardware. Full set with receipt. Authenticated by Entrupy. Grade A condition.',
 'excellent', 'active', 4200000, NULL,
 '{"brand":"Hermès","model":"Birkin 30","color":"Bleu Électrique","leather":"Togo","hardware":"Palladium","year":2022}',
 TRUE, TRUE, 9820, 398),

('c0000000-0000-0000-0000-000000000020',
 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003',
 'Chanel Classic Flap Medium Black Caviar', 'chanel-classic-flap-medium-black',
 'Timeless black caviar leather with gold hardware. Series 30 (2021-22). Includes dustbag, box, and authenticity card.',
 'excellent', 'active', 1050000, NULL,
 '{"brand":"Chanel","model":"Classic Flap","size":"Medium","color":"Black","leather":"Caviar","hardware":"Gold","series":30}',
 FALSE, TRUE, 6340, 254),

('c0000000-0000-0000-0000-000000000021',
 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003',
 'Louis Vuitton Keepall 55 Monogram', 'lv-keepall-55-monogram',
 'Iconic monogram canvas weekend bag. 2020 production. Lightly used, excellent hardware. Comes with lock and keys.',
 'very_good', 'active', 155000, 185000,
 '{"brand":"Louis Vuitton","model":"Keepall Bandoulière 55","canvas":"Monogram","hardware":"Golden Brass","year":2020}',
 FALSE, FALSE, 3210, 127),

('c0000000-0000-0000-0000-000000000022',
 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003',
 'Bottega Veneta Cassette Bag Cobalt', 'bv-cassette-cobalt',
 'Intrecciato weave in cobalt. Daniel Lee-era piece, 2020. Includes dustbag. Interior pristine.',
 'excellent', 'active', 285000, NULL,
 '{"brand":"Bottega Veneta","model":"Cassette","color":"Cobalt","material":"Intrecciato leather","year":2020,"era":"Daniel Lee"}',
 FALSE, TRUE, 4180, 162),

('c0000000-0000-0000-0000-000000000023',
 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003',
 'Hermès Kelly 28 Sellier Rouge Casaque', 'hermes-kelly-28-rouge-casaque',
 'Rare rouge casaque epsom leather with gold hardware. Full set, receipt. 2021. Extremely hard to source at retail.',
 'mint', 'active', 6800000, NULL,
 '{"brand":"Hermès","model":"Kelly 28","style":"Sellier","color":"Rouge Casaque","leather":"Epsom","hardware":"Gold","year":2021}',
 TRUE, FALSE, 7420, 318),

('c0000000-0000-0000-0000-000000000024',
 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003',
 'Dior Lady Dior Medium Pink Python', 'dior-lady-dior-medium-pink-python',
 'Exotic python skin in pale pink with silver hardware. 2019. Perfect statement piece, very lightly used.',
 'excellent', 'active', 850000, NULL,
 '{"brand":"Dior","model":"Lady Dior","size":"Medium","color":"Pale Pink","material":"Python","hardware":"Silver","year":2019}',
 FALSE, FALSE, 2840, 94),

-- ── Designer: Archive Luxury (2) ──────────────────────────────────────────────

('c0000000-0000-0000-0000-000000000025',
 'a0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003',
 'Prada SS2000 Nylon Backpack Black', 'prada-ss2000-nylon-backpack',
 'Iconic Prada Sport nylon from the Spring/Summer 2000 runway. Archive piece in exceptional condition. Minimal wear.',
 'very_good', 'active', 340000, NULL,
 '{"brand":"Prada","model":"Nylon Backpack","season":"SS2000","material":"Nylon","condition_notes":"Archive piece, light patina on hardware"}',
 FALSE, TRUE, 3810, 148),

('c0000000-0000-0000-0000-000000000026',
 'a0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003',
 'Alexander McQueen Skull Scarf Cashmere', 'mcqueen-skull-scarf-cashmere',
 'Original McQueen-era skull print cashmere modal scarf. Tag present. Never worn. 2008.',
 'mint', 'active', 95000, NULL,
 '{"brand":"Alexander McQueen","model":"Skull Scarf","material":"Cashmere Modal","year":2008,"era":"McQueen"}',
 FALSE, FALSE, 1920, 72),

-- ── Rare Items: Rare Finds Co. (5) ───────────────────────────────────────────

('c0000000-0000-0000-0000-000000000027',
 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004',
 'Michael Jordan 1986 Fleer RC PSA 10', 'jordan-1986-fleer-rc-psa10',
 'The holy grail of basketball cards. PSA 10 GEM MINT. Stored in climate-controlled vault. Cert #48291044.',
 'mint', 'active', 18500000, NULL,
 '{"type":"Trading Card","player":"Michael Jordan","year":1986,"set":"Fleer","card_number":"57","grade":"PSA 10","cert_number":"48291044"}',
 TRUE, TRUE, 21400, 890),

('c0000000-0000-0000-0000-000000000028',
 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004',
 'Nike Air Mag 2016 (Self-Lacing) DS', 'nike-air-mag-2016-deadstock',
 'The self-lacing Air Mag from 2016. Charity auction piece. Original packaging, 100% authenticated. StockX verified.',
 'mint', 'active', 9500000, NULL,
 '{"brand":"Nike","model":"Air Mag","year":2016,"size":"US 10","self_lacing":true,"stockx_verified":true}',
 TRUE, TRUE, 15820, 670),

('c0000000-0000-0000-0000-000000000029',
 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004',
 'Beatles "Yesterday and Today" Butcher Cover', 'beatles-butcher-cover-lp',
 'First State mono Butcher cover. Unopened. VG+ sleeve with original inner. One of the most sought-after LPs in existence.',
 'very_good', 'active', 3200000, NULL,
 '{"type":"Vinyl Record","artist":"The Beatles","album":"Yesterday and Today","pressing":"First State Butcher Cover","year":1966,"condition_graded":"VG+"}',
 FALSE, FALSE, 4210, 156),

('c0000000-0000-0000-0000-000000000030',
 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004',
 'Rolex Daytona Paul Newman 6239 Original', 'rolex-daytona-paul-newman-6239',
 'Vintage 1968 Daytona with the iconic "Paul Newman" exotic dial. Unrestored. Service history documented. Stunning patina.',
 'good', 'active', 24000000, NULL,
 '{"brand":"Rolex","model":"Daytona","reference":"6239","year":1968,"dial":"Paul Newman Exotic","condition_notes":"Unrestored, natural patina, all original"}',
 TRUE, FALSE, 11200, 524),

('c0000000-0000-0000-0000-000000000031',
 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004',
 'First Edition "Harry Potter" UK 1997', 'harry-potter-first-edition-1997',
 'True first edition, first printing by Bloomsbury 1997. Original price sticker intact. Fine condition in near-fine jacket.',
 'excellent', 'active', 850000, NULL,
 '{"type":"Book","title":"Harry Potter and the Philosopher''s Stone","author":"J.K. Rowling","publisher":"Bloomsbury","year":1997,"printing":"First Edition, First Printing"}',
 FALSE, FALSE, 2820, 94),

-- ── Rare Items: The Numismatic (3) ────────────────────────────────────────────

('c0000000-0000-0000-0000-000000000032',
 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004',
 '1804 Draped Bust Silver Dollar PCGS MS-63', 'draped-bust-dollar-1804-pcgs',
 'Class I, one of 15 known. PCGS MS-63. The "King of American Coins". Original 1834 diplomatic strike.',
 'mint', 'active', 380000000, NULL,
 '{"type":"Coin","denomination":"Silver Dollar","year":1804,"grade":"PCGS MS-63","class":"I","notes":"Known as King of American Coins"}',
 TRUE, FALSE, 8420, 310),

('c0000000-0000-0000-0000-000000000033',
 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004',
 '1933 Double Eagle NGC MS-65 Presentation', 'double-eagle-1933-ngc-ms65',
 'Freshly graded NGC MS-65. Fully legal presentation strike. The most valuable coin ever sold at auction.',
 'mint', 'active', 1800000000, NULL,
 '{"type":"Coin","denomination":"Double Eagle","year":1933,"grade":"NGC MS-65","notes":"Legal tender presentation strike"}',
 TRUE, FALSE, 14200, 612),

('c0000000-0000-0000-0000-000000000034',
 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004',
 'Ancient Roman Aureus — Nero 64 AD', 'roman-aureus-nero-64ad',
 'Beautifully preserved gold aureus of Emperor Nero, 64 AD. PCGS Ancients MS Strike 5/5, Surface 4/5. Full flan.',
 'excellent', 'active', 4800000, NULL,
 '{"type":"Ancient Coin","denomination":"Aureus","emperor":"Nero","year":"64 AD","grade":"PCGS Ancients MS","strike":"5/5","surface":"4/5"}',
 FALSE, TRUE, 5120, 198),

-- ── Jewellery: Lumière Jewels (7) ─────────────────────────────────────────────

('c0000000-0000-0000-0000-000000000035',
 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005',
 'Cartier Love Bracelet 18k Yellow Gold', 'cartier-love-bracelet-18k-yg',
 'Classic Love bracelet in 18k yellow gold, size 17. Original Cartier box and screwdriver. 2020.',
 'excellent', 'active', 720000, NULL,
 '{"brand":"Cartier","model":"Love Bracelet","metal":"18k Yellow Gold","size":17,"year":2020}',
 FALSE, TRUE, 4820, 192),

('c0000000-0000-0000-0000-000000000036',
 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005',
 'Van Cleef & Arpels Alhambra Necklace 20', 'vca-alhambra-necklace-20',
 'Vintage Alhambra long necklace, 20 motifs, mother-of-pearl in yellow gold. Full set with COA. Rare find.',
 'excellent', 'active', 1450000, NULL,
 '{"brand":"Van Cleef & Arpels","model":"Vintage Alhambra Long Necklace","motifs":20,"material":"Mother of Pearl","metal":"18k Yellow Gold"}',
 TRUE, TRUE, 6820, 278),

('c0000000-0000-0000-0000-000000000037',
 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005',
 '8.5ct Fancy Blue Diamond Ring Plat.', 'fancy-blue-diamond-8ct-platinum',
 'GIA Fancy Blue, VS1, 8.52ct cushion-cut diamond set in platinum. GIA Certificate #5191234812. Investment grade.',
 'mint', 'active', 28000000, NULL,
 '{"type":"Ring","stone":"Diamond","weight_ct":8.52,"color":"Fancy Blue","clarity":"VS1","cut":"Cushion","setting":"Platinum","gia_cert":"5191234812"}',
 TRUE, FALSE, 9420, 384),

('c0000000-0000-0000-0000-000000000038',
 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005',
 'Bvlgari Serpenti Turbogas Bracelet Gold', 'bvlgari-serpenti-turbogas-gold',
 'Iconic Serpenti in 18k rose gold with pavé diamonds. Size medium. Original box. 2019.',
 'excellent', 'active', 1850000, NULL,
 '{"brand":"Bvlgari","model":"Serpenti Turbogas","metal":"18k Rose Gold","details":"Pavé diamonds","size":"M","year":2019}',
 FALSE, FALSE, 2840, 94),

('c0000000-0000-0000-0000-000000000039',
 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005',
 'Mikimoto South Sea Pearl Strand 17"', 'mikimoto-south-sea-pearl-strand',
 '17" strand of Mikimoto South Sea pearls, 13-14mm. Platinum diamond clasp. Unworn with original case and papers.',
 'mint', 'active', 980000, NULL,
 '{"brand":"Mikimoto","type":"Pearl Necklace","length":"17 inches","pearl_size_mm":"13-14","clasp":"Platinum with diamonds"}',
 FALSE, FALSE, 2120, 76),

('c0000000-0000-0000-0000-000000000040',
 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005',
 'Tiffany Schlumberger Platinum Diamond Ring', 'tiffany-schlumberger-platinum-ring',
 'Rare Jean Schlumberger Bird on a Rock ring, 1.8ct D/VS2 center, platinum. Tiffany box. Circa 1975.',
 'excellent', 'active', 3800000, NULL,
 '{"brand":"Tiffany & Co.","designer":"Jean Schlumberger","model":"Bird on a Rock","stone_ct":1.8,"color":"D","clarity":"VS2","metal":"Platinum","circa":"1975"}',
 TRUE, FALSE, 4210, 148),

('c0000000-0000-0000-0000-000000000041',
 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005',
 'Graff Hallucination-Inspired Bracelet', 'graff-multicolour-diamond-bracelet',
 'Multi-coloured fancy diamond bracelet by Graff, inspired by the Hallucination. 16.8ct total weight, 18k white gold.',
 'mint', 'active', 9200000, NULL,
 '{"brand":"Graff","type":"Bracelet","total_ct":16.8,"metal":"18k White Gold","details":"Multi-coloured fancy diamonds"}',
 FALSE, FALSE, 3120, 108),

-- ── Collectibles: Tokyo Drops (7) ─────────────────────────────────────────────

('c0000000-0000-0000-0000-000000000042',
 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000006',
 'KAWS BFF Pink Plush (L) — Original Fake', 'kaws-bff-pink-plush-large',
 'Limited release pink BFF plush, large size. Original Fake label. Unopened in original polybag. Japan exclusive.',
 'mint', 'active', 185000, NULL,
 '{"brand":"KAWS","model":"BFF Plush","size":"Large","color":"Pink","label":"Original Fake","sealed":true}',
 FALSE, TRUE, 5420, 218),

('c0000000-0000-0000-0000-000000000043',
 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000006',
 'Medicom BE@RBRICK KAWS Black & White 1000%', 'medicom-bearbrick-kaws-1000',
 'KAWS × Medicom BE@RBRICK 1000%. Black and white colorway. Opened but never displayed. Box 9/10.',
 'excellent', 'active', 620000, NULL,
 '{"brand":"Medicom Toy","model":"BE@RBRICK","artist":"KAWS","size":"1000%","colorway":"Black & White"}',
 TRUE, TRUE, 8120, 324),

('c0000000-0000-0000-0000-000000000044',
 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000006',
 'Nike SB Dunk Low Travis Scott Jackboys', 'nike-sb-dunk-travis-scott-jackboys',
 'DS in original box. Size US 10. GOAT authenticated. Worn by Travis Scott during the Jackboys album drop event.',
 'mint', 'active', 480000, NULL,
 '{"brand":"Nike","model":"SB Dunk Low","collab":"Travis Scott x Jackboys","size":"US 10","goat_authenticated":true}',
 FALSE, TRUE, 9840, 418),

('c0000000-0000-0000-0000-000000000045',
 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000006',
 'Air Jordan 1 Chicago "Lost & Found" 2022', 'aj1-chicago-lost-found-2022',
 'DS pair, size US 9.5. Includes original "aged" box. SNKRS release, 100% authentic. Highly coveted retro.',
 'mint', 'active', 85000, NULL,
 '{"brand":"Nike","model":"Air Jordan 1 Retro High OG","colorway":"Chicago Lost & Found","year":2022,"size":"US 9.5"}',
 FALSE, FALSE, 6420, 256),

('c0000000-0000-0000-0000-000000000046',
 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000006',
 'Palace Skateboards x Reebok Instapump Fury', 'palace-reebok-instapump-fury',
 'Rare collab, UK size 9. Deadstock in box with extra laces. Palace SS2019 season drop.',
 'mint', 'active', 52000, NULL,
 '{"brand":"Reebok","collab":"Palace Skateboards","model":"Instapump Fury","size":"UK 9","year":2019}',
 FALSE, FALSE, 2810, 92),

('c0000000-0000-0000-0000-000000000047',
 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000006',
 'Pokémon Charizard 1st Ed. PSA 9 — 1999', 'pokemon-charizard-1st-ed-psa9',
 'Base set 1st edition Charizard (4/102). PSA 9 MINT. The most iconic trading card in Pokémon history.',
 'mint', 'active', 2800000, NULL,
 '{"type":"Trading Card","franchise":"Pokémon","card":"Charizard","set":"Base Set","edition":"1st Edition","number":"4/102","grade":"PSA 9","year":1999}',
 TRUE, TRUE, 12400, 521),

('c0000000-0000-0000-0000-000000000048',
 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000006',
 'Supreme × Louis Vuitton Box Logo Tee', 'supreme-lv-box-logo-tee',
 'Supreme × Louis Vuitton SS17 collaboration tee. Size L. Worn once, no damage. Tags removed. Museum-quality piece.',
 'very_good', 'active', 280000, NULL,
 '{"brand":"Supreme","collab":"Louis Vuitton","season":"SS17","type":"T-Shirt","size":"L","condition_notes":"Worn once"}',
 FALSE, TRUE, 4820, 182),

-- ── Extra products: Mixed featured ────────────────────────────────────────────

('c0000000-0000-0000-0000-000000000049',
 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
 'Patek Philippe Aquanaut 5168G White Gold', 'patek-aquanaut-5168g-white-gold',
 'The tropical-vibe sporty Patek. 18k white gold case with khaki composite strap. 2023, full set. Unworn.',
 'mint', 'active', 5200000, NULL,
 '{"brand":"Patek Philippe","model":"Aquanaut","reference":"5168G-010","year":2023,"movement":"Automatic Cal. 324 SC","case_material":"18k White Gold"}',
 TRUE, TRUE, 6140, 234),

('c0000000-0000-0000-0000-000000000050',
 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005',
 'Chopard Happy Diamonds Floating Bracelet', 'chopard-happy-diamonds-floating',
 'Seven floating diamonds in white gold. Iconic kinetic jewel. Original Chopard pouch and box. 2018.',
 'excellent', 'active', 650000, NULL,
 '{"brand":"Chopard","model":"Happy Diamonds","type":"Bracelet","metal":"18k White Gold","floating_diamonds":7,"year":2018}',
 FALSE, FALSE, 2140, 82)

ON CONFLICT (id) DO NOTHING;

-- ── Product Images (primary images via Unsplash/Picsum placeholder URLs) ──────

INSERT INTO public.product_images (product_id, url, alt, sort_order, is_primary) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1548171915-f72d8e2ef7e8?w=800', 'Patek Philippe Nautilus 5711', 0, TRUE),
  ('c0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800', 'Rolex Daytona White', 0, TRUE),
  ('c0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800', 'Audemars Piguet Royal Oak', 0, TRUE),
  ('c0000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800', 'Rolex GMT Pepsi', 0, TRUE),
  ('c0000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=800', 'KAWS Painting', 0, TRUE),
  ('c0000000-0000-0000-0000-000000000019', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', 'Hermès Birkin', 0, TRUE),
  ('c0000000-0000-0000-0000-000000000020', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', 'Chanel Classic Flap', 0, TRUE),
  ('c0000000-0000-0000-0000-000000000027', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800', 'Michael Jordan Card', 0, TRUE),
  ('c0000000-0000-0000-0000-000000000035', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800', 'Cartier Love Bracelet', 0, TRUE),
  ('c0000000-0000-0000-0000-000000000043', 'https://images.unsplash.com/photo-1631134786026-c1f3f8be3f63?w=800', 'KAWS BEARBRICK', 0, TRUE)
ON CONFLICT DO NOTHING;

-- ── Sample Orders ─────────────────────────────────────────────────────────────

INSERT INTO public.orders (id, buyer_id, status, total_amount, platform_fee, stripe_payment_intent_id, stripe_payment_status, shipping_address) VALUES
  ('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000031', 'delivered',
   185000, 18500, 'pi_mock_001', 'succeeded',
   '{"name":"Emma Wilson","line1":"14 Kensington Gardens","city":"London","country":"GB","postal_code":"W8 4PT"}'),

  ('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000032', 'confirmed',
   3850000, 385000, 'pi_mock_002', 'succeeded',
   '{"name":"Luca Ferretti","line1":"Via della Spiga 22","city":"Milan","country":"IT","postal_code":"20121"}'),

  ('d0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000033', 'shipped',
   1050000, 105000, 'pi_mock_003', 'succeeded',
   '{"name":"Priya Sharma","line1":"456 Park Avenue","city":"New York","country":"US","postal_code":"10022"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, product_id, seller_id, title, price, quantity) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000021',
   'a0000000-0000-0000-0000-000000000005', 'Louis Vuitton Keepall 55 Monogram', 155000, 1),

  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000001', 'Rolex Daytona 116500LN White Dial', 3850000, 1),

  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000020',
   'a0000000-0000-0000-0000-000000000005', 'Chanel Classic Flap Medium Black Caviar', 1050000, 1)
ON CONFLICT DO NOTHING;

-- ── Reviews ───────────────────────────────────────────────────────────────────

INSERT INTO public.reviews (product_id, reviewer_id, order_id, rating, title, body) VALUES
  ('c0000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000031',
   'd0000000-0000-0000-0000-000000000001', 5,
   'Impeccable condition and fast shipping',
   'The Keepall arrived exactly as described. Condition is honestly better than I expected. WatchVault packed it beautifully. Will absolutely buy again.'),

  ('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000032',
   'd0000000-0000-0000-0000-000000000002', 5,
   'Authentication on point, stunning watch',
   'Received the Daytona within 3 days. Complete set, pristine case. The independent authentication report included was thorough. Best purchase I have made on any platform.'),

  ('c0000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000033',
   'd0000000-0000-0000-0000-000000000003', 4,
   'Beautiful bag, great seller',
   'The Chanel flap is gorgeous. Maison Resell was communicative throughout and the Entrupy report put my mind at ease. Minus one star only because shipping took a week.')
ON CONFLICT DO NOTHING;

-- ── Support Tickets ───────────────────────────────────────────────────────────

INSERT INTO public.support_tickets (id, user_id, assigned_to, order_id, subject, status, priority) VALUES
  ('e0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000033',
   '00000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003',
   'Shipping tracking not updating', 'in_progress', 'medium'),

  ('e0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000031',
   NULL, NULL,
   'Question about authentication process for sellers', 'open', 'low')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.support_messages (ticket_id, sender_id, body, is_internal) VALUES
  ('e0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000033',
   'Hi, my order was marked shipped 4 days ago but the tracking number shows no movement. Can you help?', FALSE),

  ('e0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
   'Looking into this now — carrier delays in Milan region this week.', TRUE),

  ('e0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
   'Hi Priya, we have confirmed with the carrier — your package is in transit and will arrive within 2 days. Apologies for the delay!', FALSE),

  ('e0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000031',
   'Hello! I am interested in selling on Aureon. What authentication is required for handbags?', FALSE)
ON CONFLICT DO NOTHING;

-- ── Wishlist items ────────────────────────────────────────────────────────────

INSERT INTO public.wishlist_items (user_id, product_id) VALUES
  ('00000000-0000-0000-0000-000000000031', 'c0000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000031', 'c0000000-0000-0000-0000-000000000019'),
  ('00000000-0000-0000-0000-000000000032', 'c0000000-0000-0000-0000-000000000006'),
  ('00000000-0000-0000-0000-000000000033', 'c0000000-0000-0000-0000-000000000036'),
  ('00000000-0000-0000-0000-000000000033', 'c0000000-0000-0000-0000-000000000043')
ON CONFLICT DO NOTHING;

-- ── Newsletter subscribers ────────────────────────────────────────────────────

INSERT INTO public.newsletter_subscribers (email) VALUES
  ('newsletter1@example.com'),
  ('newsletter2@example.com'),
  ('newsletter3@example.com'),
  ('buyer1@aureon.io'),
  ('buyer2@aureon.io')
ON CONFLICT DO NOTHING;
