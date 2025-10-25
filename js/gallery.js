// Gallery Dynamic Product Loading

// Get products from localStorage
function getProducts() {
  const stored = localStorage.getItem('dreamProducts');
  if (stored) {
    return JSON.parse(stored);
  }
  // Default products
  const defaultProducts = [
    {
      id: 1,
      title: "Arabic Calligraphy (Black & White)",
      artist: "Rohan Shahzad",
      artistContact: "923354581567",
      price: "50,000.00",
      category: "Calligraphy",
      image: "images/products/rohan c1 (copy).jpeg",
      description: "An elegant acrylic painting that showcases the beauty of Arabic script through bold black and white strokes.",
      featured: true,
      sold: false
    },
    {
      id: 2,
      title: "Islamic Calligraphy Canvas",
      artist: "Rohan Shahzad",
      artistContact: "923354581567",
      price: "45,000.00",
      category: "Calligraphy",
      image: "images/products/rohan c2 (copy).jpeg",
      description: "A beautiful Islamic calligraphy piece featuring intricate Arabic script on canvas.",
      featured: true,
      sold: false
    },
    {
      id: 3,
      title: "Colorful Calligraphy",
      artist: "Fasih-ur-Rehman",
      artistContact: "923158773306",
      price: "40,000.00",
      category: "Calligraphy",
      image: "images/products/fasih c1.png",
      description: "A stunning display of Arabic calligraphy expertise with vibrant colors.",
      featured: false,
      sold: false
    },
    {
      id: 4,
      title: "Still Life Composition",
      artist: "Ahmad Abbas",
      artistContact: "923279784423",
      price: "35,000.00",
      category: "Still Life",
      image: "images/products/ahmad s1.png",
      description: "A classic still life painting featuring everyday objects.",
      featured: false,
      sold: false
    }
  ];
  localStorage.setItem('dreamProducts', JSON.stringify(defaultProducts));
  return defaultProducts;
}

// Load gallery on artwork page
function loadGallery(filterCategory = 'all', filterArtist = 'all') {
  const galleryContainer = document.getElementById('gallery-container');
  if (!galleryContainer) return;
  
  let products = getProducts();
  
  // Apply filters
  if (filterCategory !== 'all') {
    products = products.filter(p => p.category.toLowerCase() === filterCategory.toLowerCase());
  }
  
  if (filterArtist !== 'all') {
    products = products.filter(p => p.artist.toLowerCase() === filterArtist.toLowerCase());
  }
  
  if (products.length === 0) {
    galleryContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 60px 20px; grid-column: 1 / -1; font-size: 1.1rem;">No artworks match your filters. Try selecting different options.</p>';
    return;
  }
  
  galleryContainer.innerHTML = products.map(product => `
    <article class="art-card" 
             data-category="${product.category.toLowerCase().replace(/\s+/g, '-')}" 
             data-artist="${product.artist.toLowerCase().replace(/\s+/g, '-')}">
      <a href="product.html?id=${product.id}">
        <div class="card-image">
          <img src="${product.image}" alt="${product.title}" loading="lazy">
          ${product.featured ? '<span class="card-badge">Featured</span>' : ''}
        </div>
        <div class="card-info">
          <span class="card-category">${product.category}</span>
          <h3>${product.title}</h3>
          <p class="card-artist">${product.artist}</p>
          <p class="card-price">Rs. ${product.price}</p>
        </div>
      </a>
    </article>
  `).join('');
}

// Generate filter buttons dynamically
function generateFilters() {
  const products = getProducts();
  
  // Get unique categories and artists
  const categories = [...new Set(products.map(p => p.category))];
  const artists = [...new Set(products.map(p => p.artist))];
  
  // Generate category buttons
  const categoryButtons = document.querySelector('[data-filter-type="category"] .filter-buttons');
  if (categoryButtons) {
    categoryButtons.innerHTML = `
      <button class="filter-btn active" data-filter="all">All</button>
      ${categories.map(cat => `
        <button class="filter-btn" data-filter="${cat.toLowerCase()}">${cat}</button>
      `).join('')}
    `;
  }
  
  // Generate artist buttons
  const artistButtons = document.querySelector('[data-filter-type="artist"] .filter-buttons');
  if (artistButtons) {
    artistButtons.innerHTML = `
      <button class="filter-btn active" data-filter="all">All</button>
      ${artists.map(artist => `
        <button class="filter-btn" data-filter="${artist.toLowerCase()}">${artist}</button>
      `).join('')}
    `;
  }
}

// Setup filter functionality
function setupFilters() {
  let activeCategory = 'all';
  let activeArtist = 'all';
  
  // Category filter
  const categoryFilters = document.querySelector('[data-filter-type="category"]');
  if (categoryFilters) {
    categoryFilters.addEventListener('click', function(e) {
      if (e.target.classList.contains('filter-btn')) {
        // Remove active class from siblings
        categoryFilters.querySelectorAll('.filter-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        e.target.classList.add('active');
        
        // Update filter and reload gallery
        activeCategory = e.target.getAttribute('data-filter');
        loadGallery(activeCategory, activeArtist);
      }
    });
  }
  
  // Artist filter
  const artistFilters = document.querySelector('[data-filter-type="artist"]');
  if (artistFilters) {
    artistFilters.addEventListener('click', function(e) {
      if (e.target.classList.contains('filter-btn')) {
        // Remove active class from siblings
        artistFilters.querySelectorAll('.filter-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        e.target.classList.add('active');
        
        // Update filter and reload gallery
        activeArtist = e.target.getAttribute('data-filter');
        loadGallery(activeCategory, activeArtist);
      }
    });
  }
}

// Load featured products on homepage
function loadFeaturedProducts() {
  const featuredContainer = document.getElementById('featured-products');
  if (!featuredContainer) return;
  
  const products = getProducts();
  const featured = products.filter(p => p.featured && !p.sold).slice(0, 4);
  
  if (featured.length === 0) return;
  
  featuredContainer.innerHTML = featured.map(product => `
    <article class="art-card">
      <a href="product.html?id=${product.id}">
        <div class="card-image">
          <img src="${product.image}" alt="${product.title}" loading="lazy">
          <span class="card-badge">Featured</span>
        </div>
        <div class="card-info">
          <span class="card-category">${product.category}</span>
          <h3>${product.title}</h3>
          <p class="card-artist">${product.artist}</p>
          <p class="card-price">Rs. ${product.price}</p>
        </div>
      </a>
    </article>
  `).join('');
}

// Load sold products on homepage
function loadSoldProducts() {
  const soldContainer = document.getElementById('sold-products');
  if (!soldContainer) return;
  
  const products = getProducts();
  const sold = products.filter(p => p.sold).slice(0, 8);
  
  if (sold.length === 0) {
    // Hide the entire sold section if no sold products
    const soldSection = document.querySelector('.sold-section');
    if (soldSection) soldSection.style.display = 'none';
    return;
  }
  
  soldContainer.innerHTML = sold.map(product => `
    <article class="art-card sold-card">
      <div class="sold-overlay">
        <span class="sold-badge">SOLD</span>
      </div>
      <div class="card-image">
        <img src="${product.image}" alt="${product.title}" loading="lazy">
      </div>
      <div class="card-info">
        <span class="card-category">${product.category}</span>
        <h3>${product.title}</h3>
        <p class="card-artist">${product.artist}</p>
        <p class="card-price">Rs. ${product.price}</p>
      </div>
    </article>
  `).join('');
}

// Get reviews from localStorage
function getReviews() {
  const stored = localStorage.getItem('dreamReviews');
  if (stored) {
    return JSON.parse(stored);
  }
  // Default review
  return [
    {
      id: 1,
      name: "Hammad Shahzad",
      image: "images/background/bhai.png",
      text: "Rohan Shahzad, at just 16 years old, is already an incredible artist with a natural talent for creating beautiful, captivating paintings. His work reflects a maturity and creativity well beyond his years, leaving a lasting impression on everyone who views it. The future looks bright for this young prodigy.",
      rating: 5,
      featured: true
    }
  ];
}

// Load testimonials on homepage
function loadTestimonials() {
  const testimonialContainer = document.getElementById('testimonial-content');
  if (!testimonialContainer) return;
  
  const reviews = getReviews();
  const featuredReview = reviews.find(r => r.featured) || reviews[0];
  
  if (!featuredReview) {
    testimonialContainer.innerHTML = '<p style="color: #999; text-align: center;">No reviews yet.</p>';
    return;
  }
  
  testimonialContainer.innerHTML = `
    <img src="${featuredReview.image}" alt="${featuredReview.name} testimonial photo" class="testimonial-img" loading="lazy">
    <blockquote>
      <div class="testimonial-rating">${'⭐'.repeat(featuredReview.rating)}</div>
      <p class="testimonial-text">
        ${featuredReview.text}
      </p>
      <footer>
        <cite class="testimonial-name" id="testimonial-heading">— ${featuredReview.name}</cite>
      </footer>
    </blockquote>
  `;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Generate filters first, then load gallery
  if (document.getElementById('gallery-container')) {
    generateFilters();
    setupFilters();
    loadGallery();
  }
  
  // Load featured products on homepage
  loadFeaturedProducts();
  
  // Load sold products on homepage
  loadSoldProducts();
  
  // Load testimonials on homepage
  loadTestimonials();
});

