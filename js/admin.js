// Admin Panel JavaScript
const ADMIN_PASSWORD = 'Opensimsim';
const PRODUCTS_FILE = 'products.json';

// Check if user is logged in
function checkAuth() {
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  if (isLoggedIn === 'true') {
    showDashboard();
    loadProducts();
  }
}

// Login functionality
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const password = document.getElementById('password-input').value;
  const errorMsg = document.getElementById('login-error');
  
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem('adminLoggedIn', 'true');
    errorMsg.textContent = '';
    showDashboard();
    loadProducts();
  } else {
    errorMsg.textContent = 'Incorrect password. Please try again.';
    document.getElementById('password-input').value = '';
  }
});

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', function() {
  if (confirm('Are you sure you want to logout?')) {
    sessionStorage.removeItem('adminLoggedIn');
    location.reload();
  }
});

// Show dashboard
function showDashboard() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'block';
}

// Load products from JSON file
async function loadProducts() {
  let products = await getProducts();
  displayProducts(products);
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

// Save all products to Supabase (bulk update)
async function saveProducts(products) {
  try {
    const response = await fetch('/api/save-products', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products: products })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save products');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to save products');
    }
    
    return true;
  } catch (error) {
    console.error('Error saving products:', error);
    alert('⚠️ Error saving products: ' + error.message);
    return false;
  }
}

// Save single product to Supabase
async function saveProduct(product) {
  try {
    const response = await fetch('/api/save-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save product');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to save product');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error saving product:', error);
    alert('⚠️ Error saving product: ' + error.message);
    return null;
  }
}

// Display products
function displayProducts(products) {
  const container = document.getElementById('products-list');
  const countElement = document.getElementById('product-count');
  
  countElement.textContent = products.length;
  
  if (products.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No products added yet. Add your first product above!</p>';
    return;
  }
  
  container.innerHTML = products.map(product => {
    const priceDisplay = product.biddingEnabled 
      ? `<div class="auction-badge"><i class="fa-solid fa-gavel"></i> AUCTION</div>
         <p class="product-card-price">Current Bid: Rs. ${product.currentBid ? parseFloat(product.currentBid).toLocaleString() : parseFloat(product.startingBid || 5000).toLocaleString()}</p>`
      : `<p class="product-card-price">Rs. ${product.price}</p>`;
    
    return `
    <div class="product-card" style="position: relative;">
      ${product.featured ? '<div class="featured-badge"><i class="fa-solid fa-star"></i> Featured</div>' : ''}
      ${product.sold ? '<div class="sold-badge-admin"><i class="fa-solid fa-circle-check"></i> SOLD</div>' : ''}
      ${product.biddingEnabled && !product.sold ? '<div class="bidding-badge"><i class="fa-solid fa-gavel"></i> Live Auction</div>' : ''}
      <img src="${product.image}" alt="${product.title}" class="product-card-image" onerror="this.src='images/logo/nav.png'">
      <div class="product-card-content">
        <div class="product-card-header">
          <div>
            <h3 class="product-card-title">${product.title}</h3>
            <p class="product-card-artist">${product.artist}</p>
          </div>
          ${priceDisplay}
        </div>
        <span class="product-card-category">${product.category}</span>
        ${product.sold ? '<span class="product-status sold">✅ SOLD</span>' : '<span class="product-status available">🟢 Available</span>'}
        <p class="product-card-description">${product.description}</p>
        <div class="product-card-actions">
          ${product.biddingEnabled ? `<button onclick="viewBids(${product.id})" class="btn btn-info btn-small">
            <i class="fa-solid fa-list"></i> View Bids
          </button>` : ''}
          <button onclick="editProduct(${product.id})" class="btn btn-primary btn-small">
            <i class="fa-solid fa-edit"></i> Edit
          </button>
          <button onclick="viewProduct(${product.id})" class="btn btn-secondary btn-small">
            <i class="fa-solid fa-eye"></i> View
          </button>
          <button onclick="deleteProduct(${product.id})" class="btn btn-danger btn-small">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

// Track edit mode
let editingProductId = null;

// Toggle bidding options visibility
document.getElementById('product-bidding').addEventListener('change', function() {
  const biddingOptions = document.getElementById('bidding-options');
  biddingOptions.style.display = this.checked ? 'grid' : 'none';
});

// Add or Update product
document.getElementById('product-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const biddingEnabled = document.getElementById('product-bidding').checked;
  
  const productData = {
    id: editingProductId || Date.now(),
    title: document.getElementById('product-title').value,
    artist: document.getElementById('product-artist').value,
    artistContact: document.getElementById('product-contact').value,
    price: document.getElementById('product-price').value,
    category: document.getElementById('product-category').value,
    image: document.getElementById('product-image').value,
    description: document.getElementById('product-description').value,
    featured: document.getElementById('product-featured').checked,
    sold: document.getElementById('product-sold').checked,
    biddingEnabled: biddingEnabled,
    startingBid: biddingEnabled ? document.getElementById('product-starting-bid').value : 5000,
    bidIncrement: biddingEnabled ? document.getElementById('product-bid-increment').value : 500,
    bidEndDate: biddingEnabled ? document.getElementById('product-bid-end-date').value || null : null
  };
  
  let isEditing = editingProductId !== null;
  
  // Save single product to Supabase
  const saved = await saveProduct(productData);
  
  if (saved) {
    alert(isEditing ? 'Product updated successfully! ✅' : 'Product added successfully! ✅');
    
    // Reset editing state
    editingProductId = null;
    document.querySelector('.btn-primary').innerHTML = '<i class="fa-solid fa-plus"></i> Add Product';
    
    // Reload products from database
    const products = await getProducts();
    
    // Update category suggestions
    updateCategorySuggestions(products);
    
    displayProducts(products);
    this.reset();
    
    // Hide bidding options on reset
    document.getElementById('bidding-options').style.display = 'none';
    
    // Scroll to products list
    document.getElementById('products-list').scrollIntoView({ behavior: 'smooth' });
  }
});

// Update category suggestions based on existing products
function updateCategorySuggestions(products) {
  const categories = [...new Set(products.map(p => p.category))];
  const datalist = document.getElementById('category-suggestions');
  datalist.innerHTML = categories.map(cat => `<option value="${cat}">`).join('');
}

// Edit product
async function editProduct(id) {
  const products = await getProducts();
  const product = products.find(p => p.id === id);
  
  if (!product) return;
  
  // Populate form with product data
  document.getElementById('product-title').value = product.title;
  document.getElementById('product-artist').value = product.artist;
  document.getElementById('product-contact').value = product.artistContact;
  document.getElementById('product-price').value = product.price;
  document.getElementById('product-category').value = product.category;
  document.getElementById('product-image').value = product.image;
  document.getElementById('product-description').value = product.description;
  document.getElementById('product-featured').checked = product.featured || false;
  document.getElementById('product-sold').checked = product.sold || false;
  
  // Populate bidding fields
  const biddingEnabled = product.biddingEnabled || false;
  document.getElementById('product-bidding').checked = biddingEnabled;
  if (biddingEnabled) {
    document.getElementById('bidding-options').style.display = 'grid';
    document.getElementById('product-starting-bid').value = product.startingBid || 5000;
    document.getElementById('product-bid-increment').value = product.bidIncrement || 500;
    if (product.bidEndDate) {
      // Convert to local datetime format for input
      const date = new Date(product.bidEndDate);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      document.getElementById('product-bid-end-date').value = localDate.toISOString().slice(0, 16);
    }
  }
  
  // Show image previews if product has images
  if (product.image) {
    const urls = product.image.split(',').map(u => u.trim()).filter(u => u);
    if (urls.length > 0) {
      renderImagePreviews(urls);
      document.getElementById('image-preview-container').style.display = 'block';
    }
  }
  
  // Set edit mode
  editingProductId = id;
  document.querySelector('.btn-primary').innerHTML = '<i class="fa-solid fa-save"></i> Update Product';
  
  // Scroll to form
  document.getElementById('product-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Delete product
async function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      const response = await fetch('/api/save-products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id })
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete product');
      }
      
      // Reload products from database
      const products = await getProducts();
      displayProducts(products);
      alert('Product deleted successfully! ✅');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('⚠️ Error deleting product: ' + error.message);
    }
  }
}

// View product
function viewProduct(id) {
  window.open(`product.html?id=${id}`, '_blank');
}

// View bids for a product
async function viewBids(productId) {
  try {
    const response = await fetch(`/api/get-bids?productId=${productId}`);
    const data = await response.json();
    
    if (!data.success) {
      alert('⚠️ Failed to load bids');
      return;
    }
    
    const bids = data.bids || [];
    const products = await getProducts();
    const product = products.find(p => p.id === productId);
    
    if (bids.length === 0) {
      alert(`ℹ️ No bids placed yet for "${product.title}"`);
      return;
    }
    
    // Create a modal-like display
    let bidsList = `📊 BIDS FOR: ${product.title}\n\n`;
    bidsList += `Current Highest Bid: Rs. ${parseFloat(product.currentBid || product.startingBid).toLocaleString()}\n`;
    bidsList += `Total Bids: ${bids.length}\n\n`;
    bidsList += `=================================\n\n`;
    
    bids.forEach((bid, index) => {
      bidsList += `${index + 1}. ${bid.bidder_name}\n`;
      bidsList += `   Amount: Rs. ${parseFloat(bid.bid_amount).toLocaleString()}\n`;
      bidsList += `   Contact: ${bid.bidder_contact}\n`;
      bidsList += `   Status: ${bid.status === 'active' ? '🏆 WINNING' : '⚪ Outbid'}\n`;
      bidsList += `   Time: ${new Date(bid.created_at).toLocaleString()}\n\n`;
    });
    
    alert(bidsList);
  } catch (error) {
    console.error('Error viewing bids:', error);
    alert('⚠️ Failed to load bids');
  }
}


// Render image previews with primary selection
function renderImagePreviews(urls) {
  const previewGrid = document.getElementById('image-preview-grid');
  previewGrid.innerHTML = '';
  
  urls.forEach((url, index) => {
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'image-preview-item';
    imgWrapper.dataset.url = url;
    
    const img = document.createElement('img');
    img.src = url;
    img.alt = `Preview ${index + 1}`;
    
    // Primary badge
    const primaryBadge = document.createElement('div');
    primaryBadge.className = 'primary-badge' + (index === 0 ? ' active' : '');
    primaryBadge.innerHTML = '<i class="fa-solid fa-star"></i> Primary';
    
    // Set as primary button
    const setPrimaryBtn = document.createElement('button');
    setPrimaryBtn.type = 'button';
    setPrimaryBtn.className = 'set-primary-btn';
    setPrimaryBtn.innerHTML = '<i class="fa-solid fa-star"></i> Set as Primary';
    setPrimaryBtn.style.display = index === 0 ? 'none' : 'block';
    
    setPrimaryBtn.addEventListener('click', function() {
      setAsPrimaryImage(url);
    });
    
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-image-btn';
    removeBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
    removeBtn.title = 'Remove image';
    
    removeBtn.addEventListener('click', function() {
      removeImage(url);
    });
    
    imgWrapper.appendChild(img);
    imgWrapper.appendChild(primaryBadge);
    imgWrapper.appendChild(setPrimaryBtn);
    imgWrapper.appendChild(removeBtn);
    previewGrid.appendChild(imgWrapper);
  });
}

// Set image as primary
function setAsPrimaryImage(url) {
  const imageInput = document.getElementById('product-image');
  const urls = imageInput.value.split(',').map(u => u.trim()).filter(u => u);
  
  // Remove the selected URL and add it to the beginning
  const filteredUrls = urls.filter(u => u !== url);
  const reorderedUrls = [url, ...filteredUrls];
  
  // Update input field
  imageInput.value = reorderedUrls.join(', ');
  
  // Re-render previews
  renderImagePreviews(reorderedUrls);
}

// Remove image from selection
function removeImage(url) {
  const imageInput = document.getElementById('product-image');
  const urls = imageInput.value.split(',').map(u => u.trim()).filter(u => u);
  
  // Remove the URL
  const filteredUrls = urls.filter(u => u !== url);
  
  if (filteredUrls.length === 0) {
    // No images left, hide preview container
    imageInput.value = '';
    document.getElementById('image-preview-container').style.display = 'none';
  } else {
    // Update input field and re-render
    imageInput.value = filteredUrls.join(', ');
    renderImagePreviews(filteredUrls);
  }
}

// Image Upload Functionality
document.getElementById('upload-image-btn').addEventListener('click', function() {
  document.getElementById('product-image-file').click();
});

document.getElementById('product-image-file').addEventListener('change', async function(e) {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const uploadStatus = document.getElementById('upload-status');
  const previewContainer = document.getElementById('image-preview-container');
  const previewGrid = document.getElementById('image-preview-grid');
  
  // Validate all files first
  for (const file of files) {
    if (!validTypes.includes(file.type)) {
      alert(`⚠️ "${file.name}" is not a valid image file (JPG, PNG, GIF, or WEBP)`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(`⚠️ "${file.name}" is too large (max 5MB)`);
      return;
    }
  }
  
  uploadStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading ${files.length} file(s)...`;
  uploadStatus.style.color = '#1e90ff';
  
  const uploadedUrls = [];
  let successCount = 0;
  let failCount = 0;
  
  // Upload each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      uploadStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading ${i + 1}/${files.length}: ${file.name}`;
      
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload to API
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Upload failed');
      }
      
      uploadedUrls.push(result.url);
      successCount++;
      
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      failCount++;
      alert(`⚠️ Failed to upload "${file.name}": ${error.message}`);
    }
  }
  
  // Update UI with results
  if (uploadedUrls.length > 0) {
    // Get existing images
    const imageInput = document.getElementById('product-image');
    const existingUrls = imageInput.value
      ? imageInput.value.split(',').map(u => u.trim()).filter(u => u)
      : [];
    
    // Combine existing and new URLs
    const allUrls = [...existingUrls, ...uploadedUrls];
    
    // Set image URLs in input field (comma-separated for multiple)
    imageInput.value = allUrls.join(', ');
    
    // Show previews with primary selection
    renderImagePreviews(allUrls);
    previewContainer.style.display = 'block';
    
    // Show success message
    if (failCount === 0) {
      uploadStatus.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${successCount} file(s) uploaded!`;
      uploadStatus.style.color = '#28a745';
    } else {
      uploadStatus.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i> ${successCount} uploaded, ${failCount} failed`;
      uploadStatus.style.color = '#ffc107';
    }
    
    setTimeout(() => {
      uploadStatus.innerHTML = '';
    }, 5000);
  } else {
    uploadStatus.innerHTML = '<i class="fa-solid fa-exclamation-circle"></i> All uploads failed';
    uploadStatus.style.color = '#dc3545';
  }
  
  // Clear file input so user can upload same files again if needed
  e.target.value = '';
});

// Initialize
checkAuth();

// Update category suggestions on load
if (sessionStorage.getItem('adminLoggedIn') === 'true') {
  getProducts().then(products => {
    updateCategorySuggestions(products);
  });
}

