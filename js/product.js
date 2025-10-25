// Dynamic Product Page JavaScript

// Get product ID from URL
function getProductId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Get products from localStorage
function getProducts() {
  const stored = localStorage.getItem('dreamProducts');
  if (stored) {
    return JSON.parse(stored);
  }
  // Default products
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

// Load product
function loadProduct() {
  const productId = getProductId();
  
  if (!productId) {
    showNotFound();
    return;
  }
  
  const products = getProducts();
  const product = products.find(p => p.id == productId);
  
  if (!product) {
    showNotFound();
    return;
  }
  
  displayProduct(product);
  loadRelatedProducts(product.category, product.id);
}

// Display product
function displayProduct(product) {
  // Hide loading, show product
  document.getElementById('product-loading').style.display = 'none';
  document.getElementById('product-section').style.display = 'block';
  
  // Update page title
  document.title = `${product.title} - Dream of Strokes`;
  
  // Update product details
  document.getElementById('product-image').src = product.image;
  document.getElementById('product-image').alt = product.title;
  document.getElementById('product-title').textContent = product.title;
  document.getElementById('product-artist-name').textContent = product.artist;
  document.getElementById('product-price').textContent = `Rs. ${product.price} PKR`;
  document.getElementById('product-description').textContent = product.description;
  document.getElementById('product-category-badge').textContent = product.category;
  
  // Show featured badge
  if (product.featured) {
    document.getElementById('product-featured-badge').style.display = 'inline-flex';
  }
  
  // WhatsApp link
  const whatsappMsg = encodeURIComponent(`Hi! I'm interested in the "${product.title}" painting. Can you provide more details?`);
  const whatsappLink = `https://wa.me/${product.artistContact}?text=${whatsappMsg}`;
  document.getElementById('whatsapp-link').href = whatsappLink;
  
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

// Show not found
function showNotFound() {
  document.getElementById('product-loading').style.display = 'none';
  document.getElementById('product-not-found').style.display = 'flex';
}

// Load related products
function loadRelatedProducts(category, currentId) {
  const products = getProducts();
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

