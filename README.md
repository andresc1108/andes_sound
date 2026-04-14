# Andes Sound — Reproductor de Música

Reproductor de música web con integración a YouTube, construido con **Next.js 14**, **TypeScript** y **TailwindCSS**. Permite buscar, reproducir y gestionar canciones a través de una **Lista Doblemente Enlazada (DLL)** como estructura de datos principal.

---

## Demo en línea

[https://andessound.vercel.app](https://andessound.vercel.app)

---

## Cómo ejecutar el proyecto localmentes

### Requisitos
- Node.js 18+
- Una API Key de [YouTube Data API v3](https://console.cloud.google.com)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/andresc1108/andes_sound.git
cd andes_sound

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de variables de entorno
# Crear archivo .env.local en la raíz del proyecto con:
NEXT_PUBLIC_YT_API_KEY=TU_API_KEY_AQUI

# 4. Ejecutar en modo desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Guía de uso — Funcionalidades

### Inicio
Al abrir la app verás la pantalla principal con:
- **Tendencias en YouTube** — Videos populares de Colombia cargados automáticamente desde la API. Haz clic en cualquiera para reproducirlo.
- **Buscador** — Busca cualquier canción, artista o video de YouTube.
- **Gestión DLL** — Botones para manipular la playlist.
- **Playlist** — Lista de canciones actuales.

---

### Buscar canciones

1. Escribe el nombre de una canción o artista en el campo "Buscar en YouTube..."
2. Presiona Enter o el botón de búsqueda
3. Aparecerán los resultados con dos opciones por canción:
   - **+ Inicio** — Inserta la canción al principio de la playlist (cabeza de la DLL)
   - **+ Final** — Inserta la canción al final de la playlist (cola de la DLL)

---

### Reproducir canciones

Haz clic en cualquier canción de la playlist o las tendencias para reproducirla. El reproductor inferior controla la reproducción:
- Canción anterior
- Pausar / Reanudar
- Siguiente canción
- Modo aleatorio 
- Repetir canción actual
- Marcar como favorita
- Control de volumen

---

### Ruleta de Géneros

En el panel derecho encontrarás la **Ruleta de Géneros**:
1. Haz clic en **Girar Ruleta**
2. La app buscará automáticamente una canción aleatoria de géneros como cumbia, música andina o pop latino
3. La canción se agregará a la playlist y comenzará a reproducirse

---

### Letras de canciones

1. Reproduce cualquier canción
2. Haz clic en el icono de micrófono en la barra inferior
3. Las letras se cargan automáticamente desde la API [lyrics.ovh](https://lyrics.ovh)

> Nota: Las letras funcionan mejor con canciones en inglés o español de artistas reconocidos. Si el video viene de YouTube con formato "Artista - Canción", la detección es automática.

---

### Navegación

| Sección | Descripción |
|---------|-------------|
| **Inicio** | Pantalla principal con tendencias y buscador |
| **Descubrir** | Géneros musicales (Andina, Cumbia, Salsa, etc.) — al hacer clic busca automáticamente |
| **Albums** | Visualización de álbumes |
| **Canciones** | Listado completo de la playlist |
| **Artistas** | Galería de artistas |

---

### Version móvil

La app es completamente responsiva:
- Mini reproductor en la parte inferior al reproducir una canción
- Toca el mini reproductor para expandirlo a pantalla completa
- Navegación inferior con iconos

---

## Como fue construido

### Tecnologías utilizadas

| Tecnología | Uso |
|------------|-----|
| **Next.js 14** | Framework principal (App Router) |
| **TypeScript** | Tipado estático |
| **TailwindCSS** | Estilos y diseño responsivo |
| **shadcn/ui** | Componentes de interfaz (Slider, Button, Input) |
| **YouTube Data API v3** | Búsqueda de videos y tendencias |
| **YouTube IFrame API** | Reproducción de audio |
| **lyrics.ovh API** | Obtención de letras de canciones |
| **Vercel** | Despliegue en producción |

---

### Integración con YouTube

**YouTube Data API v3** se usa para:
- Cargar tendencias musicales de Colombia al iniciar
- Buscar videos por nombre de canción o artista
- Obtener miniaturas y metadatos

**YouTube IFrame API** se usa para:
- Reproducir el audio de forma invisible (player oculto)
- Controlar play/pause, volumen, tiempo actual y duración
- Detectar cuando termina una canción para pasar a la siguiente automáticamente

