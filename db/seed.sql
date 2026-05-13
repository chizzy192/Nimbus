-- =====================================================
-- Nimbus · Demo seed
-- Three Nigerian smallholder farms for the hackathon demo.
-- Run AFTER schema.sql. Run AFTER you have created custodial wallets
-- via /api/farmers/register, or fill stellar_wallet manually.
-- =====================================================

insert into farmers
  (name, phone, latitude, longitude, region, crop_type, farm_size_ha,
   season_start, season_end, drought_threshold_mm, coverage_usdc, premium_usdc, status)
values
  ('Amina Hassan',  '+2348030000001', 12.0000, 8.5200,  'Kano North',    'sorghum', 1.5,
   '2024-03-01', '2024-04-30', 50, 50, 5, 'pending'),
  ('Emeka Okonkwo', '+2348030000002', 9.0765,  7.3986,  'Abuja Central', 'maize',   2.0,
   '2024-03-01', '2024-04-30', 50, 50, 5, 'pending'),
  ('Fatima Musa',   '+2348030000003', 12.9816, 7.6005,  'Katsina',       'millet',  1.0,
   '2024-03-01', '2024-04-30', 50, 50, 5, 'pending')
on conflict do nothing;

-- =====================================================
-- Demo coverage pool
-- =====================================================

insert into coverage_pools
  (name, sponsor_name, region, season_start, season_end, total_usdc, status)
values
  ('Kano 2024 Pilot', 'Nimbus Foundation', 'Kano', '2024-03-01', '2024-04-30', 5000, 'active')
on conflict do nothing;
