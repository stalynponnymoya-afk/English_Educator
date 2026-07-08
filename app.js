/**
 * English Speaking AI - PWA
 * Lógica completa: Speech Recognition, Speech Synthesis, Groq API
 */

(function() {
  'use strict';

  console.log('English Speaking AI: Cargando...');

  // ==================== CONFIGURACIÓN ====================
  const CONFIG = {
    GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
    MODEL: 'llama-3.3-70b-versatile',
    TEMPERATURE: 0.1,
    MAX_TOKENS: 512,
    MAX_HISTORY: 20
  };

  const SYSTEM_PROMPT = `Eres un tutor de inglés amigable y paciente. 

REGLAS IMPORTANTES:
1. SIEMPRE responde PRIMERO en inglés, LUEGO en español.
2. Separa las dos partes con exactamente: "--- ESPAÑOL ---"
3. Corrige errores gramaticales y de pronunciación del usuario.
4. Sugiere frases alternativas más naturales.
5. Usa tono amigable y motivador.
6. Sé conciso: 1-3 oraciones en inglés, 2-4 en español.
7. Si el usuario no habla inglés claramente, responde indicando qué entendiste y sugiere cómo decirlo mejor.

FORMATO ESTRICTO DE RESPUESTA:
[Tu respuesta en inglés]
--- ESPAÑOL ---
[Tu explicación en español]`;

  // ==================== ESTADO GLOBAL ====================
  let recognition = null;
  let synthesis = null;
  let voices = [];
  let isListening = false;
  let conversationHistory = [];

  // ==================== ELEMENTOS DOM ====================
  let chatArea, speakBtn, statusBar, statusText, settingsBtn;
  let settingsModal, apiKeyInput, saveSettingsBtn, closeSettingsBtn;

  // ==================== SPEECH RECOGNITION ====================
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      showError('Tu navegador no soporta reconocimiento de voz. Usa Safari en iOS o Chrome.');
      speakBtn.disabled = true;
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;  // Permite grabar más de 30 segundos
    recognition.interimResults = true;  // Muestra texto mientras hablas
    recognition.maxAlternatives = 1;

    recognition.onstart = function() {
      isListening = true;
      updateUIListening(true);
      setStatus('Escuchando...', '#34c759');
    };

    let finalTranscript = '';
    
    recognition.onresult = function(event) {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      console.log('Texto reconocido:', finalTranscript || interimTranscript);
      
      if (finalTranscript.trim()) {
        processUserInput(finalTranscript.trim());
        finalTranscript = '';
      }
    };

    recognition.onerror = function(event) {
      console.error('Error de reconocimiento:', event.error);
      isListening = false;
      updateUIListening(false);
      
      let errorMsg = 'Error de micrófono.';
      switch (event.error) {
        case 'not-allowed':
          errorMsg = 'Permiso de micrófono denegado. Permite el acceso en tu navegador.';
          break;
        case 'no-speech':
          errorMsg = 'No detecté voz. Habla más claro.';
          break;
        case 'network':
          errorMsg = 'Error de red. Verifica tu conexión.';
          break;
        case 'aborted':
          // No mostrar error si fue abortado intencionalmente
          return;
      }
      showError(errorMsg);
      setStatus('Listo', '#007aff');
    };

    recognition.onend = function() {
      isListening = false;
      updateUIListening(false);
      setStatus('Listo', '#007aff');
    };
  }

  function startListening() {
    if (!recognition || isListening) return;
    
    const apiKey = localStorage.getItem('groq_api_key');
    if (!apiKey) {
      showError('Configura tu API key de Groq primero (botón ⚙️)');
      openSettingsModal();
      return;
    }

    try {
      recognition.start();
    } catch (e) {
      console.error('Error al iniciar reconocimiento:', e);
    }
  }

  function stopListening() {
    if (recognition && isListening) {
      recognition.stop();
    }
  }

  // ==================== SPEECH SYNTHESIS ====================
  function initSpeechSynthesis() {
    if (!synthesis) return;

    // Cargar voces (puede ser async en algunos navegadores)
    voices = synthesis.getVoices();
    
    // Safari necesita esperar el evento voiceschanged
    if (voices.length === 0) {
      synthesis.onvoiceschanged = function() {
        voices = synthesis.getVoices();
        selectEnglishVoice();
      };
    } else {
      selectEnglishVoice();
    }
  }

  let englishVoice = null;

  function selectEnglishVoice() {
    // Preferir voces en-US
    englishVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Samantha')) ||
                   voices.find(v => v.lang === 'en-US') ||
                   voices.find(v => v.lang.startsWith('en')) ||
                   voices[0];
    console.log('Voz seleccionada:', englishVoice?.name);
  }

  function speakText(text) {
    if (!synthesis) return;

    // Cancelar cualquier reproducción anterior
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = englishVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.lang = 'en-US';
    utterance.volume = 1;

    // En iOS, puede que necesitemos un pequeño delay
    setTimeout(() => synthesis.speak(utterance), 100);
  }

  // ==================== UI HELPERS ====================
  function updateUIListening(listening) {
    if (listening) {
      speakBtn.classList.add('listening');
      speakBtn.querySelector('.btn-text').textContent = 'Escuchando...';
      statusBar.classList.remove('hidden');
    } else {
      speakBtn.classList.remove('listening');
      speakBtn.querySelector('.btn-text').textContent = 'Mantén presionado y habla';
      statusBar.classList.add('hidden');
    }
  }

  function setStatus(text, color) {
    statusText.textContent = text;
    statusBar.style.backgroundColor = color;
  }

  function showError(text) {
    // Remover errores anteriores
    const existingError = chatArea.querySelector('.error-message');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = text;
    chatArea.insertBefore(errorDiv, chatArea.firstChild);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }

  function removeWelcomeMessage() {
    const welcome = chatArea.querySelector('.welcome-message');
    if (welcome) {
      welcome.remove();
    }
  }

  function addMessage(type, text, label) {
    removeWelcomeMessage();

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    if (label) {
      const labelDiv = document.createElement('div');
      labelDiv.className = 'message-label';
      labelDiv.textContent = label;
      messageDiv.appendChild(labelDiv);
    }

    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    messageDiv.appendChild(textSpan);

    chatArea.appendChild(messageDiv);
    
    // Auto-scroll al final
    setTimeout(() => {
      chatArea.scrollTop = chatArea.scrollHeight;
    }, 100);
  }

  // ==================== GROQ API ====================
  async function sendToAI(userText) {
    const apiKey = localStorage.getItem('groq_api_key');
    
    if (!apiKey) {
      showError('API key no configurada. Abre configuración (⚙️).');
      return;
    }

    // Mostrar indicador de "pensando"
    setStatus('IA pensando...', '#ff9500');
    speakBtn.disabled = true;

    try {
      // Construir historial de mensajes
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: userText }
      ];

      const response = await fetch(CONFIG.GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: CONFIG.MODEL,
          messages: messages,
          temperature: CONFIG.TEMPERATURE,
          max_tokens: CONFIG.MAX_TOKENS
        })
      });

      if (!response.ok) {
        let errorMsg = 'Error en la petición.';
        
        if (response.status === 401) {
          errorMsg = 'API key inválida. Verifica tu key en console.groq.com';
        } else if (response.status === 429) {
          errorMsg = 'Límite de requests alcanzado. Espera 1 minuto.';
        }
        
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Parsear respuesta
      const parsed = parseAIResponse(aiResponse);

      // Guardar en historial
      conversationHistory.push({ role: 'user', content: userText });
      conversationHistory.push({ role: 'assistant', content: aiResponse });
      
      // Limitar tamaño del historial
      if (conversationHistory.length > CONFIG.MAX_HISTORY * 2) {
        conversationHistory = conversationHistory.slice(-CONFIG.MAX_HISTORY * 2);
      }
      
      saveHistory();

      // Mostrar respuesta
      if (parsed.english) {
        addMessage('ai-english', parsed.english, '🇺🇸 AI');
        speakText(parsed.english);
      }
      
      if (parsed.spanish) {
        addMessage('ai-spanish', parsed.spanish, '🇪🇸 Explicación');
      }

    } catch (error) {
      console.error('Error:', error);
      showError(error.message || 'Error de conexión con la IA.');
    } finally {
      speakBtn.disabled = false;
      setStatus('Listo', '#007aff');
    }
  }

  function parseAIResponse(text) {
    const parts = text.split('--- ESPAÑOL ---');
    
    return {
      english: parts[0]?.trim() || text.trim(),
      spanish: parts[1]?.trim() || ''
    };
  }

  async function processUserInput(text) {
    // Mostrar mensaje del usuario
    addMessage('user', text, '👤 Tú');
    
    // Enviar a la IA
    await sendToAI(text);
  }

  // ==================== LOCAL STORAGE ====================
  function saveHistory() {
    try {
      localStorage.setItem('speakai_history', JSON.stringify(conversationHistory));
    } catch (e) {
      console.error('Error al guardar historial:', e);
    }
  }

  function loadHistory() {
    try {
      const saved = localStorage.getItem('speakai_history');
      if (saved) {
        conversationHistory = JSON.parse(saved);
        rebuildChatUI();
      }
    } catch (e) {
      console.error('Error al cargar historial:', e);
      conversationHistory = [];
    }
  }

  function rebuildChatUI() {
    // Mostrar mensajes del historial
    for (let i = 0; i < conversationHistory.length; i += 2) {
      const userMsg = conversationHistory[i];
      const aiMsg = conversationHistory[i + 1];
      
      if (userMsg && userMsg.role === 'user') {
        removeWelcomeMessage();
        addMessage('user', userMsg.content, '👤 Tú');
        
        if (aiMsg && aiMsg.role === 'assistant') {
          const parsed = parseAIResponse(aiMsg.content);
          if (parsed.english) {
            addMessage('ai-english', parsed.english, '🇺🇸 AI');
          }
          if (parsed.spanish) {
            addMessage('ai-spanish', parsed.spanish, '🇪🇸 Explicación');
          }
        }
      }
    }
  }

  // ==================== SETTINGS MODAL ====================
  function openSettingsModal() {
    settingsModal.classList.remove('hidden');
    const apiKey = localStorage.getItem('groq_api_key');
    apiKeyInput.value = apiKey || '';
    apiKeyInput.focus();
  }

  function closeSettingsModal() {
    settingsModal.classList.add('hidden');
  }

  function saveSettings() {
    const apiKey = apiKeyInput.value.trim();
    
    if (apiKey && !apiKey.startsWith('gsk_')) {
      showError('API key inválida. Debe empezar con "gsk_"');
      return;
    }
    
    if (apiKey) {
      localStorage.setItem('groq_api_key', apiKey);
      showError('API key guardada correctamente.');
    } else {
      localStorage.removeItem('groq_api_key');
      showError('API key eliminada.');
    }
    
    closeSettingsModal();
  }

  // ==================== EVENT LISTENERS ====================
  function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Botón de hablar - soporte táctil y mouse
    speakBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startListening();
    });
    
    speakBtn.addEventListener('mouseup', stopListening);
    speakBtn.addEventListener('mouseleave', stopListening);

    speakBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startListening();
    }, { passive: false });
    
    speakBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      stopListening();
    });

    // Botón de settings - AGREGAR LOG
    settingsBtn.addEventListener('click', () => {
      console.log('Click en botón de settings');
      openSettingsModal();
    });

    // Modal settings
    saveSettingsBtn.addEventListener('click', saveSettings);
    closeSettingsBtn.addEventListener('click', closeSettingsModal);

    // Cerrar modal al hacer click fuera
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        closeSettingsModal();
      }
    });

    // Guardar con Enter
    apiKeyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveSettings();
      }
    });
    
    console.log('Event listeners configurados');
  }

  // ==================== INICIALIZACIÓN ====================
  function init() {
    console.log('English Speaking AI: Inicializando...');
    
    try {
      // Obtener referencias a elementos DOM
      chatArea = document.getElementById('chat-area');
      speakBtn = document.getElementById('speak-btn');
      statusBar = document.getElementById('status-bar');
      statusText = document.getElementById('status-text');
      settingsBtn = document.getElementById('settings-btn');
      settingsModal = document.getElementById('settings-modal');
      apiKeyInput = document.getElementById('api-key-input');
      saveSettingsBtn = document.getElementById('save-settings');
      closeSettingsBtn = document.getElementById('close-settings');

      // Verificar que todos los elementos existan
      if (!chatArea || !speakBtn || !settingsBtn || !settingsModal) {
        console.error('Faltan elementos del DOM');
        return;
      }

      // Inicializar synthesis de voz
      synthesis = window.speechSynthesis;

      // Verificar si hay API key configurada
      const hasApiKey = !!localStorage.getItem('groq_api_key');
      
      if (!hasApiKey) {
        showError('Configura tu API key de Groq (botón ⚙️)');
      } else {
        speakBtn.disabled = false;
      }

      // Inicializar reconocimiento de voz
      initSpeechRecognition();

      // Inicializar síntesis de voz
      initSpeechSynthesis();

      // Cargar historial
      loadHistory();

      // Configurar eventos
      setupEventListeners();

      console.log('English Speaking AI iniciado correctamente');
    } catch (error) {
      console.error('Error durante inicialización:', error);
    }
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
