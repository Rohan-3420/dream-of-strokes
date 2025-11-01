-- Supabase Database Schema for Dream of Strokes
-- Run this in your Supabase SQL Editor

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  artist_contact TEXT NOT NULL,
  price TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  sold BOOLEAN DEFAULT FALSE,
  bidding_enabled BOOLEAN DEFAULT FALSE,
  starting_bid NUMERIC DEFAULT 5000,
  current_bid NUMERIC DEFAULT NULL,
  bid_increment NUMERIC DEFAULT 500,
  bid_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on featured products for faster queries
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- Create index on sold products for faster queries
CREATE INDEX IF NOT EXISTS idx_products_sold ON products(sold);ok 

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Create index on artist for filtering
CREATE INDEX IF NOT EXISTS idx_products_artist ON products(artist);

-- Create index on bidding enabled products
CREATE INDEX IF NOT EXISTS idx_products_bidding ON products(bidding_enabled);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  bidder_name TEXT NOT NULL,
  bidder_contact TEXT NOT NULL,
  bid_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'active', -- active, outbid, won, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on product_id for faster bid lookups
CREATE INDEX IF NOT EXISTS idx_bids_product_id ON bids(product_id);

-- Create index on bid_amount for sorting
CREATE INDEX IF NOT EXISTS idx_bids_amount ON bids(bid_amount DESC);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON products
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated insert/update/delete
-- For now, we'll allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations" ON products
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policies for bids table
CREATE POLICY "Allow public read access to bids" ON bids
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to bids" ON bids
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all operations on bids" ON bids
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for product images
-- Note: This needs to be done via Supabase Dashboard
-- Go to Storage → Create bucket → Name: "product-images" → Public: YES

-- Storage bucket policies (run after creating bucket)
-- Allow public read access to images
-- Allow authenticated upload (you can adjust this)

-- Insert sample data from products.json
INSERT INTO products (id, title, artist, artist_contact, price, category, image, description, featured, sold)
VALUES 
  (1, 'Arabic Calligraphy (Black & White)', 'Rohan Shahzad', '923354581567', '50,000.00', 'Calligraphy', 'images/products/rohan c1 (copy).jpeg', 'An elegant acrylic painting that showcases the beauty of Arabic script through bold black and white strokes. The artwork highlights the rhythm and flow of traditional calligraphy, creating a stunning visual statement that celebrates Islamic art and cultural heritage.', true, false),
  (2, 'Islamic Calligraphy Canvas', 'Rohan Shahzad', '923354581567', '45,000.00', 'Calligraphy', 'images/products/rohan c2 (copy).jpeg', 'A beautiful Islamic calligraphy piece featuring intricate Arabic script on canvas. This artwork combines traditional calligraphic techniques with contemporary styling.', true, false),
  (3, 'Arabic Script Art', 'Fasih-ur-Rehman', '923158773306', '40,000.00', 'Calligraphy', 'images/products/fasih c1.png', 'A stunning display of Arabic calligraphy expertise. This piece showcases the artistic beauty of Islamic script with precision and elegance.', false, false),
  (4, 'Still Life Composition', 'Ahmad Abbas', '923279784423', '35,000.00', 'Still Life', 'images/products/ahmad s1.png', 'A classic still life painting featuring everyday objects arranged with artistic precision. The use of light and shadow creates depth and dimension.', false, false)
ON CONFLICT (id) DO NOTHING;

