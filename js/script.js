// Search box toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.querySelector('.search-btn');
  const searchBox = document.querySelector('.search-box');

  if (!searchBtn || !searchBox) return;

  if (!searchBtn.hasAttribute('type')) searchBtn.type = 'button';
  const innerBtn = searchBox.querySelector('button');
  if (innerBtn && !innerBtn.hasAttribute('type')) innerBtn.type = 'button';

  searchBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    searchBox.classList.toggle('active');
    if (searchBox.classList.contains('active')) {
      const input = searchBox.querySelector('input');
      if (input) input.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchBox.contains(e.target) && !searchBtn.contains(e.target)) {
      searchBox.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') searchBox.classList.remove('active');
  });
});

// Navbar scroll shrink effect
document.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  if (window.innerWidth > 768) {
    if (window.scrollY > 60) {
      navbar.classList.add('shrink');
    } else {
      navbar.classList.remove('shrink');
    }
  }
});

// Artwork gallery scroll buttons (for index.html)
document.addEventListener('DOMContentLoaded', () => {
  const scrollLeft = document.getElementById('artshow-scroll-left');
  const scrollRight = document.getElementById('artshow-scroll-right');
  const gallery = document.getElementById('artshow-gallery');

  if (scrollLeft && scrollRight && gallery) {
    scrollLeft.addEventListener('click', () => {
      gallery.scrollBy({ left: -300, behavior: 'smooth' });
    });

    scrollRight.addEventListener('click', () => {
      gallery.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }
});

// Filter functionality (for artwork.html)
document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const artCards = document.querySelectorAll('.art-card');

  if (filterBtns.length > 0 && artCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        artCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease-out';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
});

// Back to Top Button
document.addEventListener('DOMContentLoaded', () => {
  // Create back to top button if it doesn't exist
  if (!document.querySelector('.back-to-top')) {
    const backToTop = document.createElement('a');
    backToTop.href = '#';
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '↑';
    backToTop.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTop);
  }

  const backToTopBtn = document.querySelector('.back-to-top');

  // Show/hide button on scroll
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  // Scroll to top on click
  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});

// Add fade-in animation to elements on page load
document.addEventListener('DOMContentLoaded', () => {
  const elementsToAnimate = document.querySelectorAll('.gallery-item, .art-card, .team-member, .contact-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('fade-in');
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elementsToAnimate.forEach(element => {
    observer.observe(element);
  });
});

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && href !== '#!') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});

