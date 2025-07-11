// Progress page functionality
document.addEventListener('DOMContentLoaded', function () {
  loadProgressData();
  updateProgressDisplay();
  setupProgressInteractions();
});

function loadProgressData() {
  const progress = Progress.init();
  updateOverallProgress(progress);
  updateCompletedSections(progress);
  updateLearningStats(progress);
  updateNextSteps(progress);
}

function updateOverallProgress(progress) {
  const percentage = Progress.getCompletionPercentage();
  const circle = document.querySelector('.circle-progress');
  const percentageText = document.querySelector('.percentage');
  const progressMessage = document.getElementById('progress-message');

  if (circle && percentageText) {
    // Animate progress circle
    const degrees = (percentage / 100) * 360;
    circle.style.setProperty('--progress-deg', `${degrees}deg`);

    // Animate percentage text
    animateNumber(percentageText, 0, percentage, 1500);

    // Update progress message
    if (progressMessage) {
      const messages = {
        0: "Start your learning journey by exploring the theory section!",
        25: "Great start! You're building a solid foundation.",
        50: "Halfway there! Keep up the excellent work!",
        75: "Almost done! You're doing amazing!",
        100: "Congratulations! You've mastered all the theory sections! 🎉"
      };

      const messageKey = Object.keys(messages)
        .reverse()
        .find(key => percentage >= parseInt(key));

      progressMessage.textContent = messages[messageKey];

      if (percentage === 100) {
        progressMessage.style.color = '#38b2ac';
        progressMessage.style.fontWeight = '600';
      }
    }
  }
}

function updateCompletedSections(progress) {
  const sectionsContainer = document.getElementById('completed-sections');
  if (!sectionsContainer) return;

  const sections = [
    { id: 'phonetics', name: 'Phonetics Basics', icon: 'fas fa-atom' },
    { id: 'vowels', name: 'Vowel Sounds', icon: 'fas fa-circle' },
    { id: 'consonants', name: 'Consonant Sounds', icon: 'fas fa-square' },
    { id: 'ipa', name: 'IPA Symbols', icon: 'fas fa-language' },
    { id: 'stress', name: 'Word Stress', icon: 'fas fa-weight-hanging' },
    { id: 'intonation', name: 'Intonation Patterns', icon: 'fas fa-music' },
    { id: 'connected-speech', name: 'Connected Speech', icon: 'fas fa-link' },
    { id: 'common-problems', name: 'Common Problems', icon: 'fas fa-exclamation-triangle' }
  ];

  sectionsContainer.innerHTML = sections.map(section => {
    const isCompleted = progress.sectionsCompleted.includes(section.id);
    return `
            <div class="section-item ${isCompleted ? 'completed' : ''}" data-section="${section.id}">
                <i class="${section.icon}"></i>
                <div class="section-content">
                    <h5 style="margin: 0; color: #2d3748;">${section.name}</h5>
                    <p style="margin: 0; font-size: 0.8rem; color: #4a5568;">
                        ${isCompleted ? 'Completed ✓' : 'Not started'}
                    </p>
                </div>
            </div>
        `;
  }).join('');

  // Add click handlers for navigation
  sectionsContainer.querySelectorAll('.section-item').forEach(item => {
    item.addEventListener('click', function () {
      const sectionId = this.dataset.section;
      window.location.href = `theory.html#${sectionId}`;
    });

    item.style.cursor = 'pointer';
  });
}

function updateLearningStats(progress) {
  // Update sections read
  const sectionsRead = document.getElementById('sections-read');
  if (sectionsRead) {
    const completed = progress.sectionsCompleted.length;
    sectionsRead.textContent = `${completed} / 8`;

    // Animate the number
    animateNumber(sectionsRead, 0, completed, 1000, ' / 8');
  }

  // Update time spent (mock calculation)
  const timeSpent = document.getElementById('time-spent');
  if (timeSpent) {
    const estimatedTime = progress.sectionsCompleted.length * 15; // 15 min per section
    timeSpent.textContent = `${estimatedTime} min`;

    if (estimatedTime > 0) {
      animateNumber(timeSpent, 0, estimatedTime, 1200, ' min');
    }
  }

  // Update last visit
  const lastVisit = document.getElementById('last-visit');
  if (lastVisit && progress.lastVisited) {
    const visitDate = new Date(progress.lastVisited.timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - visitDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      lastVisit.textContent = 'Today';
    } else if (diffDays === 1) {
      lastVisit.textContent = 'Yesterday';
    } else if (diffDays < 7) {
      lastVisit.textContent = `${diffDays} days ago`;
    } else {
      lastVisit.textContent = visitDate.toLocaleDateString();
    }
  }
}

function updateNextSteps(progress) {
  const nextStepsContainer = document.getElementById('next-steps');
  if (!nextStepsContainer) return;

  const allSections = [
    'phonetics', 'vowels', 'consonants', 'ipa',
    'stress', 'intonation', 'connected-speech', 'common-problems'
  ];

  const nextSection = allSections.find(section =>
    !progress.sectionsCompleted.includes(section)
  );

  let nextSteps = [];

  if (progress.sectionsCompleted.length === 0) {
    nextSteps = [
      {
        icon: 'fas fa-play',
        title: 'Start with Phonetics Basics',
        description: 'Learn the fundamentals of speech sounds and how they are produced.',
        link: 'theory.html#phonetics'
      },
      {
        icon: 'fas fa-volume-up',
        title: 'Explore Vowel Sounds',
        description: 'Master the English vowel system and pronunciation patterns.',
        link: 'theory.html#vowels'
      }
    ];
  } else if (progress.sectionsCompleted.length < 4) {
    nextSteps = [
      {
        icon: 'fas fa-forward',
        title: `Continue with ${nextSection ? getSectionName(nextSection) : 'Next Section'}`,
        description: 'Keep building your pronunciation foundation.',
        link: nextSection ? `theory.html#${nextSection}` : 'theory.html'
      },
      {
        icon: 'fas fa-redo',
        title: 'Review Previous Sections',
        description: 'Reinforce your learning by revisiting completed sections.',
        link: 'theory.html'
      }
    ];
  } else if (progress.sectionsCompleted.length < 8) {
    nextSteps = [
      {
        icon: 'fas fa-flag',
        title: 'Finish Theory Sections',
        description: 'Complete the remaining theory sections to master all concepts.',
        link: nextSection ? `theory.html#${nextSection}` : 'theory.html'
      },
      {
        icon: 'fas fa-microphone',
        title: 'Prepare for Practice',
        description: 'Get ready to apply your knowledge with speaking exercises.',
        link: 'practice.html'
      }
    ];
  } else {
    nextSteps = [
      {
        icon: 'fas fa-trophy',
        title: 'Start Speaking Practice',
        description: 'Put your knowledge to work with interactive speaking exercises.',
        link: 'practice.html'
      },
      {
        icon: 'fas fa-sync',
        title: 'Review and Reinforce',
        description: 'Keep your skills sharp by reviewing theory sections regularly.',
        link: 'theory.html'
      }
    ];
  }

  nextStepsContainer.innerHTML = nextSteps.map(step => `
        <div class="next-step" onclick="window.location.href='${step.link}'">
            <i class="${step.icon}"></i>
            <div class="next-step-content">
                <h4>${step.title}</h4>
                <p>${step.description}</p>
            </div>
        </div>
    `).join('');
}

function getSectionName(sectionId) {
  const sectionNames = {
    'phonetics': 'Phonetics Basics',
    'vowels': 'Vowel Sounds',
    'consonants': 'Consonant Sounds',
    'ipa': 'IPA Symbols',
    'stress': 'Word Stress',
    'intonation': 'Intonation Patterns',
    'connected-speech': 'Connected Speech',
    'common-problems': 'Common Problems'
  };
  return sectionNames[sectionId] || 'Next Section';
}

function animateNumber(element, start, end, duration, suffix = '') {
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (end - start) * easeOutQuart);

    element.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = end + suffix;
    }
  }

  requestAnimationFrame(update);
}

function updateProgressDisplay() {
  // Add visual enhancements to the progress display
  const progressCards = document.querySelectorAll('.card');
  progressCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';

    setTimeout(() => {
      card.style.transition = 'all 0.6s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 200);
  });
}

function setupProgressInteractions() {
  // Add hover effects to section items
  const sectionItems = document.querySelectorAll('.section-item');
  sectionItems.forEach(item => {
    item.addEventListener('mouseenter', function () {
      if (!this.classList.contains('completed')) {
        this.style.background = '#e2e8f0';
        this.style.transform = 'translateX(5px)';
      }
    });

    item.addEventListener('mouseleave', function () {
      if (!this.classList.contains('completed')) {
        this.style.background = '#f8fafc';
        this.style.transform = 'translateX(0)';
      }
    });
  });

  // Add achievement celebration
  const completedSections = Progress.init().sectionsCompleted.length;
  if (completedSections > 0) {
    setTimeout(() => {
      showAchievementNotification(completedSections);
    }, 2000);
  }
}

function showAchievementNotification(sectionsCompleted) {
  const achievements = {
    1: { title: "First Steps! 👶", message: "You've completed your first section!" },
    3: { title: "Getting Started! 🚀", message: "Three sections down, keep going!" },
    5: { title: "Halfway Hero! 🏆", message: "You're more than halfway there!" },
    8: { title: "Theory Master! 🎓", message: "Congratulations! All theory sections completed!" }
  };

  const achievement = achievements[sectionsCompleted];
  if (achievement) {
    const notification = document.createElement('div');
    notification.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 2rem;
                border-radius: 15px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 10000;
                opacity: 0;
                transition: all 0.5s ease;
            ">
                <h3 style="margin-bottom: 1rem; font-size: 1.5rem;">${achievement.title}</h3>
                <p style="margin: 0; opacity: 0.9;">${achievement.message}</p>
            </div>
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.firstElementChild.style.opacity = '1';
      notification.firstElementChild.style.transform = 'translate(-50%, -50%) scale(1.05)';
    }, 100);

    setTimeout(() => {
      notification.firstElementChild.style.opacity = '0';
      notification.firstElementChild.style.transform = 'translate(-50%, -50%) scale(0.95)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  }
}

// Export progress data function
function exportProgress() {
  const progress = Progress.init();
  const data = {
    ...progress,
    exportDate: new Date().toISOString(),
    completionPercentage: Progress.getCompletionPercentage()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'speakeasy-progress.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification('Progress data exported successfully!', 'success');
}

// Reset progress function (for testing/demo purposes)
function resetProgress() {
  if (confirm('Are you sure you want to reset all your progress? This action cannot be undone.')) {
    Storage.remove('speakEasyProgress');
    showNotification('Progress reset successfully!', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }
}
