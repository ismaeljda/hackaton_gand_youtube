class YouTubeAIAssistant {
  constructor() {
    console.log('📱 Initialisation de YouTubeAIAssistant');
    this.isInitialized = false;
    this.chatContainer = null;
    this.isVisible = false;
    this.currentVideoId = null;
    this.init();
  }

  init() {
    console.log('🔄 Init() appelé, document.readyState:', document.readyState);
    // Attendre que la page YouTube soit chargée
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    console.log('⚙️ Setup() appelé');
    // Détecter les changements de vidéo YouTube (SPA)
    this.observeVideoChanges();
    this.createAIButton();
    this.createChatInterface();
    console.log('✅ Setup terminé');
  }

  observeVideoChanges() {
    // Observer les changements d'URL pour détecter les nouvelles vidéos
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        if (url.includes('/watch')) {
          this.onVideoChanged();
        }
      }
    }).observe(document, { subtree: true, childList: true });
  }

  onVideoChanged() {
    const videoId = this.extractVideoId();
    if (videoId !== this.currentVideoId) {
      this.currentVideoId = videoId;
      console.log('Nouvelle vidéo détectée:', videoId);
      // Reset du chat pour la nouvelle vidéo
      this.clearChat();
    }
  }

  extractVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    console.log('🎬 Video ID extraite:', videoId, 'depuis URL:', window.location.href);
    return videoId;
  }

  createAIButton() {
    console.log('🔘 Création du bouton AI...');
    
    // Version simplifiée avec délai
    const tryInsertButton = () => {
      // Sélecteurs plus fiables selon ChatGPT
      const container = document.querySelector('#top-row') || 
                       document.querySelector('.ytd-watch-metadata') ||
                       document.querySelector('#container #primary') ||
                       document.querySelector('ytd-watch-metadata') ||
                       document.body; // Fallback sur body
      
      console.log('🔍 Container trouvé:', container);
      
      if (container && !document.querySelector('#ai-assistant-btn')) {
        console.log('✅ Insertion du bouton AI');
        // Délai de 2 secondes comme suggéré
        setTimeout(() => {
          this.insertAIButton(container);
        }, 2000);
        return true;
      }
      return false;
    };
    
    // Essayer immédiatement
    if (tryInsertButton()) return;
    
    // Sinon observer
    const observer = new MutationObserver(() => {
      if (tryInsertButton()) {
        observer.disconnect();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Timeout de sécurité
    setTimeout(() => {
      observer.disconnect();
      console.log('⏰ Timeout atteint');
    }, 10000);
  }

  insertAIButton(container) {
    console.log('➕ Insertion du bouton dans:', container);
    
    // TOUJOURS utiliser la position fixe pour éviter les problèmes
    console.log('🎯 Utilisation position fixed pour garantir la visibilité');
    const aiButton = document.createElement('div');
    aiButton.id = 'ai-assistant-btn';
    aiButton.style.cssText = `
      position: fixed !important;
      top: 120px !important;
      right: 20px !important;
      background: #1976d2 !important;
      color: white !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      cursor: pointer !important;
      z-index: 10000 !important;
      font-family: Roboto, Arial, sans-serif !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      transition: all 0.2s ease !important;
      border: none !important;
    `;
    aiButton.innerHTML = `🤖 Ask AI`;
    
    aiButton.addEventListener('click', () => {
      console.log('🎯 Bouton AI cliqué !');
      this.toggleChat();
    });
    
    // Effets hover
    aiButton.addEventListener('mouseenter', () => {
      aiButton.style.background = '#1565c0 !important';
      aiButton.style.transform = 'translateY(-2px) scale(1.05) !important';
    });
    
    aiButton.addEventListener('mouseleave', () => {
      aiButton.style.background = '#1976d2 !important';
      aiButton.style.transform = 'translateY(0) scale(1) !important';
    });
    
    document.body.appendChild(aiButton);
    console.log('✅ Bouton AI ajouté en position fixe avec succès !');
  }

  createChatInterface() {
    // Créer le conteneur du chat
    this.chatContainer = document.createElement('div');
    this.chatContainer.id = 'ai-chat-container';
    this.chatContainer.className = 'ai-chat-container hidden';
    
    this.chatContainer.innerHTML = `
      <div class="ai-chat-header">
        <h3>AI Assistant</h3>
        <button class="ai-chat-close">&times;</button>
      </div>
      
      <div class="ai-chat-messages" id="ai-chat-messages">
        <div class="ai-message">
          <div class="message-content">
            👋 Salut ! Je peux t'aider à comprendre cette vidéo. Pose-moi une question sur ce que tu regardes !
          </div>
        </div>
      </div>
      
      <div class="ai-chat-input">
        <button id="ai-mic-btn" title="Poser une question vocale">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
          </svg>
        </button>
        <input type="text" id="ai-question-input" placeholder="Pose ta question..." />
        <button id="ai-send-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
          </svg>
        </button>
      </div>
      
      <div class="ai-chat-status" id="ai-chat-status"></div>
    `;

    // Ajouter les event listeners
    this.setupChatEvents();
    
    // Ajouter au DOM
    document.body.appendChild(this.chatContainer);
  }

  setupChatEvents() {
    // Fermer le chat
    this.chatContainer.querySelector('.ai-chat-close').addEventListener('click', () => {
      this.toggleChat();
    });

    // Envoyer une question
    const sendButton = this.chatContainer.querySelector('#ai-send-btn');
    const input = this.chatContainer.querySelector('#ai-question-input');
    const micButton = this.chatContainer.querySelector('#ai-mic-btn');

    sendButton.addEventListener('click', () => this.sendQuestion());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendQuestion();
    });

    // Microphone button
    micButton.addEventListener('click', () => this.startVoiceQuestion());

    // Initialiser les variables pour la reconnaissance vocale
    this.recognition = null;
    this.isRecording = false;
    this.speechSynthesis = window.speechSynthesis;
  }

  toggleChat() {
    this.isVisible = !this.isVisible;
    this.chatContainer.classList.toggle('hidden', !this.isVisible);
    
    if (this.isVisible) {
      this.chatContainer.querySelector('#ai-question-input').focus();
    }
  }

  getCurrentTime() {
    // Récupérer le temps actuel de la vidéo YouTube
    const video = document.querySelector('video');
    return video ? video.currentTime : 0;
  }

  async sendQuestion() {
    const input = this.chatContainer.querySelector('#ai-question-input');
    const question = input.value.trim();
    
    if (!question) return;
    
    // Forcer la récupération de video_id au moment du clic
    const currentTime = this.getCurrentTime();
    const videoId = this.extractVideoId(); // Récupérer à nouveau au moment du clic
    
    console.log('🐛 Debug sendQuestion:');
    console.log('   - URL actuelle:', window.location.href);
    console.log('   - Search params:', window.location.search);
    console.log('   - videoId extraite:', videoId);
    console.log('   - currentTime:', currentTime);
    console.log('   - question:', question);
    console.log('   - this.currentVideoId:', this.currentVideoId);
    
    // Vérification supplémentaire
    if (!videoId) {
      this.addMessage('ai', '❌ Impossible de détecter l\'ID de la vidéo. Êtes-vous bien sur une page de vidéo YouTube ?');
      return;
    }
    
    // Ajouter la question de l'utilisateur au chat
    this.addMessage('user', question);
    input.value = '';
    
    // Afficher le status de chargement
    this.setStatus('Analyse de la vidéo...');
    
    try {
      // Réinitialiser la queue TTS pour une nouvelle question
      this.ttsQueue = { lastSpokenIndex: 0, isSpeaking: false };

      // Appeler votre backend (streaming)
      const response = await this.callBackendStream(videoId, currentTime, question);

      // La réponse est déjà affichée progressivement dans callBackendStream
      this.setStatus('');

    } catch (error) {
      console.error('Erreur:', error);
      this.addMessage('ai', 'Désolé, une erreur est survenue. Réessayez plus tard.');
      this.setStatus('');
    }
  }

  async callBackendStream(videoId, currentTime, question) {
    // Utiliser l'endpoint streaming pour réponses progressives
    return new Promise((resolve, reject) => {
      fetch('http://localhost:5000/ask/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoId,
          current_time: currentTime,
          question: question
        })
      }).then(response => {
        if (!response.ok) {
          throw new Error('Erreur réseau');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        let currentMessage = null;

        const readStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              resolve(fullResponse);
              return;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.substring(6));

                  if (data.error) {
                    reject(new Error(data.error));
                    return;
                  }

                  if (data.chunk) {
                    fullResponse += data.chunk;

                    // Afficher progressivement dans le chat
                    if (!currentMessage) {
                      const messagesContainer = this.chatContainer.querySelector('#ai-chat-messages');
                      const messageDiv = document.createElement('div');
                      messageDiv.className = 'ai-message';
                      messageDiv.innerHTML = '<div class="message-content"></div>';
                      messagesContainer.appendChild(messageDiv);
                      currentMessage = messageDiv.querySelector('.message-content');
                    }

                    currentMessage.textContent = fullResponse;
                    this.chatContainer.querySelector('#ai-chat-messages').scrollTop =
                      this.chatContainer.querySelector('#ai-chat-messages').scrollHeight;

                    // TTS progressif : lire par phrases complètes
                    this.speakProgressively(fullResponse);
                  }

                  if (data.done) {
                    resolve(fullResponse);
                    return;
                  }
                } catch (e) {
                  console.error('Erreur parsing JSON:', e);
                }
              }
            }

            readStream();
          }).catch(reject);
        };

        readStream();
      }).catch(reject);
    });
  }

  addMessage(sender, content) {
    const messagesContainer = this.chatContainer.querySelector('#ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `${sender}-message`;
    
    const timestamp = new Date().toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
      <div class="message-content">${content}</div>
      <div class="message-time">${timestamp}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  setStatus(message) {
    const statusDiv = this.chatContainer.querySelector('#ai-chat-status');
    statusDiv.textContent = message;
    statusDiv.style.display = message ? 'block' : 'none';
  }

  clearChat() {
    const messagesContainer = this.chatContainer.querySelector('#ai-chat-messages');
    messagesContainer.innerHTML = `
      <div class="ai-message">
        <div class="message-content">
          👋 Nouvelle vidéo détectée ! Pose-moi une question sur ce que tu regardes.
        </div>
      </div>
    `;
  }

  startVoiceQuestion() {
    if (this.isRecording) {
      this.stopRecording();
      return;
    }

    // Vérifier si le navigateur supporte la reconnaissance vocale
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.addMessage('ai', '❌ Votre navigateur ne supporte pas la reconnaissance vocale.');
      return;
    }

    // Initialiser la reconnaissance vocale
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'fr-FR';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    const micButton = this.chatContainer.querySelector('#ai-mic-btn');

    this.recognition.onstart = () => {
      this.isRecording = true;
      micButton.style.color = '#ff0000';
      this.setStatus('🎤 Écoute en cours...');
    };

    this.recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('🎤 Transcription:', transcript);

      // Mettre la question dans l'input
      const input = this.chatContainer.querySelector('#ai-question-input');
      input.value = transcript;

      // Envoyer la question
      await this.sendQuestion();
    };

    this.recognition.onerror = (event) => {
      console.error('❌ Erreur reconnaissance vocale:', event.error);
      this.isRecording = false;
      micButton.style.color = '';
      this.setStatus('');
      this.addMessage('ai', '❌ Erreur lors de la reconnaissance vocale. Réessayez.');
    };

    this.recognition.onend = () => {
      this.isRecording = false;
      micButton.style.color = '';
      this.setStatus('');
    };

    // Démarrer l'enregistrement
    try {
      this.recognition.start();
    } catch (error) {
      console.error('❌ Erreur démarrage micro:', error);
      this.addMessage('ai', '❌ Impossible de démarrer le microphone.');
    }
  }

  stopRecording() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  speakResponse(text) {
    // Arrêter toute lecture en cours
    this.speechSynthesis.cancel();

    // Créer l'utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Événements
    utterance.onstart = () => {
      console.log('🔊 Début de la lecture audio');
      this.setStatus('🔊 Lecture en cours...');
    };

    utterance.onend = () => {
      console.log('✅ Fin de la lecture audio');
      this.setStatus('');
    };

    utterance.onerror = (event) => {
      console.error('❌ Erreur TTS:', event);
      this.setStatus('');
    };

    // Lancer la lecture
    this.speechSynthesis.speak(utterance);
  }

  async speakProgressively(fullText) {
    // Initialiser la queue si nécessaire
    if (!this.ttsQueue) {
      this.ttsQueue = {
        lastSpokenIndex: 0,
        isSpeaking: false,
        audioQueue: []
      };
    }

    // Découper le texte en phrases complètes
    const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [];

    // Calculer combien de phrases complètes nous avons
    const completeSentences = sentences.slice(this.ttsQueue.lastSpokenIndex);

    // Ne lire que s'il y a au moins une nouvelle phrase complète
    if (completeSentences.length > 0 && !this.ttsQueue.isSpeaking) {
      const nextSentence = completeSentences[0];
      this.ttsQueue.isSpeaking = true;

      try {
        // Appeler l'API ElevenLabs pour générer l'audio
        const response = await fetch('http://localhost:5000/tts/elevenlabs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: nextSentence
          })
        });

        if (!response.ok) {
          throw new Error('Erreur TTS');
        }

        // Convertir la réponse en blob audio
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Créer un élément audio et le jouer
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          this.ttsQueue.isSpeaking = false;
          this.ttsQueue.lastSpokenIndex++;
          URL.revokeObjectURL(audioUrl);

          // Continuer avec la phrase suivante si disponible
          if (this.ttsQueue.lastSpokenIndex < sentences.length) {
            this.speakProgressively(fullText);
          }
        };

        audio.onerror = () => {
          console.error('Erreur lecture audio');
          this.ttsQueue.isSpeaking = false;
        };

        await audio.play();

      } catch (error) {
        console.error('Erreur TTS ElevenLabs:', error);
        this.ttsQueue.isSpeaking = false;

        // Fallback vers le TTS du navigateur
        const utterance = new SpeechSynthesisUtterance(nextSentence);
        utterance.lang = 'fr-FR';
        utterance.rate = 1.0;

        utterance.onend = () => {
          this.ttsQueue.isSpeaking = false;
          this.ttsQueue.lastSpokenIndex++;

          if (this.ttsQueue.lastSpokenIndex < sentences.length) {
            this.speakProgressively(fullText);
          }
        };

        this.speechSynthesis.speak(utterance);
      }
    }
  }
}

// Initialiser l'assistant quand la page est prête
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new YouTubeAIAssistant();
  });
} else {
  new YouTubeAIAssistant();
}