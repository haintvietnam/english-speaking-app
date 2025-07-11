// Home page specific functionality
document.addEventListener('DOMContentLoaded', function () {
  // Hero section animations
  const heroContent = document.querySelector('.hero-content');
  const heroImage = document.querySelector('.hero-image');

  if (heroContent && heroImage) {
    // Stagger animations
    setTimeout(() => {
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    }, 200);

    setTimeout(() => {
      heroImage.style.opacity = '1';
      heroImage.style.transform = 'translateY(0)';
    }, 600);
  }

  // Feature cards hover effects
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach((card, index) => {
    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-15px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0) scale(1)';
    });

    // Stagger initial animations
    setTimeout(() => {
      card.classList.add('fade-in-up');
    }, 300 + (index * 100));
  });

  // Learning path steps animation
  const steps = document.querySelectorAll('.step');
  steps.forEach((step, index) => {
    step.addEventListener('mouseenter', function () {
      this.style.transform = 'translateX(15px) scale(1.02)';
    });

    step.addEventListener('mouseleave', function () {
      this.style.transform = 'translateX(0) scale(1)';
    });

    // Add click functionality to steps
    step.addEventListener('click', function () {
      const stepNumber = index + 1;
      handleStepClick(stepNumber);
    });
  });

  // Floating card animation
  const floatingCard = document.querySelector('.floating-card');
  if (floatingCard) {
    let mouseX = 0;
    let mouseY = 0;
    let cardX = 0;
    let cardY = 0;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCard() {
      const rect = floatingCard.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (mouseX - centerX) * 0.02;
      const deltaY = (mouseY - centerY) * 0.02;

      cardX += (deltaX - cardX) * 0.1;
      cardY += (deltaY - cardY) * 0.1;

      floatingCard.style.transform = `translateX(${cardX}px) translateY(${cardY}px)`;

      requestAnimationFrame(animateCard);
    }

    animateCard();
  }

  // Statistics counter animation
  const stats = [
    { element: '.students-count', target: 10000, prefix: '', suffix: '+' },
    { element: '.lessons-count', target: 50, prefix: '', suffix: '' },
    { element: '.success-rate', target: 95, prefix: '', suffix: '%' }
  ];

  function animateCounter(element, target, prefix = '', suffix = '') {
    const counter = document.querySelector(element);
    if (!counter) return;

    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = prefix + Math.floor(current) + suffix;
    }, 20);
  }

  // Trigger counter animations when stats section is visible
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stats.forEach(stat => {
            animateCounter(stat.element, stat.target, stat.prefix, stat.suffix);
          });
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statsObserver.observe(statsSection);
  }

  // Dynamic greeting based on time
  const greeting = document.querySelector('.dynamic-greeting');
  if (greeting) {
    const hour = new Date().getHours();
    let greetingText;

    if (hour < 12) {
      greetingText = 'Good morning! Ready to improve your English?';
    } else if (hour < 18) {
      greetingText = 'Good afternoon! Let\'s practice some pronunciation!';
    } else {
      greetingText = 'Good evening! Perfect time for language learning!';
    }

    greeting.textContent = greetingText;
  }

  // Interactive demo button
  const demoButton = document.querySelector('.demo-btn');
  if (demoButton) {
    demoButton.addEventListener('click', function (e) {
      e.preventDefault();
      showInteractiveDemo();
    });
  }

  // Progress indicator for returning users
  displayUserProgress();
});

// Handle learning step clicks
function handleStepClick(stepNumber) {
  const stepActions = {
    1: () => {
      showNotification('Starting with basic sounds...', 'info');
      setTimeout(() => {
        window.location.href = 'theory.html#vowels';
      }, 1500);
    },
    2: () => {
      showNotification('Learning the phonetic alphabet...', 'info');
      setTimeout(() => {
        window.location.href = 'theory.html#ipa';
      }, 1500);
    },
    3: () => {
      showNotification('Understanding word stress...', 'info');
      setTimeout(() => {
        window.location.href = 'theory.html#stress';
      }, 1500);
    },
    4: () => {
      showNotification('Mastering intonation patterns...', 'info');
      setTimeout(() => {
        window.location.href = 'theory.html#intonation';
      }, 1500);
    }
  };

  if (stepActions[stepNumber]) {
    stepActions[stepNumber]();
  }
}

// Show interactive demo
function showInteractiveDemo() {
  const modal = document.createElement('div');
  modal.className = 'demo-modal';
  modal.innerHTML = `
        <div class="demo-content">
            <div class="demo-header">
                <h3>Interactive Pronunciation Demo</h3>
                <button class="close-demo">&times;</button>
            </div>
            <div class="demo-body">
                <p>Try pronouncing this word:</p>
                <div class="demo-word">
                    <span class="word">pronunciation</span>
                    <span class="ipa">/prəˌnʌnsiˈeɪʃən/</span>
                </div>
                <button class="play-demo-btn">
                    <i class="fas fa-play"></i> Hear Pronunciation
                </button>
                <button class="record-demo-btn">
                    <i class="fas fa-microphone"></i> Record Yourself
                </button>
            </div>
        </div>
    `;

  modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

  document.body.appendChild(modal);

  setTimeout(() => {
    modal.style.opacity = '1';
  }, 100);

  // Close modal functionality
  const closeBtn = modal.querySelector('.close-demo');
  closeBtn.addEventListener('click', () => {
    modal.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 300);
  });

  // Demo button functionality
  const playBtn = modal.querySelector('.play-demo-btn');
  const recordBtn = modal.querySelector('.record-demo-btn');

  playBtn.addEventListener('click', () => {
    showNotification('Playing pronunciation...', 'info');
    // Here you would integrate with a text-to-speech API
  });

  recordBtn.addEventListener('click', () => {
    showNotification('Recording feature coming soon!', 'info');
    // Here you would integrate with speech recognition API
  });
}

// Display user progress for returning users
function displayUserProgress() {
  const progress = Progress.init();
  const progressContainer = document.querySelector('.user-progress');

  if (progress.sectionsCompleted.length > 0 && progressContainer) {
    const percentage = Progress.getCompletionPercentage();
    progressContainer.innerHTML = `
            <div class="progress-card">
                <h4>Welcome back!</h4>
                <p>Your progress: ${percentage}% complete</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <a href="theory.html" class="continue-btn">Continue Learning</a>
            </div>
        `;
    progressContainer.style.display = 'block';
  }
}

// Testimonials carousel (if implemented)
function initTestimonialsCarousel() {
  const carousel = document.querySelector('.testimonials-carousel');
  if (!carousel) return;

  const testimonials = carousel.querySelectorAll('.testimonial');
  let currentIndex = 0;

  function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
      testimonial.style.opacity = i === index ? '1' : '0';
      testimonial.style.transform = i === index ? 'translateX(0)' : 'translateX(50px)';
    });
  }

  function nextTestimonial() {
    currentIndex = (currentIndex + 1) % testimonials.length;
    showTestimonial(currentIndex);
  }

  // Auto-rotate testimonials
  setInterval(nextTestimonial, 5000);

  // Initialize first testimonial
  showTestimonial(0);
}

// Initialize testimonials carousel
initTestimonialsCarousel();
