document.addEventListener("DOMContentLoaded", function () {
  // Initialize theory page
  initTheoryNavigation();
  initSoundPlayback();
  initInteractiveElements();
  initProgressTracking();

  // Update progress when page loads
  Progress.updateLastVisited("/theory.html");
});

// Theory navigation functionality
function initTheoryNavigation() {
  const navLinks = document.querySelectorAll(".theory-nav-link");
  const sections = document.querySelectorAll(".theory-section");

  // Handle navigation clicks
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        // Update active navigation
        navLinks.forEach((l) => l.classList.remove("active"));
        this.classList.add("active");

        // Smooth scroll to section
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Highlight section briefly
        targetSection.style.background = "#f0f8ff";
        setTimeout(() => {
          targetSection.style.background = "";
        }, 2000);

        // Track section visit
        Progress.markSectionCompleted(targetId);
      }
    });
  });

  // Update navigation based on scroll position
  const observerOptions = {
    threshold: 0.3,
    rootMargin: "-100px 0px -200px 0px",
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
}

// Sound playback functionality
function initSoundPlayback() {
  const playButtons = document.querySelectorAll(".play-btn");

  playButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const soundId =
        this.getAttribute("onclick")?.match(/playSound\('(.+?)'\)/)?.[1];
      if (soundId) {
        playSound(soundId);
      }
    });
  });
}

// Play sound function (mock implementation - in real app would use audio files or TTS API)
function playSound(soundId) {
  const button = event.target.closest(".play-btn");
  const originalContent = button.innerHTML;

  // Show loading state
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  button.disabled = true;

  // Mock sound playing with setTimeout
  setTimeout(() => {
    button.innerHTML = originalContent;
    button.disabled = false;
    showNotification(`Playing sound: ${soundId}`, "info");
  }, 1000);

  // In a real implementation, you would:
  // 1. Use Web Speech API for text-to-speech
  // 2. Load and play audio files
  // 3. Integrate with pronunciation APIs like Google TTS or similar

  // Example Web Speech API implementation:
  /*
  if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(getExampleWord(soundId));
      utterance.rate = 0.7;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
  }
  */
}

// Get example word for sound ID
function getExampleWord(soundId) {
  const soundMap = {
    ee: "see",
    i: "sit",
    ae: "cat",
    uh: "cup",
    ai: "my",
    au: "now",
    oi: "boy",
    th_voiceless: "think",
    th_voiced: "this",
    r: "red",
    l: "light",
  };
  return soundMap[soundId] || soundId;
}

// Interactive elements functionality
function initInteractiveElements() {
  // Stress word clicking
  initStressExercise();

  // IPA symbol interactions
  initIPAInteractions();

  // Pronunciation tips toggles
  initPronunciationTips();
}

// Stress exercise functionality
function initStressExercise() {
  const stressWords = document.querySelectorAll(".stress-word");

  stressWords.forEach((word) => {
    word.addEventListener("click", function () {
      const correctStress = parseInt(this.dataset.stress);
      const syllables = this.querySelectorAll(".syllable");
      const stressMark = this.querySelector(".stress-mark");

      // Remove previous states
      this.classList.remove("correct", "incorrect");

      // Show stress mark on clicked syllable
      const clickedSyllable = event.target.closest(".syllable");
      if (clickedSyllable) {
        const syllableIndex =
          Array.from(syllables).indexOf(clickedSyllable) + 1;

        // Position stress mark
        stressMark.style.left = clickedSyllable.offsetLeft + "px";
        stressMark.classList.remove("hidden");

        // Check if correct
        if (syllableIndex === correctStress) {
          this.classList.add("correct");
          showNotification("Correct! Well done! 🎉", "success");
        } else {
          this.classList.add("incorrect");
          showNotification(
            "Try again! The stress is on a different syllable.",
            "error"
          );

          // Show correct answer after a delay
          setTimeout(() => {
            this.classList.remove("incorrect");
            const correctSyllable = syllables[correctStress - 1];
            stressMark.style.left = correctSyllable.offsetLeft + "px";
            this.classList.add("correct");
          }, 2000);
        }
      }
    });
  });
}

// Toggle stress visibility
function toggleStress(element) {
  const stressMark = element.querySelector(".stress-mark");
  stressMark.classList.toggle("hidden");
}

// IPA interactions
function initIPAInteractions() {
  const ipaItems = document.querySelectorAll(".ipa-item");

  ipaItems.forEach((item) => {
    item.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px) scale(1.05)";
      this.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.15)";
    });

    item.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
      this.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.05)";
    });

    // Add click to hear pronunciation
    item.addEventListener("click", function () {
      const symbol = this.querySelector(".symbol").textContent;
      const word = this.querySelector(".word").textContent;
      showNotification(`Pronouncing: ${word} [${symbol}]`, "info");

      // Here you would play the actual sound
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.6;
        speechSynthesis.speak(utterance);
      }
    });
  });
}

// Pronunciation tips
function initPronunciationTips() {
  const tips = document.querySelectorAll(".pronunciation-tip");

  tips.forEach((tip) => {
    tip.addEventListener("click", function () {
      this.classList.toggle("expanded");

      // Add more detailed explanation when expanded
      if (this.classList.contains("expanded")) {
        const detailedTip = this.dataset.detailedTip;
        if (detailedTip && !this.querySelector(".detailed-explanation")) {
          const explanation = document.createElement("div");
          explanation.className = "detailed-explanation";
          explanation.innerHTML = `<p>${detailedTip}</p>`;
          this.appendChild(explanation);
        }
      }
    });
  });
}

// Progress tracking for theory sections
function initProgressTracking() {
  const sections = document.querySelectorAll(".theory-section");
  const progressIndicator = createProgressIndicator();

  // Add progress indicator to page
  if (progressIndicator) {
    document.body.appendChild(progressIndicator);
  }

  // Track reading progress
  const readingObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.8) {
          const sectionId = entry.target.id;
          setTimeout(() => {
            Progress.markSectionCompleted(sectionId);
            updateProgressIndicator();
          }, 3000); // Mark as completed after 3 seconds of viewing
        }
      });
    },
    { threshold: 0.8 }
  );

  sections.forEach((section) => {
    readingObserver.observe(section);
  });
}

// Create progress indicator
function createProgressIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "progress-indicator";
  indicator.innerHTML = `
        <div class="progress-content">
            <span class="progress-text">Progress: 0%</span>
            <div class="progress-bar-mini">
                <div class="progress-fill-mini"></div>
            </div>
        </div>
    `;

  indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        border-radius: 25px;
        padding: 10px 15px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        opacity: 0;
        transform: translateY(100%);
        transition: all 0.3s ease;
    `;

  return indicator;
}

// Update progress indicator
function updateProgressIndicator() {
  const indicator = document.querySelector(".progress-indicator");
  const progressText = indicator?.querySelector(".progress-text");
  const progressFill = indicator?.querySelector(".progress-fill-mini");

  if (indicator && progressText && progressFill) {
    const percentage = Progress.getCompletionPercentage();
    progressText.textContent = `Progress: ${percentage}%`;
    progressFill.style.width = `${percentage}%`;

    // Show indicator
    indicator.style.opacity = "1";
    indicator.style.transform = "translateY(0)";

    // Celebrate completion
    if (percentage === 100) {
      showNotification(
        "Congratulations! You've completed all theory sections! 🎉",
        "success"
      );
      indicator.style.background =
        "linear-gradient(135deg, #38b2ac 0%, #319795 100%)";
      progressText.style.color = "white";
    }
  }
}

// Search functionality for theory content
function initTheorySearch() {
  const searchInput = document.getElementById("theory-search");
  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const sections = document.querySelectorAll(".theory-section");

    sections.forEach((section) => {
      const text = section.textContent.toLowerCase();
      const isMatch = text.includes(query);

      section.style.display = isMatch || query === "" ? "block" : "none";

      if (isMatch && query !== "") {
        highlightSearchTerms(section, query);
      } else {
        removeHighlights(section);
      }
    });
  });
}

// Highlight search terms
function highlightSearchTerms(element, query) {
  // This is a simplified implementation
  // In a real app, you'd want a more sophisticated highlighting system
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const textNodes = [];
  let node;

  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }

  textNodes.forEach((textNode) => {
    if (textNode.textContent.toLowerCase().includes(query)) {
      const parent = textNode.parentNode;
      const text = textNode.textContent;
      const regex = new RegExp(`(${query})`, "gi");
      const highlightedText = text.replace(regex, "<mark>$1</mark>");

      const wrapper = document.createElement("span");
      wrapper.innerHTML = highlightedText;
      parent.replaceChild(wrapper, textNode);
    }
  });
}

// Remove highlights
function removeHighlights(element) {
  const marks = element.querySelectorAll("mark");
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    parent.replaceChild(document.createTextNode(mark.textContent), mark);
    parent.normalize();
  });
}

// Initialize search if search input exists
initTheorySearch();
