// Voice Chatbot with Multiple AI Assistant Integration
class VoiceChatbot {
  constructor() {
    this.initElements();
    this.initState();
    this.setupEventListeners();
    this.setupAudio();
    this.setupSpeechRecognition();
    this.setupSpeechSynthesis();
    this.setupAIAssistants();
  }

  initElements() {
    this.micBtn = document.querySelector("#mic");
    this.callBtn = document.querySelector("#callBtn");
    this.speakerBtn = document.querySelector("#speakerBtn");
    this.settingsBtn = document.querySelector("#settingsBtn");
    this.chatDisplay = document.querySelector("#chatDisplay");
    this.statusDisplay = document.querySelector("#statusDisplay");
    this.playback = document.querySelector("#playback");
    this.aiSelect = document.querySelector("#aiSelect");
    this.settingsPanel = document.querySelector("#settingsPanel");
  }

  initState() {
    this.canRecord = false;
    this.isRecording = false;
    this.isOnCall = false;
    this.isMuted = false;
    this.recorder = null;
    this.chunks = [];
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.currentUtterance = null;
    this.currentAI = 'local'; // 'local', 'openai', 'azure', 'alan'
    this.aiConfig = {
      openai: { apiKey: null, model: 'gpt-3.5-turbo' },
      azure: { speechKey: null, region: null },
      alan: { key: null }
    };
  }

  setupAIAssistants() {
    // Setup multiple AI assistant options
    this.setupLocalAI();
    this.setupOpenAI();
    this.setupAzureAI();
    this.setupAlanAI();
  }

  setupEventListeners() {
    this.micBtn.addEventListener("click", () => this.toggleMic());
    this.callBtn.addEventListener("click", () => this.toggleCall());
    this.speakerBtn.addEventListener("click", () => this.toggleSpeaker());

    // Settings panel events
    const settingsBtn = document.querySelector("#settingsBtn");
    const settingsPanel = document.querySelector("#settingsPanel");
    const saveSettingsBtn = document.querySelector("#saveSettings");
    const aiSelect = document.querySelector("#aiSelect");

    settingsBtn.addEventListener("click", () => {
      settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
    });

    saveSettingsBtn.addEventListener("click", () => this.saveSettings());
    aiSelect.addEventListener("change", (e) => this.switchAI(e.target.value));

    // Load saved settings
    this.loadSettings();
  }

  saveSettings() {
    const openaiKey = document.querySelector("#openaiKey").value;
    const azureKey = document.querySelector("#azureKey").value;
    const azureRegion = document.querySelector("#azureRegion").value;
    const alanKey = document.querySelector("#alanKey").value;

    if (openaiKey) localStorage.setItem('openai-api-key', openaiKey);
    if (azureKey) localStorage.setItem('azure-speech-key', azureKey);
    if (azureRegion) localStorage.setItem('azure-region', azureRegion);
    if (alanKey) localStorage.setItem('alan-key', alanKey);

    // Reconfigure AI assistants
    this.setupAIAssistants();

    this.addMessage("Settings saved successfully! AI assistants reconfigured.", 'bot');
    document.querySelector("#settingsPanel").style.display = 'none';
  }

  loadSettings() {
    const openaiKey = localStorage.getItem('openai-api-key');
    const azureKey = localStorage.getItem('azure-speech-key');
    const azureRegion = localStorage.getItem('azure-region');
    const alanKey = localStorage.getItem('alan-key');

    if (openaiKey) document.querySelector("#openaiKey").value = openaiKey;
    if (azureKey) document.querySelector("#azureKey").value = azureKey;
    if (azureRegion) document.querySelector("#azureRegion").value = azureRegion;
    if (alanKey) document.querySelector("#alanKey").value = alanKey;
  }

  setupAudio() {
    console.log("Setting up audio...");
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => this.setupStream(stream))
        .catch((err) => {
          console.error("Audio setup error:", err);
          this.updateStatus("Error: Microphone access denied");
        });
    } else {
      this.updateStatus("Error: Audio not supported");
    }
  }

  setupStream(stream) {
    this.recorder = new MediaRecorder(stream);
    this.recorder.ondataavailable = (e) => {
      this.chunks.push(e.data);
    };
    this.recorder.onstop = (e) => {
      const blob = new Blob(this.chunks, { type: "audio/ogg; codecs=opus" });
      this.chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      this.playback.src = audioURL;
      // Process the recorded audio here if needed
    };

    this.canRecord = true;
    this.updateStatus("Ready to listen...");
  }

  setupSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new SpeechRecognition();
    }

    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.updateStatus("Listening...", "listening");
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.addMessage(transcript, 'user');
        this.processUserInput(transcript);
      };

      this.recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        this.updateStatus("Error: " + event.error);
        this.stopRecording();
      };

      this.recognition.onend = () => {
        this.stopRecording();
      };
    } else {
      console.warn("Speech recognition not supported");
    }
  }

  setupSpeechSynthesis() {
    // Wait for voices to be loaded
    if (this.synthesis.getVoices().length === 0) {
      this.synthesis.onvoiceschanged = () => {
        console.log("Voices loaded");
      };
    }
  }

  toggleMic() {
    if (!this.canRecord) return;

    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    if (this.recognition) {
      this.isRecording = true;
      this.micBtn.classList.add("is-recording");
      this.recognition.start();
    } else if (this.recorder) {
      // Fallback to audio recording
      this.isRecording = true;
      this.micBtn.classList.add("is-recording");
      this.recorder.start();
      this.updateStatus("Recording...", "listening");
    }
  }

  stopRecording() {
    this.isRecording = false;
    this.micBtn.classList.remove("is-recording");

    if (this.recognition) {
      this.recognition.stop();
    }
    if (this.recorder && this.recorder.state === 'recording') {
      this.recorder.stop();
    }

    this.updateStatus(this.isOnCall ? "On call - Click mic to speak" : "Ready to listen...");
  }

  toggleCall() {
    this.isOnCall = !this.isOnCall;

    if (this.isOnCall) {
      this.callBtn.classList.add("on-call");
      this.callBtn.querySelector('.material-icons').textContent = 'call_end';
      this.updateStatus("Call started - Voice chatbot is live!");
      this.addMessage("Call started! I'm now listening continuously. You can speak at any time.", 'bot');
      this.speak("Call started! I'm now listening continuously. You can speak at any time.");
    } else {
      this.callBtn.classList.remove("on-call");
      this.callBtn.querySelector('.material-icons').textContent = 'phone';
      this.updateStatus("Call ended");
      this.addMessage("Call ended. Click the microphone to continue chatting.", 'bot');
      this.speak("Call ended");
    }
  }

  toggleSpeaker() {
    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      this.speakerBtn.classList.add("muted");
      this.speakerBtn.querySelector('.material-icons').textContent = 'volume_off';
      this.synthesis.cancel(); // Stop any current speech
      this.updateStatus("Speaker muted");
    } else {
      this.speakerBtn.classList.remove("muted");
      this.speakerBtn.querySelector('.material-icons').textContent = 'volume_up';
      this.updateStatus(this.isOnCall ? "On call - Speaker unmuted" : "Ready to listen...");
    }
  }

  processUserInput(input) {
    this.updateStatus("Processing...", "processing");

    // Route to appropriate AI assistant
    switch (this.currentAI) {
      case 'openai':
        this.processWithOpenAI(input);
        break;
      case 'azure':
        this.processWithAzure(input);
        break;
      case 'alan':
        this.processWithAlan(input);
        break;
      default:
        this.processWithLocalAI(input);
    }
  }

  // Local AI Processing (your existing logic)
  processWithLocalAI(input) {
    setTimeout(() => {
      const response = this.generateResponse(input);
      this.addMessage(response, 'bot');
      this.speak(response);
    }, 1000);
  }

  // OpenAI Integration
  async processWithOpenAI(input) {
    if (!this.aiConfig.openai.apiKey) {
      this.addMessage("OpenAI API key not configured. Using local responses.", 'bot');
      this.processWithLocalAI(input);
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.aiConfig.openai.apiKey}`
        },
        body: JSON.stringify({
          model: this.aiConfig.openai.model,
          messages: [
            {
              role: "system",
              content: "You are a helpful English learning assistant. Keep responses conversational and educational."
            },
            { role: "user", content: input }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      this.addMessage(aiResponse, 'bot');
      this.speak(aiResponse);
    } catch (error) {
      console.error('OpenAI API error:', error);
      this.addMessage("Sorry, I'm having trouble connecting to my AI brain. Let me use my basic responses.", 'bot');
      this.processWithLocalAI(input);
    }
  }

  // Azure Cognitive Services Integration
  async processWithAzure(input) {
    if (!this.aiConfig.azure.speechKey) {
      this.addMessage("Azure services not configured. Using local responses.", 'bot');
      this.processWithLocalAI(input);
      return;
    }

    try {
      // Use Azure Text Analytics for sentiment and key phrases
      const response = await fetch(`https://${this.aiConfig.azure.region}.api.cognitive.microsoft.com/text/analytics/v3.1/sentiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': this.aiConfig.azure.speechKey
        },
        body: JSON.stringify({
          documents: [{ id: "1", text: input, language: "en" }]
        })
      });

      const data = await response.json();
      const sentiment = data.documents[0].sentiment;

      let aiResponse = this.generateContextualResponse(input, sentiment);
      this.addMessage(aiResponse, 'bot');
      this.speak(aiResponse);
    } catch (error) {
      console.error('Azure API error:', error);
      this.processWithLocalAI(input);
    }
  }

  // Alan AI Integration
  processWithAlan(input) {
    if (window.alanBtn) {
      // Send to Alan AI for processing
      window.alanBtn.callProjectApi("processUserInput", { text: input }, (error, result) => {
        if (error) {
          console.error('Alan AI error:', error);
          this.processWithLocalAI(input);
        } else {
          this.addMessage(result.response, 'bot');
          this.speak(result.response);
        }
      });
    } else {
      this.addMessage("Alan AI not initialized. Using local responses.", 'bot');
      this.processWithLocalAI(input);
    }
  }

  // Setup methods for each AI service
  setupLocalAI() {
    // Your existing local AI is already set up
    console.log("Local AI ready");
  }

  setupOpenAI() {
    // OpenAI setup - requires API key
    const apiKey = localStorage.getItem('openai-api-key');
    if (apiKey) {
      this.aiConfig.openai.apiKey = apiKey;
      console.log("OpenAI configured");
    }
  }

  setupAzureAI() {
    // Azure setup - requires subscription key and region
    const speechKey = localStorage.getItem('azure-speech-key');
    const region = localStorage.getItem('azure-region');
    if (speechKey && region) {
      this.aiConfig.azure.speechKey = speechKey;
      this.aiConfig.azure.region = region;
      console.log("Azure AI configured");
    }
  }

  setupAlanAI() {
    // Alan AI setup - requires project key
    const alanKey = localStorage.getItem('alan-key');
    if (alanKey && !window.alanBtn) {
      const script = document.createElement('script');
      script.src = 'https://studio.alan.app/web/lib/alan_lib.min.js';
      script.onload = () => {
        window.alanBtn = window.alanBtn({
          key: alanKey,
          onCommand: (commandData) => {
            if (commandData.command === 'respond') {
              this.addMessage(commandData.text, 'bot');
              this.speak(commandData.text);
            }
          }
        });
        console.log("Alan AI configured");
      };
      document.head.appendChild(script);
    }
  }

  // Enhanced response generation with context
  generateContextualResponse(input, sentiment = 'neutral') {
    const responses = this.generateResponse(input);

    // Add sentiment-based modifiers
    if (sentiment === 'positive') {
      return `That's wonderful! ${responses}`;
    } else if (sentiment === 'negative') {
      return `I understand you might be feeling frustrated. ${responses} Is there anything specific I can help you with?`;
    }

    return responses;
  }

  // Method to switch AI assistants
  switchAI(aiType) {
    this.currentAI = aiType;
    this.addMessage(`Switched to ${aiType} assistant mode.`, 'bot');
    this.updateStatus(`Using ${aiType} AI assistant`);
  } generateResponse(input) {
    // Simple chatbot responses - you can integrate with AI APIs here
    const responses = {
      greeting: [
        "Hello! How can I help you today?",
        "Hi there! What would you like to talk about?",
        "Greetings! I'm here to assist you."
      ],
      weather: [
        "I don't have access to current weather data, but I'd suggest checking a weather app!",
        "For weather information, you might want to check your local weather service."
      ],
      time: [
        `The current time is ${new Date().toLocaleTimeString()}.`,
        `It's ${new Date().toLocaleTimeString()} right now.`
      ],
      default: [
        "That's interesting! Tell me more.",
        "I understand. How can I help you with that?",
        "Thanks for sharing that with me.",
        "That's a great point. What else would you like to discuss?",
        "I'm here to help. What specific information do you need?"
      ]
    };

    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return this.getRandomResponse(responses.greeting);
    } else if (lowerInput.includes('weather') || lowerInput.includes('rain') || lowerInput.includes('sunny')) {
      return this.getRandomResponse(responses.weather);
    } else if (lowerInput.includes('time') || lowerInput.includes('clock')) {
      return this.getRandomResponse(responses.time);
    } else {
      return this.getRandomResponse(responses.default);
    }
  }

  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  speak(text) {
    if (this.isMuted) return;

    this.updateStatus("Speaking...", "speaking");

    if (this.currentUtterance) {
      this.synthesis.cancel();
    }

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.rate = 0.9;
    this.currentUtterance.pitch = 1;
    this.currentUtterance.volume = 0.8;

    // Try to use a female voice if available
    const voices = this.synthesis.getVoices();
    const femaleVoice = voices.find(voice =>
      voice.name.includes('Female') ||
      voice.name.includes('Samantha') ||
      voice.name.includes('Karen') ||
      voice.name.includes('Zira')
    );
    if (femaleVoice) {
      this.currentUtterance.voice = femaleVoice;
    }

    this.currentUtterance.onend = () => {
      this.updateStatus(this.isOnCall ? "On call - Click mic to speak" : "Ready to listen...");

      // If on call, automatically start listening again
      if (this.isOnCall && !this.isRecording) {
        setTimeout(() => {
          this.startRecording();
        }, 500);
      }
    };

    this.synthesis.speak(this.currentUtterance);
  }

  addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const speakerSpan = document.createElement('span');
    speakerSpan.className = 'speaker';
    speakerSpan.textContent = sender === 'user' ? '👤 You:' : '🤖 Assistant:';

    const textSpan = document.createElement('span');
    textSpan.className = 'text';
    textSpan.textContent = text;

    messageDiv.appendChild(speakerSpan);
    messageDiv.appendChild(textSpan);

    this.chatDisplay.appendChild(messageDiv);
    this.chatDisplay.scrollTop = this.chatDisplay.scrollHeight;
  }

  updateStatus(message, className = '') {
    this.statusDisplay.textContent = message;
    this.statusDisplay.className = 'status-display';
    if (className) {
      this.statusDisplay.classList.add(className);
    }
  }
}

// Initialize the voice chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new VoiceChatbot();
});
