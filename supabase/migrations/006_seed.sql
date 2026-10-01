-- CARTPLUS Initial Seed Data (Categories, Marketplace Settings, Seed Products)
-- PostgreSQL Migration 006

-- 1. SEED CATEGORIES
INSERT INTO public.categories (id, name, slug, description, icon_name, is_active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Electronics', 'electronics', 'Smart consumer gadgets, premium audio, audio gear, and electronic innovations.', 'Headphones', true),
  ('c1000000-0000-0000-0000-000000000002', 'Mobile & Accessories', 'mobile-accessories', 'Smartphones, fast chargers, power banks, cases, and mobile essentials.', 'Smartphone', true),
  ('c1000000-0000-0000-0000-000000000003', 'Computers & Accessories', 'computers-accessories', 'Keyboards, wireless mice, USB hubs, webcams, and workspace productivity gear.', 'Laptop', true),
  ('c1000000-0000-0000-0000-000000000004', 'Home & Living', 'home-living', 'Aesthetic lighting, home organization, decor, and comfort for modern living.', 'Home', true),
  ('c1000000-0000-0000-0000-000000000005', 'Kitchen & Dining', 'kitchen-dining', 'Precision electric kettles, blender sets, food containers, and kitchenware.', 'UtensilsCrossed', true),
  ('c1000000-0000-0000-0000-000000000006', 'Fashion', 'fashion', 'Contemporary everyday apparel, watches, bags, and lifestyle apparel.', 'Shirt', true),
  ('c1000000-0000-0000-0000-000000000007', 'Beauty & Personal Care', 'beauty-personal-care', 'Skincare essentials, grooming kits, organic hair treatments, and personal wellness.', 'Sparkles', true),
  ('c1000000-0000-0000-0000-000000000008', 'Sports & Fitness', 'sports-fitness', 'Resistance bands, gym water bottles, yoga mats, and outdoor sports accessories.', 'Activity', true),
  ('c1000000-0000-0000-0000-000000000009', 'Baby & Kids', 'baby-kids', 'Educational toys, infant feeding sets, gentle care products, and children essentials.', 'Baby', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  is_active = EXCLUDED.is_active;

-- 2. SEED MARKETPLACE SETTINGS
INSERT INTO public.marketplace_settings (key, value, description)
VALUES
  ('delivery_fee', '{"fee": 120, "free_threshold": 3000, "currency": "NPR"}'::jsonb, 'Default delivery fee across Nepal provinces and free delivery threshold'),
  ('commission_rate', '{"default_rate": 5.0, "category_rates": {"electronics": 4.5, "fashion": 7.0}}'::jsonb, 'Platform commission rate percentage per category'),
  ('marketplace_status', '{"is_open": true, "slogan": "MORE CHOICES. MORE VALUE.", "support_phone": "9801122334"}'::jsonb, 'General marketplace configuration')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Note on Initial Admin & Seed Products:
-- 1. To create your first administrator, register via the normal sign-up form in the app,
--    then run the following SQL command in your Supabase SQL Editor:
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
--
-- 2. Initial catalog products can be created by verified sellers or inserted by the admin
--    through the Admin Dashboard or imported via the migration tools.
