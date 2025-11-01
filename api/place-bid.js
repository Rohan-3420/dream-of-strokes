// Vercel Serverless Function to place a bid on a product
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
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
    const { productId, bidderName, bidderContact, bidAmount } = req.body;
    
    // Validate input
    if (!productId || !bidderName || !bidderContact || !bidAmount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if bidding is enabled
    if (!product.bidding_enabled) {
      return res.status(400).json({
        success: false,
        message: 'Bidding is not enabled for this product'
      });
    }
    
    // Check if product is sold
    if (product.sold) {
      return res.status(400).json({
        success: false,
        message: 'This product has already been sold'
      });
    }
    
    // Check if bidding has ended
    if (product.bid_end_date && new Date(product.bid_end_date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Bidding has ended for this product'
      });
    }
    
    // Validate bid amount
    const minBid = product.current_bid 
      ? parseFloat(product.current_bid) + parseFloat(product.bid_increment)
      : parseFloat(product.starting_bid);
    
    if (parseFloat(bidAmount) < minBid) {
      return res.status(400).json({
        success: false,
        message: `Bid amount must be at least Rs. ${minBid.toLocaleString()}`
      });
    }
    
    // Insert bid
    const { data: newBid, error: bidError } = await supabase
      .from('bids')
      .insert({
        product_id: productId,
        bidder_name: bidderName,
        bidder_contact: bidderContact,
        bid_amount: bidAmount,
        status: 'active'
      })
      .select()
      .single();
    
    if (bidError) {
      throw bidError;
    }
    
    // Update previous bids to "outbid" status
    await supabase
      .from('bids')
      .update({ status: 'outbid' })
      .eq('product_id', productId)
      .neq('id', newBid.id)
      .eq('status', 'active');
    
    // Update product's current bid
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        current_bid: bidAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);
    
    if (updateError) {
      throw updateError;
    }
    
    return res.status(200).json({
      success: true,
      message: 'Bid placed successfully!',
      bid: newBid
    });
    
  } catch (error) {
    console.error('Error placing bid:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to place bid'
    });
  }
}

