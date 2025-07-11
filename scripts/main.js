// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function () {
  // Mobile navigation toggle
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }));
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add scroll effect to navbar
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        navbar.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)';
        navbar.style.backdropFilter = 'blur(10px)';
      } else {
        navbar.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        navbar.style.backdropFilter = 'none';
      }
    });
  }

  // Add intersection observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animatedElements = document.querySelectorAll('.feature-card, .step, .theory-card, .info-item');
  animatedElements.forEach(el => {
    observer.observe(el);
  });

  // Loading states for buttons
  function addLoadingState(button) {
    const originalContent = button.innerHTML;
    button.innerHTML = '<span class="loading"></span>';
    button.disabled = true;

    setTimeout(() => {
      button.innerHTML = originalContent;
      button.disabled = false;
    }, 2000);
  }

  // Add click handlers for CTA buttons
  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function (e) {
      if (this.href && !this.href.includes('#')) {
        e.preventDefault();
        addLoadingState(this);
        setTimeout(() => {
          window.location.href = this.href;
        }, 1500);
      }
    });
  });
});

// Utility functions
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;

  if (type === 'success') {
    notification.style.background = 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)';
  } else if (type === 'error') {
    notification.style.background = 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
  } else {
    notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 100);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Local storage utilities
const Storage = {
  set: function (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  },

  get: function (key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return null;
    }
  },

  remove: function (key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  }
};

// Progress tracking
const Progress = {
  init: function () {
    const progress = Storage.get('speakEasyProgress') || {
      sectionsCompleted: [],
      lastVisited: null,
      totalTimeSpent: 0
    };
    return progress;
  },

  markSectionCompleted: function (sectionId) {
    const progress = this.init();
    if (!progress.sectionsCompleted.includes(sectionId)) {
      progress.sectionsCompleted.push(sectionId);
      Storage.set('speakEasyProgress', progress);
      showNotification('Section completed! 🎉', 'success');
    }
  },

  updateLastVisited: function (page) {
    const progress = this.init();
    progress.lastVisited = {
      page: page,
      timestamp: new Date().toISOString()
    };
    Storage.set('speakEasyProgress', progress);
  },

  getCompletionPercentage: function () {
    const progress = this.init();
    const totalSections = 8; // Total number of theory sections
    return Math.round((progress.sectionsCompleted.length / totalSections) * 100);
  }
};

// Initialize progress tracking
if (typeof window !== 'undefined') {
  Progress.updateLastVisited(window.location.pathname);
}
