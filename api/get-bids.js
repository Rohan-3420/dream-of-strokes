// Vercel Serverless Function to get bids for a product
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
  
  // Initialize Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  try {
    const { productId } = req.query;
    
    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }
    
    // Get all bids for the product, ordered by amount (highest first)
    const { data: bids, error } = await supabase
      .from('bids')
      .select('*')
      .eq('product_id', productId)
      .order('bid_amount', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return res.status(200).json({
      success: true,
      bids: bids || []
    });
    
  } catch (error) {
    console.error('Error getting bids:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get bids'
    });
  }
}

