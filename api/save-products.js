// Vercel Serverless Function to save products using Supabase
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Initialize Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  try {
    if (req.method === 'POST') {
      // Save/update product
      const product = req.body;
      
      // Validate input
      if (!product || !product.id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid product data' 
        });
      }
      
      // Upsert product (insert or update)
      const { data, error } = await supabase
        .from('products')
        .upsert({
          id: product.id,
          title: product.title,
          artist: product.artist,
          artist_contact: product.artistContact,
          price: product.price,
          category: product.category,
          image: product.image,
          description: product.description,
          featured: product.featured || false,
          sold: product.sold || false,
          bidding_enabled: product.biddingEnabled || false,
          starting_bid: product.startingBid || 5000,
          bid_increment: product.bidIncrement || 500,
          bid_end_date: product.bidEndDate || null,
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      return res.status(200).json({
        success: true,
        message: 'Product saved successfully',
        data: data[0]
      });
      
    } else if (req.method === 'PUT') {
      // Bulk update (save all products at once)
      const { products } = req.body;
      
      if (!products || !Array.isArray(products)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid products data' 
        });
      }
      
      // Transform products to match database schema
      const productsToInsert = products.map(p => ({
        id: p.id,
        title: p.title,
        artist: p.artist,
        artist_contact: p.artistContact,
        price: p.price,
        category: p.category,
        image: p.image,
        description: p.description,
        featured: p.featured || false,
        sold: p.sold || false,
        bidding_enabled: p.biddingEnabled || false,
        starting_bid: p.startingBid || 5000,
        bid_increment: p.bidIncrement || 500,
        bid_end_date: p.bidEndDate || null,
        updated_at: new Date().toISOString()
      }));
      
      // Upsert all products
      const { data, error } = await supabase
        .from('products')
        .upsert(productsToInsert)
        .select();
      
      if (error) {
        throw error;
      }
      
      return res.status(200).json({
        success: true,
        message: 'Products saved successfully',
        count: data.length
      });
      
    } else if (req.method === 'DELETE') {
      // Delete product
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Product ID is required' 
        });
      }
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
      
    } else {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }
    
  } catch (error) {
    console.error('Error saving products:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save products'
    });
  }
}

