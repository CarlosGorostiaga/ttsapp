# TTSApp – Entrenador de fuerza con voz

Aplicación Angular que guía una sesión de entrenamiento de fuerza usando la API Web Speech para generar mensajes de voz por serie. Permite elegir ejercicios, ajustar el nivel del atleta y personalizar la voz del entrenador virtual, convirtiéndola en una herramienta ideal para boxes, gimnasios caseros o atletas que quieren concentrarse en la técnica sin mirar la pantalla.

## Características principales
- **Biblioteca de ejercicios guiados**: selección rápida entre jalón al pecho, press banca, sentadilla, peso muerto, dominadas, press militar, remo con barra, fondos y más.
- **Mensajes por nivel**: indicaciones específicas para perfiles principiante, intermedio y avanzado, organizadas por serie en `src/app/data/prompts.ts`.
- **Text-to-Speech mejorado**: soporte para voces en español, prioridad a voces de Google, control de velocidad y tono, además de persistencia en `localStorage`.
- **Flujo de entrenamiento interactivo**: inicia, avanza o reinicia las series manteniendo seguimiento visual del progreso.
- **Diseño responsive con Tailwind**: interfaz moderna con paneles configurables y accesible desde desktop o dispositivos móviles.

## Requisitos previos
- Node.js 18 o superior (recomendado 20 LTS).
- npm 9 o superior (se instala junto con Node.js).
- Navegador compatible con la [API Web Speech](https://developer.mozilla.org/es/docs/Web/API/Web_Speech_API) para probar el TTS.

## Puesta en marcha
```bash
npm install
npm start
```
El comando `npm start` levanta el servidor de desarrollo en `http://localhost:4200/` con recarga automática.

### Opción con Docker Compose
Si prefieres aislar el entorno:
```bash
docker compose up --build
```
El contenedor expone la aplicación en `http://localhost:4200/` y gestiona las dependencias dentro del volumen `node_modules`.

## Scripts disponibles
- `npm start`: inicia el servidor de desarrollo (`ng serve`).
- `npm run build`: genera la compilación de producción en `dist/`.
- `npm test`: ejecuta las pruebas unitarias con Karma y Jasmine.
- `npm run watch`: compila en modo desarrollo y observa los cambios.

## Estructura del proyecto
- `src/app/app.component.*`: bootstrap de la aplicación y carga del `WorkoutComponent`.
- `src/app/components/workout/`: lógica de la sesión de entrenamiento y la interfaz principal.
- `src/app/data/prompts.ts`: catálogo de ejercicios y mensajes por perfil.
- `tailwind.config.js` y `src/styles.css`: configuración de estilos.

## Personalización
1. **Añadir un nuevo ejercicio**: edita `src/app/data/prompts.ts`, agrega una clave nueva con `name`, `category`, `icon`, `description` y los arrays por nivel (`1`, `2`, `3`).
2. **Modificar la voz por defecto**: ajusta la lógica en `WorkoutComponent` o borra la configuración guardada en el navegador (`localStorage` -> claves `tts.voice`, `tts.rate`, `tts.pitch`).
3. **Cambiar estilos**: utiliza las utilidades de Tailwind o extiende `styles.css`.

## Consejos para producción
- Ejecuta `npm run build` y despliega el contenido de `dist/` en cualquier servidor estático.
- Considera un *polyfill* o una guía visual alternativa para navegadores que no soporten Web Speech.
- Configura HTTPS en producción para maximizar la compatibilidad de la síntesis de voz.

## Licencia
Proyecto distribuido bajo la licencia MIT. Si reutilizas el código, enlaza a este repositorio y comparte mejoras con la comunidad.
