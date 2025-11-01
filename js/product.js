// Dynamic Product Page JavaScript

// Get product ID from URL
function getProductId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Get products from Supabase API
async function getProducts() {
  try {
    const response = await fetch('/api/get-products');
    if (!response.ok) {
      throw new Error('Failed to load products');
    }
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

// Load product
async function loadProduct() {
  const productId = getProductId();
  
  if (!productId) {
    showNotFound();
    return;
  }
  
  const products = await getProducts();
  const product = products.find(p => p.id == productId);
  
  if (!product) {
    showNotFound();
    return;
  }
  
  displayProduct(product);
  await loadRelatedProducts(product.category, product.id);
}

// Gallery state
let currentImageIndex = 0;
let productImages = [];
let currentProduct = null;
let countdownInterval = null;

// Display product
function displayProduct(product) {
  currentProduct = product;
  
  // Hide loading, show product
  document.getElementById('product-loading').style.display = 'none';
  document.getElementById('product-section').style.display = 'block';
  
  // Update page title
  document.title = `${product.title} - Dream of Strokes`;
  
  // Parse images (comma-separated URLs)
  productImages = product.image.split(',').map(url => url.trim()).filter(url => url);
  currentImageIndex = 0;
  
  // Update product details
  document.getElementById('product-title').textContent = product.title;
  document.getElementById('product-artist-name').textContent = product.artist;
  document.getElementById('product-description').textContent = product.description;
  document.getElementById('product-category-badge').textContent = product.category;
  
  // Show featured badge
  if (product.featured) {
    document.getElementById('product-featured-badge').style.display = 'inline-flex';
  }
  
  // Display price or bidding section
  if (product.biddingEnabled) {
    displayBiddingSection(product);
  } else {
    displayPriceSection(product);
  }
  
  // Setup image gallery
  setupImageGallery();
  
  // WhatsApp link
  updateWhatsAppLink(product);
  
  // Share links
  const pageUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(`Check out this beautiful artwork: ${product.title} by ${product.artist}`);
  
  document.getElementById('share-whatsapp').href = `https://wa.me/?text=${shareText}%20${pageUrl}`;
  document.getElementById('share-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
  document.getElementById('share-twitter').href = `https://twitter.com/intent/tweet?text=${shareText}&url=${pageUrl}`;
  
  // Image zoom
  document.getElementById('product-image').addEventListener('click', function() {
    window.open(this.src, '_blank');
  });
}

// Display fixed price section
function displayPriceSection(product) {
  document.getElementById('price-section').style.display = 'block';
  document.getElementById('bidding-section').style.display = 'none';
  document.getElementById('product-price').textContent = `Rs. ${product.price} PKR`;
}

// Display bidding section
function displayBiddingSection(product) {
  document.getElementById('price-section').style.display = 'none';
  document.getElementById('bidding-section').style.display = 'block';
  
  // Set minimum bid
  const minBid = product.currentBid 
    ? parseFloat(product.currentBid) + parseFloat(product.bidIncrement || 500)
    : parseFloat(product.startingBid || 5000);
  
  // Update current bid display
  const currentBidAmount = product.currentBid || product.startingBid || 5000;
  document.getElementById('current-bid-amount').textContent = `Rs. ${parseFloat(currentBidAmount).toLocaleString()} PKR`;
  
  // Set minimum bid in form
  document.getElementById('bid-amount').min = minBid;
  document.getElementById('min-bid-text').textContent = `Minimum bid: Rs. ${minBid.toLocaleString()}`;
  
  // Setup countdown timer if end date exists
  if (product.bidEndDate) {
    setupCountdownTimer(product.bidEndDate);
  }
  
  // Load and display bids
  loadBids(product.id);
  
  // Setup bid form
  setupBidForm(product);
}

// Setup countdown timer
function setupCountdownTimer(endDate) {
  const timerElement = document.getElementById('bid-timer');
  const timeRemainingElement = document.getElementById('time-remaining');
  
  timerElement.style.display = 'flex';
  
  // Clear existing interval
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  
  function updateCountdown() {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const distance = end - now;
    
    if (distance < 0) {
      clearInterval(countdownInterval);
      timeRemainingElement.textContent = 'Auction Ended';
      document.getElementById('bid-form').style.display = 'none';
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    let timeText = '';
    if (days > 0) timeText += `${days}d `;
    timeText += `${hours}h ${minutes}m ${seconds}s`;
    
    timeRemainingElement.textContent = timeText;
  }
  
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

// Update WhatsApp link based on bidding or fixed price
function updateWhatsAppLink(product) {
  const whatsappLink = document.getElementById('whatsapp-link');
  const whatsappText = document.getElementById('whatsapp-text');
  
  let message;
  if (product.biddingEnabled) {
    message = encodeURIComponent(`Hi! I'm interested in bidding on "${product.title}". Can you provide more details?`);
    whatsappText.textContent = 'Contact About Bidding';
  } else {
    message = encodeURIComponent(`Hi! I'm interested in the "${product.title}" painting. Can you provide more details?`);
    whatsappText.textContent = 'Order via WhatsApp';
  }
  
  whatsappLink.href = `https://wa.me/${product.artistContact}?text=${message}`;
}

// Load bids for a product
async function loadBids(productId) {
  try {
    const response = await fetch(`/api/get-bids?productId=${productId}`);
    const data = await response.json();
    
    if (data.success && data.bids && data.bids.length > 0) {
      const bidCount = document.getElementById('bid-count');
      bidCount.textContent = `${data.bids.length} bid${data.bids.length > 1 ? 's' : ''} placed`;
      
      // Display bid history (top 5)
      displayBidHistory(data.bids.slice(0, 5));
    }
  } catch (error) {
    console.error('Error loading bids:', error);
  }
}

// Display bid history
function displayBidHistory(bids) {
  const historyContainer = document.getElementById('bid-history');
  const historyList = document.getElementById('bid-history-list');
  
  if (bids.length === 0) {
    return;
  }
  
  historyContainer.style.display = 'block';
  
  historyList.innerHTML = bids.map((bid, index) => `
    <div class="bid-item ${index === 0 ? 'highest-bid' : ''}">
      <div class="bid-item-header">
        <span class="bidder-name">
          ${index === 0 ? '<i class="fa-solid fa-crown"></i>' : '<i class="fa-solid fa-user"></i>'}
          ${bid.bidder_name}
        </span>
        <span class="bid-item-amount">Rs. ${parseFloat(bid.bid_amount).toLocaleString()}</span>
      </div>
      <span class="bid-item-time">${formatTimeAgo(bid.created_at)}</span>
    </div>
  `).join('');
}

// Format time ago
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

// Setup bid form
function setupBidForm(product) {
  const form = document.getElementById('bid-form');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const bidderName = document.getElementById('bidder-name').value.trim();
    const bidderContact = document.getElementById('bidder-contact').value.trim();
    const bidAmount = parseFloat(document.getElementById('bid-amount').value);
    
    // Validate contact number
    if (!/^92\d{10}$/.test(bidderContact)) {
      alert('⚠️ Please enter a valid WhatsApp number in format: 923XXXXXXXXX');
      return;
    }
    
    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Placing Bid...';
    
    try {
      const response = await fetch('/api/place-bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product.id,
          bidderName,
          bidderContact,
          bidAmount
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('🎉 Bid placed successfully! We will contact you if you win the auction.');
        
        // Reload product to update current bid
        const products = await getProducts();
        const updatedProduct = products.find(p => p.id == product.id);
        if (updatedProduct) {
          displayBiddingSection(updatedProduct);
          currentProduct = updatedProduct;
        }
        
        // Reset form
        form.reset();
      } else {
        alert('⚠️ ' + result.message);
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      alert('⚠️ Failed to place bid. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-gavel"></i> Place Bid';
    }
  });
}

// Setup image gallery
function setupImageGallery() {
  const mainImage = document.getElementById('product-image');
  const thumbnailsContainer = document.getElementById('image-thumbnails');
  const prevBtn = document.getElementById('prev-image');
  const nextBtn = document.getElementById('next-image');
  
  // Display first image
  updateMainImage();
  
  // If multiple images, show gallery controls
  if (productImages.length > 1) {
    // Show navigation buttons
    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';
    
    // Show thumbnails
    thumbnailsContainer.style.display = 'flex';
    
    // Create thumbnails
    thumbnailsContainer.innerHTML = productImages.map((url, index) => `
      <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
        <img src="${url}" alt="Image ${index + 1}">
      </div>
    `).join('');
    
    // Add thumbnail click handlers
    thumbnailsContainer.querySelectorAll('.thumbnail').forEach(thumb => {
      thumb.addEventListener('click', function() {
        currentImageIndex = parseInt(this.dataset.index);
        updateMainImage();
        updateThumbnails();
      });
    });
    
    // Add navigation handlers
    prevBtn.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
      updateMainImage();
      updateThumbnails();
    });
    
    nextBtn.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex + 1) % productImages.length;
      updateMainImage();
      updateThumbnails();
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
  }
}

// Update main image
function updateMainImage() {
  const mainImage = document.getElementById('product-image');
  mainImage.src = productImages[currentImageIndex];
  mainImage.alt = `Product image ${currentImageIndex + 1}`;
}

// Update thumbnail active state
function updateThumbnails() {
  document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
    thumb.classList.toggle('active', index === currentImageIndex);
  });
}

// Handle keyboard navigation
function handleKeyboardNavigation(e) {
  if (productImages.length <= 1) return;
  
  if (e.key === 'ArrowLeft') {
    document.getElementById('prev-image').click();
  } else if (e.key === 'ArrowRight') {
    document.getElementById('next-image').click();
  }
}

// Show not found
function showNotFound() {
  document.getElementById('product-loading').style.display = 'none';
  document.getElementById('product-not-found').style.display = 'flex';
}

// Load related products
async function loadRelatedProducts(category, currentId) {
  const products = await getProducts();
  const related = products.filter(p => p.category === category && p.id != currentId).slice(0, 3);
  
  if (related.length === 0) {
    return;
  }
  
  document.getElementById('related-products').style.display = 'block';
  
  const grid = document.getElementById('related-products-grid');
  grid.innerHTML = related.map(product => `
    <a href="product.html?id=${product.id}" class="related-card">
      <img src="${product.image}" alt="${product.title}">
      <div class="related-card-content">
        <h3>${product.title}</h3>
        <p class="related-artist">${product.artist}</p>
        <p class="related-price">Rs. ${product.price}</p>
      </div>
    </a>
  `).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', loadProduct);

