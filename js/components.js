// Load Header and Footer Components with Animations
(function() {
  // Load CSS file dynamically
  function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  // Function to load HTML component
  async function loadComponent(elementId, filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Failed to load ${filePath}`);
      const html = await response.text();
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = html;
      }
    } catch (error) {
      console.error(`Error loading component: ${error.message}`);
    }
  }

  // Function to set active navigation link
  function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Remove active class from all links
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });
    
    // Add active class to current page
    if (currentPage === 'index.html' || currentPage === '') {
      const homeLink = document.getElementById('nav-home');
      if (homeLink) {
        homeLink.classList.add('active');
        homeLink.setAttribute('aria-current', 'page');
      }
    } else if (currentPage === 'artwork.html') {
      const artworkLink = document.getElementById('nav-artwork');
      if (artworkLink) {
        artworkLink.classList.add('active');
        artworkLink.setAttribute('aria-current', 'page');
      }
    } else if (currentPage === 'about.html') {
      const aboutLink = document.getElementById('nav-about');
      if (aboutLink) {
        aboutLink.classList.add('active');
        aboutLink.setAttribute('aria-current', 'page');
      }
    } else if (currentPage === 'contact.html') {
      const contactLink = document.getElementById('nav-contact');
      if (contactLink) {
        contactLink.classList.add('active');
        contactLink.setAttribute('aria-current', 'page');
      }
    }
  }

  // Load components when DOM is ready
  document.addEventListener('DOMContentLoaded', async function() {
    // Load animations CSS
    loadCSS('css/header-animations.css');
    
    // Load components
    await loadComponent('header-placeholder', 'includes/header.html');
    await loadComponent('footer-placeholder', 'includes/footer.html');
    
    // Set active navigation after header is loaded
    setTimeout(setActiveNav, 100);
    
    const navbar = document.querySelector('.navbar');
    const menuToggle = navbar ? navbar.querySelector('.menu-toggle') : null;
    const navDrawer = document.getElementById('site-menu');
    const navClose = navbar ? navbar.querySelector('.nav-close') : null;
    const navOverlay = navbar ? navbar.querySelector('.nav-overlay') : null;
    const navLinks = navbar ? navbar.querySelectorAll('.nav-links a') : [];

    // Add scroll effect to navbar
    if (navbar) {
      const handleScroll = () => {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      };

      handleScroll();
      window.addEventListener('scroll', handleScroll);
    }

    function setMenuState(isOpen) {
      if (!navbar) return;
      navbar.classList.toggle('is-open', isOpen);
      document.body.classList.toggle('no-scroll', isOpen);

      if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', String(isOpen));
      }

      if (navDrawer) {
        navDrawer.setAttribute('aria-hidden', String(!isOpen));
      }

      if (navOverlay) {
        navOverlay.hidden = !isOpen;
        navOverlay.setAttribute('aria-hidden', String(!isOpen));
      }
    }

    function openMenu() {
      setMenuState(true);
    }

    function closeMenu({ restoreFocus = true } = {}) {
      if (!navbar || !navbar.classList.contains('is-open')) return;
      setMenuState(false);
      if (restoreFocus && menuToggle) {
        menuToggle.focus({ preventScroll: true });
      }
    }

    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        const isOpen = navbar ? navbar.classList.contains('is-open') : false;
        if (isOpen) {
          closeMenu({ restoreFocus: false });
        } else {
          openMenu();
        }
      });
    }

    if (navClose) {
      navClose.addEventListener('click', () => closeMenu());
    }

    if (navOverlay) {
      navOverlay.addEventListener('click', () => closeMenu());
    }

    if (navLinks.length > 0) {
      navLinks.forEach(link => {
        link.addEventListener('click', () => closeMenu({ restoreFocus: false }));
      });
    }

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 850) {
        closeMenu({ restoreFocus: false });
      }
    });
  });
})();
