# English Speaking AI - PWA

App para practicar speaking en inglés con retroalimentación de IA en español. Funciona como PWA en iPhone Safari y navegadores desktop.

## Stack
- HTML5 + CSS3 + JavaScript vanilla
- Web Speech API (STT/TTS) - gratis, nativo del navegador
- Groq API (modelo Llama 3.3 70B) - gratis, 1,000 req/día
- GitHub Pages - hosting gratuito con HTTPS

## Requisitos previos
1. Cuenta en GitHub (gratis)
2. Cuenta en Groq (gratis, sin tarjeta) → https://console.groq.com
3. API key de Groq → https://console.groq.com/keys

## Opción A: GitHub Codespaces (Recomendado)

GitHub Codespaces es un VS Code en la nube. Funciona desde el navegador, no necesitas instalar nada.

### Paso 1: Crear repositorio
1. Ve a https://github.com/new
2. Nombre: `english-speaking-ai`
3. Visibilidad: **Public**
4. Click "Create repository"

### Paso 2: Abrir en Codespaces
1. Dentro del repositorio, click en el botón verde **"<> Code"**
2. Selecciona la pestaña **"Codespaces"**
3. Click en **"Create codespace on main"**
4. Espera 30-60 segundos a que cargue VS Code en el navegador

### Paso 3: Subir archivos
1. En Codespaces, abre el panel izquierdo de archivos
2. Click derecho en el área vacía → **"Upload Folder"** o arrastra los archivos
3. Sube los 6 archivos: `index.html`, `style.css`, `app.js`, `manifest.webmanifest`, `sw.js`, `icon.png`
4. Alternativa: usa la terminal integrada:
   ```bash
   # En la terminal de Codespaces, dentro del proyecto:
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

### Paso 4: Probar localmente
1. En Codespaces, presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
2. Escribe "Live Server" y selecciona **"Live Server: Open with Live Server"**
3. Si no tienes la extensión, instálala desde el marketplace de VS Code dentro de Codespaces
4. Se abrirá una pestaña con la app funcionando en `https://TU_CODESPACE-XXXX.github.dev/`

### Paso 5: Deploy en GitHub Pages
1. En el repositorio de GitHub (no en Codespaces), ve a **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / `root`
4. Click **Save**
5. Espera 1-5 minutos
6. Tu URL será: `https://TU_USUARIO.github.io/english-speaking-ai/`

### Paso 6: Usar en iPhone
1. Abre la URL en Safari iOS
2. Tap en **Compartir** (icono cuadrado con flecha)
3. Selecciona **"Add to Home Screen"**
4. La app se instala como icono nativo

## Opción B: Google Colab (No recomendado para este proyecto)

Google Colab está diseñado para notebooks Python, no para desarrollo web. Puedes usarlo para:
- Generar los archivos del proyecto con Python
- Descargar los archivos y luego subirlos a GitHub

No es la herramienta adecuada para desarrollar una PWA porque:
- No tiene preview de HTML/CSS/JS en tiempo real
- No permite instalar extensiones de VS Code
- El entorno es de notebook, no de IDE

## Configuración de la API Key

1. Abre la app en el navegador
2. Tap en el icono ⚙️ (Configuración)
3. Pega tu API key de Groq (empieza con `gsk_`)
4. Click en **Guardar**
5. La key se almacena en `localStorage` de tu navegador (solo en tu dispositivo)

## Estructura de archivos

```
english-speaking-ai/
├── index.html           # Página principal (PWA)
├── style.css            # Estilos responsive mobile-first
├── app.js               # Lógica: voz, IA, chat, storage
├── manifest.webmanifest # Configuración PWA
├── sw.js                # Service Worker para offline
├── icon.png             # Icono de la app (192x192)
└── README.md            # Este archivo
```

## Troubleshooting

| Problema | Solución |
|---|---|
| Micrófono no funciona | Asegúrate de usar HTTPS. GitHub Pages usa HTTPS por defecto. |
| Safari no muestra "Add to Home Screen" | Verifica que el manifest sea JSON válido y que icon.png exista. |
| Error 401 | API key inválida o expirada. Genera una nueva en console.groq.com |
| Error 429 | Límite de requests alcanzado. Espera 1 minuto. Groq free: 15 req/min. |
| La app no se actualiza | Safari: Settings → Clear History and Website Data. Chrome: Ctrl+Shift+R |
| Voz TTS no suena | iPhone: verifica que el switch de mute físico esté desactivado. |

## Límites de Groq Free Tier

- 1,000 requests/día
- 15 requests/minuto
- 6,000 tokens/minuto

Para uso personal de 30 minutos diarios: ~20-30 requests. No se agota.

## Licencia

Uso personal. El código es tuyo.
