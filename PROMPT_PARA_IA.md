# PROMPT PARA IA GENERATIVA
## Crea una PWA completa para practicar speaking en inglés con IA

Copia y pega el siguiente texto en Google Studio, Claude, ChatGPT o cualquier IA generativa de código. La IA debe generar los 6 archivos del proyecto listados abajo.

---

## CONTEXTO DEL PROYECTO

Soy un desarrollador que quiere crear una aplicación web progresiva (PWA) para practicar speaking en inglés. La app debe funcionar en iPhone Safari y navegadores desktop. No hay backend. Todo es frontend estático.

### Stack técnico verificado:
- **Frontend:** HTML5 + CSS3 + JavaScript vanilla (un solo archivo de cada uno)
- **Voz STT:** `webkitSpeechRecognition` (API nativa del navegador, gratis)
- **Voz TTS:** `speechSynthesis` (API nativa del navegador, gratis)
- **IA:** Groq API (endpoint: `https://api.groq.com/openai/v1/chat/completions`)
- **Modelo:** `llama-3.3-70b-versatile` (free tier: 1,000 req/día, 15 req/min)
- **Deploy:** GitHub Pages (hosting estático gratuito con HTTPS automático)
- **Storage:** `localStorage` del navegador

### Restricciones técnicas críticas:
1. Safari iOS requiere que `webkitSpeechRecognition.start()` se llame DENTRO de un evento de usuario (click/touch). No puede iniciarse automáticamente.
2. El micrófono solo funciona en HTTPS. GitHub Pages provee HTTPS gratis.
3. Firefox no soporta STT. No es problema, el usuario usa Safari iPhone.
4. `speechSynthesis.getVoices()` puede devolver array vacío en Safari hasta que ocurra el evento `voiceschanged`.
5. El botón de hablar debe funcionar con mouse (mousedown/mouseup) y touch (touchstart/touchend).
6. La API key de Groq se almacena en `localStorage` (válido para uso personal, nunca para producción pública).

---

## ARCHIVOS A GENERAR

Genera exactamente estos 6 archivos. Cada archivo debe ser código completo, funcional, sin placeholders, sin comentarios tipo "TODO" o "implementar luego". Todo debe funcionar al copiar y pegar.

### Archivo 1: `index.html`
- DOCTYPE html5, lang="es"
- Meta viewport con `maximum-scale=1.0, user-scalable=no` para evitar zoom en inputs en iPhone
- Meta `apple-mobile-web-app-capable` y `apple-mobile-web-app-status-bar-style` para comportamiento nativo en iOS
- Link a manifest, apple-touch-icon, stylesheet
- Estructura: header con título y botón de settings, área de chat, barra de estado, botón de hablar fijo abajo, modal de configuración
- Script inline para registrar el Service Worker
- Script externo `app.js`

### Archivo 2: `style.css`
- Mobile-first, diseñado para iPhone Safari
- Variables CSS para colores (azul #007aff, naranja #ff9500, rojo #ff3b30, verde #34c759)
- Flexbox para layout vertical (header, chat, input)
- Chat area con scroll nativo de iOS (`-webkit-overflow-scrolling: touch`)
- Mensajes: usuario a la derecha (azul), IA inglés a la izquierda (gris), IA español a la izquierda (naranja con borde)
- Botón de hablar: fixed bottom, full width, border-radius 28px, color azul que cambia a rojo cuando escucha
- Animación pulse en botón cuando escucha
- Modal centrado con backdrop oscuro
- Safe area para iPhone X+ (`env(safe-area-inset-bottom)`)
- Media query para desktop (max-width 600px centrado)
- Sin frameworks CSS (no Bootstrap, no Tailwind)

### Archivo 3: `app.js`
- IIFE (Immediately Invoked Function Expression) para encapsulamiento
- **Configuración:** constantes para URL de Groq, modelo, temperatura 0.1, max_tokens 512, max_history 20
- **System Prompt:** Tutor de inglés amigable. Reglas: responder PRIMERO en inglés, LUEGO en español separado por `--- ESPAÑOL ---`. Explicar errores gramaticales, sugerir frases alternativas. Tono paciente. 1-3 oraciones en inglés, 2-4 en español.
- **Speech Recognition:**
  - Detectar `window.SpeechRecognition || window.webkitSpeechRecognition`
  - Configurar: lang='en-US', continuous=false, interimResults=false, maxAlternatives=1
  - Eventos: onstart (cambiar UI), onresult (extraer transcript), onerror (mostrar mensaje según tipo de error), onend (restaurar UI)
  - startListening() y stopListening() con manejo de errores
  - Soporte mouse (mousedown/mouseup/mouseleave) y touch (touchstart/touchend)
- **Speech Synthesis:**
  - Detectar `window.speechSynthesis`
  - Cargar voces con manejo de `voiceschanged` para Safari
  - Seleccionar voz en inglés (en-US preferido)
  - Función speakText(text): cancelar reproducción previa, crear utterance con rate=0.9, pitch=1, lang='en-US'
- **Chat UI:**
  - addMessage(type, text, label): crear div con clase message + tipo, agregar label opcional, animación fadeIn, auto-scroll
  - showError(text): mensaje temporal rojo que desaparece en 5 segundos
  - Remover welcome-message al primer mensaje
- **Parsing IA:**
  - parseAIResponse(text): split por `--- ESPAÑOL ---`, retornar {english, spanish}
- **Comunicación Groq:**
  - async sendToAI(userText): construir messages array con system prompt + historial + user message
  - fetch POST con headers Content-Type y Authorization Bearer
  - Manejar errores HTTP: 401 (API key inválida), 429 (rate limit), otros
  - Parsear respuesta, mostrar inglés + español, reproducir TTS del inglés
  - Guardar en conversationHistory y localStorage
- **localStorage:**
  - saveHistory(): guardar últimos 20 mensajes como JSON
  - loadHistory(): restaurar al cargar la página, reconstruir UI
- **Settings Modal:**
  - Abrir/cerrar modal
  - Input para API key (type=password)
  - Validar que empiece con `gsk_`
  - Guardar en localStorage
  - Cerrar al hacer click fuera del modal
  - Guardar al presionar Enter en input
- **Inicialización:** detectar DOMContentLoaded, cargar historial, configurar voz, actualizar UI

### Archivo 4: `manifest.webmanifest`
- JSON válido
- name: "English Speaking AI", short_name: "SpeakAI"
- start_url: "/", scope: "/"
- display: "standalone"
- icons: 192x192 y 512x512 (mismo archivo icon.png)
- theme_color: "#007aff", background_color: "#ffffff"

### Archivo 5: `sw.js`
- Service Worker básico para cachear archivos estáticos
- CACHE_NAME: 'speak-ai-v1'
- urlsToCache: index.html, style.css, app.js, manifest.webmanifest, icon.png
- Evento install: cachear todos, skipWaiting
- Evento activate: limpiar caches antiguas, clients.claim
- Evento fetch: cache-first, fallback a fetch, si falla navegación devolver index.html

### Archivo 6: `icon.png`
- Generar instrucciones para crear un icono simple 192x192 (círculo azul con micrófono blanco)
- O proporcionar un SVG inline que pueda convertirse a PNG
- O usar un data URI en el manifest como fallback

---

## REQUISITOS ADICIONALES

1. **Temperatura 0.1** en la llamada a Groq para respuestas deterministas en corrección de gramática.
2. **Sin dependencias externas:** No uses CDN de frameworks. Todo es vanilla.
3. **Sin backend:** Las llamadas a Groq van directamente desde el frontend con fetch.
4. **CORS:** Groq soporta CORS desde cualquier origen con la API key correcta.
5. **Error handling completo:** Cada fetch, cada API de voz, cada localStorage debe tener try/catch.
6. **Responsive:** Debe verse bien en iPhone SE (375px) hasta iPhone 15 Pro Max (430px).
7. **Accesibilidad:** Botones con aria-labels, contraste de colores WCAG AA.

---

## FORMATO DE SALIDA ESPERADO

La IA debe generar la respuesta en este formato exacto:

```
=== ARCHIVO: index.html ===
[contenido completo del archivo]

=== ARCHIVO: style.css ===
[contenido completo del archivo]

=== ARCHIVO: app.js ===
[contenido completo del archivo]

=== ARCHIVO: manifest.webmanifest ===
[contenido completo del archivo]

=== ARCHIVO: sw.js ===
[contenido completo del archivo]

=== ARCHIVO: icon.png ===
[Instrucciones para crear el icono, o código SVG que pueda guardarse como PNG]
```

Cada archivo debe estar listo para copiar, pegar y guardar con el nombre correspondiente. No debe haber explicaciones entre archivos, solo los separadores === ARCHIVO: nombre ===.

---

## INSTRUCCIONES POST-GENERACIÓN (para el usuario)

Una vez que la IA genere los archivos:

1. Crear carpeta `english-speaking-ai` en tu computadora
2. Guardar cada archivo con su nombre exacto
3. Crear cuenta en Groq: https://console.groq.com
4. Generar API key: https://console.groq.com/keys
5. Crear repositorio en GitHub: https://github.com/new (nombre: english-speaking-ai, público)
6. Subir los 6 archivos al repositorio
7. Activar GitHub Pages: Settings → Pages → Branch main / root
8. Esperar 1-5 minutos
9. Abrir la URL en Safari iPhone: `https://TU_USUARIO.github.io/english-speaking-ai/`
10. Configurar API key en la app (icono ⚙️)
11. "Add to Home Screen" desde Safari

---

**Genera los 6 archivos ahora.**
