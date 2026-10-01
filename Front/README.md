# Frontend - Plataforma de Videos (React + Vite)

## Requisitos

- Node.js 20+
- npm
- Backend FastAPI disponible en `http://localhost:8000`

## Desarrollo

```bash
npm install
cp .env.example .env
npm run dev
```

La app queda disponible en `http://localhost:5173`. El proxy de Vite redirige `/api/*` a `http://localhost:8000/*`.

## Build para S3

```bash
npm run build
npm run preview
```

El build estático queda en `dist/`. Sube el contenido de esa carpeta al bucket S3 con Static Website Hosting. Configura `index.html` como documento índice y de error para el fallback de las rutas SPA. Define `VITE_API_URL` a la URL pública del backend antes de ejecutar el build final.

## Estructura

- `components/atoms`: controles básicos y elementos indivisibles.
- `components/molecules`: componentes construidos a partir de átomos.
- `components/organisms`: secciones completas de la interfaz.
- `pages`: autenticación, catálogo, reproductor y perfil.
- `api`: cliente HTTP centralizado y módulos de endpoints.
- `context` y `hooks`: sesión JWT y carga de datos.
- `utils`: formateo de fechas y subida directa a S3 con URL prefirmada.

Los componentes visuales tienen estilos locales con CSS Modules. El markup usa elementos semánticos; el único `div` de montaje es `#root` en `index.html`.
