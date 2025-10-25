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

// Load products from localStorage (simulating backend)
function loadProducts() {
  let products = getProducts();
  displayProducts(products);
}

// Get products from localStorage
function getProducts() {
  const stored = localStorage.getItem('dreamProducts');
  if (stored) {
    return JSON.parse(stored);
  }
  // Initial products
  return [
    {
      id: 1,
      title: "Arabic Calligraphy (Black & White)",
      artist: "Rohan Shahzad",
      artistContact: "923354581567",
      price: "50,000.00",
      category: "Calligraphy",
      image: "images/products/rohan c1 (copy).jpeg",
      description: "An elegant acrylic painting that showcases the beauty of Arabic script through bold black and white strokes. The artwork highlights the rhythm and flow of traditional calligraphy, creating a stunning visual statement that celebrates Islamic art and cultural heritage.",
      featured: true
    },
    {
      id: 2,
      title: "Islamic Calligraphy Canvas",
      artist: "Rohan Shahzad",
      artistContact: "923354581567",
      price: "45,000.00",
      category: "Calligraphy",
      image: "images/products/rohan c2 (copy).jpeg",
      description: "A beautiful Islamic calligraphy piece featuring intricate Arabic script on canvas. This artwork combines traditional calligraphic techniques with contemporary styling.",
      featured: true
    },
    {
      id: 3,
      title: "Colorful Calligraphy Art",
      artist: "Fasih-ur-Rehman",
      artistContact: "923158773306",
      price: "40,000.00",
      category: "Calligraphy",
      image: "images/products/fasih c1.png",
      description: "A stunning display of Arabic calligraphy expertise. This piece showcases the artistic beauty of Islamic script with precision and elegance.",
      featured: false
    },
    {
      id: 4,
      title: "Still Life Composition",
      artist: "Ahmad Abbas",
      artistContact: "923279784423",
      price: "35,000.00",
      category: "Still Life",
      image: "images/products/ahmad s1.png",
      description: "A classic still life painting featuring everyday objects arranged with artistic precision. The use of light and shadow creates depth and dimension.",
      featured: false
    }
  ];
}

// Save products to localStorage
function saveProducts(products) {
  localStorage.setItem('dreamProducts', JSON.stringify(products));
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
  
  container.innerHTML = products.map(product => `
    <div class="product-card" style="position: relative;">
      ${product.featured ? '<div class="featured-badge"><i class="fa-solid fa-star"></i> Featured</div>' : ''}
      ${product.sold ? '<div class="sold-badge-admin"><i class="fa-solid fa-circle-check"></i> SOLD</div>' : ''}
      <img src="${product.image}" alt="${product.title}" class="product-card-image" onerror="this.src='images/logo/nav.png'">
      <div class="product-card-content">
        <div class="product-card-header">
          <div>
            <h3 class="product-card-title">${product.title}</h3>
            <p class="product-card-artist">${product.artist}</p>
          </div>
          <p class="product-card-price">Rs. ${product.price}</p>
        </div>
        <span class="product-card-category">${product.category}</span>
        ${product.sold ? '<span class="product-status sold">✅ SOLD</span>' : '<span class="product-status available">🟢 Available</span>'}
        <p class="product-card-description">${product.description}</p>
        <div class="product-card-actions">
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
  `).join('');
}

// Track edit mode
let editingProductId = null;

// Add or Update product
document.getElementById('product-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const productData = {
    title: document.getElementById('product-title').value,
    artist: document.getElementById('product-artist').value,
    artistContact: document.getElementById('product-contact').value,
    price: document.getElementById('product-price').value,
    category: document.getElementById('product-category').value,
    image: document.getElementById('product-image').value,
    description: document.getElementById('product-description').value,
    featured: document.getElementById('product-featured').checked,
    sold: document.getElementById('product-sold').checked
  };
  
  let products = getProducts();
  
  if (editingProductId) {
    // Update existing product
    const index = products.findIndex(p => p.id === editingProductId);
    if (index !== -1) {
      products[index] = { ...products[index], ...productData };
      alert('Product updated successfully! ✅');
    }
    editingProductId = null;
    document.querySelector('.btn-primary').innerHTML = '<i class="fa-solid fa-plus"></i> Add Product';
  } else {
    // Add new product
    const newProduct = {
      id: Date.now(),
      ...productData
    };
    products.push(newProduct);
    alert('Product added successfully! ✅');
  }
  
  saveProducts(products);
  
  // Update category suggestions
  updateCategorySuggestions(products);
  
  displayProducts(products);
  this.reset();
  
  // Scroll to products list
  document.getElementById('products-list').scrollIntoView({ behavior: 'smooth' });
});

// Update category suggestions based on existing products
function updateCategorySuggestions(products) {
  const categories = [...new Set(products.map(p => p.category))];
  const datalist = document.getElementById('category-suggestions');
  datalist.innerHTML = categories.map(cat => `<option value="${cat}">`).join('');
}

// Edit product
function editProduct(id) {
  const products = getProducts();
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
  
  // Set edit mode
  editingProductId = id;
  document.querySelector('.btn-primary').innerHTML = '<i class="fa-solid fa-save"></i> Update Product';
  
  // Scroll to form
  document.getElementById('product-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Delete product
function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    let products = getProducts();
    products = products.filter(p => p.id !== id);
    saveProducts(products);
    displayProducts(products);
    alert('Product deleted successfully! ✅');
  }
}

// View product
function viewProduct(id) {
  window.open(`product.html?id=${id}`, '_blank');
}

// ==================== REVIEWS MANAGEMENT ====================

// Get reviews from localStorage
function getReviews() {
  const stored = localStorage.getItem('dreamReviews');
  if (stored) {
    return JSON.parse(stored);
  }
  // Default reviews
  const defaultReviews = [
    {
      id: 1,
      name: "Hammad Shahzad",
      image: "images/background/bhai.png",
      text: "Rohan Shahzad, at just 16 years old, is already an incredible artist with a natural talent for creating beautiful, captivating paintings. His work reflects a maturity and creativity well beyond his years, leaving a lasting impression on everyone who views it. The future looks bright for this young prodigy.",
      rating: 5,
      featured: true
    }
  ];
  localStorage.setItem('dreamReviews', JSON.stringify(defaultReviews));
  return defaultReviews;
}

// Save reviews to localStorage
function saveReviews(reviews) {
  localStorage.setItem('dreamReviews', JSON.stringify(reviews));
}

// Display reviews in admin panel
function displayReviews(reviews) {
  const container = document.getElementById('reviews-list');
  if (!container) return;
  
  if (reviews.length === 0) {
    container.innerHTML = '<p class="empty-state">No reviews yet. Add your first review above!</p>';
    return;
  }
  
  container.innerHTML = reviews.map(review => `
    <div class="review-card">
      ${review.featured ? '<div class="featured-badge"><i class="fa-solid fa-star"></i> Featured</div>' : ''}
      <div class="review-card-header">
        <img src="${review.image}" alt="${review.name}" class="review-avatar" onerror="this.src='images/logo/nav.png'">
        <div class="review-info">
          <h3>${review.name}</h3>
          <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
        </div>
      </div>
      <p class="review-text">"${review.text}"</p>
      <div class="review-actions">
        <button onclick="editReview(${review.id})" class="btn btn-primary btn-small">
          <i class="fa-solid fa-edit"></i> Edit
        </button>
        <button onclick="deleteReview(${review.id})" class="btn btn-danger btn-small">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Track edit mode for reviews
let editingReviewId = null;

// Add or Update review
document.getElementById('review-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const reviewData = {
    name: document.getElementById('review-name').value,
    image: document.getElementById('review-image').value,
    text: document.getElementById('review-text').value,
    rating: parseInt(document.getElementById('review-rating').value),
    featured: document.getElementById('review-featured').checked
  };
  
  let reviews = getReviews();
  
  if (editingReviewId) {
    // Update existing review
    const index = reviews.findIndex(r => r.id === editingReviewId);
    if (index !== -1) {
      reviews[index] = { ...reviews[index], ...reviewData };
      alert('Review updated successfully! ✅');
    }
    editingReviewId = null;
    document.querySelector('.review-submit-btn').innerHTML = '<i class="fa-solid fa-plus"></i> Add Review';
  } else {
    // Add new review
    const newReview = {
      id: Date.now(),
      ...reviewData
    };
    reviews.push(newReview);
    alert('Review added successfully! ✅');
  }
  
  saveReviews(reviews);
  displayReviews(reviews);
  this.reset();
});

// Edit review
function editReview(id) {
  const reviews = getReviews();
  const review = reviews.find(r => r.id === id);
  
  if (!review) return;
  
  // Populate form with review data
  document.getElementById('review-name').value = review.name;
  document.getElementById('review-image').value = review.image;
  document.getElementById('review-text').value = review.text;
  document.getElementById('review-rating').value = review.rating;
  document.getElementById('review-featured').checked = review.featured || false;
  
  // Set edit mode
  editingReviewId = id;
  document.querySelector('.review-submit-btn').innerHTML = '<i class="fa-solid fa-save"></i> Update Review';
  
  // Scroll to form
  document.getElementById('review-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Delete review
function deleteReview(id) {
  if (confirm('Are you sure you want to delete this review?')) {
    let reviews = getReviews();
    reviews = reviews.filter(r => r.id !== id);
    saveReviews(reviews);
    displayReviews(reviews);
    alert('Review deleted successfully! ✅');
  }
}

// Initialize
checkAuth();

// Update category suggestions on load
if (sessionStorage.getItem('adminLoggedIn') === 'true') {
  const products = getProducts();
  updateCategorySuggestions(products);
  
  // Load reviews
  const reviews = getReviews();
  displayReviews(reviews);
}

