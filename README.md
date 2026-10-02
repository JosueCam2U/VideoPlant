# Plataforma de Videos — React + FastAPI + AWS

Single Page Application tipo plataforma de videos (YouTube-like) construida con **React + Vite** en el frontend, **FastAPI** en el backend, y desplegada sobre **Amazon S3**, **Amazon EC2** y **Amazon RDS**.

---

## 📐 Arquitectura general

    ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
    │   Navegador  │─────▶│  S3 Frontend │      │  S3 Videos   │
    │              │      │  (SPA React) │      │  (MP4)       │
    └──────┬───────┘      └──────────────┘      └──────────────┘
           │                                            ▲
           │  HTTPS                                     │ PUT prefirmado
           ▼                                            │
    ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
    │  EC2         │─────▶│  RDS         │      │ S3 Thumbs    │
    │  FastAPI     │      │  PostgreSQL  │      │ (JPG/PNG)    │
    └──────────────┘      └──────────────┘      └──────────────┘

| Componente | Servicio AWS | Propósito |
|---|---|---|
| SPA React (build `dist/`) | **S3 Frontend** | Servir la aplicación web |
| Archivos MP4 | **S3 Videos** | Guardar los videos |
| Miniaturas JPG/PNG | **S3 Miniaturas** | Guardar imágenes de portada |
| API FastAPI | **EC2** | Lógica de negocio, auth, endpoints |
| PostgreSQL | **RDS** | Datos estructurados (usuarios, videos, comentarios) |

**Regla de oro:** las credenciales nunca van en el código. Se usan **variables de entorno** + **IAM Roles** + **Security Groups**.

---

# Estructura del proyecto (monorepo)

    exam/
    ├── Back/          # Backend FastAPI
    └── Front/         # Frontend React + Vite

---

# 🔧 BACKEND — `/Back`

## Estructura

    Back/
    ├── app/
    │   ├── __init__.py
    │   ├── main.py               # Punto de entrada FastAPI + CORS + routers
    │   ├── config.py             # Settings (pydantic-settings, lee .env)
    │   ├── database.py           # Engine SQLAlchemy + SessionLocal + Base
    │   │
    │   ├── models/               # Tablas SQLAlchemy (ORM)
    │   │   ├── user.py
    │   │   ├── video.py
    │   │   └── comment.py
    │   │
    │   ├── schemas/              # Validación Pydantic (entrada/salida)
    │   │   ├── user.py
    │   │   ├── video.py
    │   │   └── comment.py
    │   │
    │   ├── routers/              # Endpoints agrupados por recurso
    │   │   ├── users.py
    │   │   ├── videos.py
    │   │   └── comments.py
    │   │
    │   ├── services/             # Lógica auxiliar
    │   │   ├── auth.py           # get_current_user (JWT)
    │   │   └── s3.py             # URLs prefirmadas S3
    │   │
    │   └── utils/
    │       └── security.py       # Hash bcrypt + JWT encode/decode
    │
    ├── requirements.txt
    ├── .env.example
    ├── .gitignore
    └── README.md

## Puntos clave del Backend

### 1. `app/main.py` — Punto de entrada
- Crea la app FastAPI con `title`, `version`, `lifespan` (crea tablas al arrancar).
- Configura **CORS** con `ALLOWED_ORIGINS` desde `.env`.
- Monta los tres routers: `users`, `videos`, `comments`.
- Expone `/docs` automáticamente (Swagger UI).
- Endpoints de health: `/` y `/health`.

### 2. `app/config.py` — Configuración
- Usa `pydantic-settings` para leer `.env`.
- Variables:
  - `DATABASE_URL` (RDS o local)
  - `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` (JWT)
  - `AWS_REGION`, `S3_BUCKET_VIDEOS`, `S3_BUCKET_THUMBNAILS`
  - `ALLOWED_ORIGINS` (lista separada por comas)
- **No contiene credenciales hardcodeadas**.

### 3. `app/database.py` — Conexión
- `create_engine` con `pool_pre_ping=True` (tolera caídas de RDS).
- `SessionLocal` como factory de sesiones.
- `Base` como clase base para los modelos.
- `get_db()` es la dependencia FastAPI que abre/cierra sesión por request.

### 4. Modelos (`app/models/`)
- **`User`**: `id`, `name`, `email` (único), `password_hash`, `created_at`.
  - Relación 1-N con `Video` y `Comment` con `cascade="all, delete-orphan"`.
- **`Video`**: `id`, `title`, `description`, `video_url`, `thumbnail_url`, `views`, `user_id`, `created_at`.
  - `owner` (User) y `comments` (lista).
- **`Comment`**: `id`, `content`, `user_id`, `video_id`, `created_at`.

### 5. Schemas (`app/schemas/`)
- **`UserCreate`** → valida `email` con `EmailStr`, `password` mínimo 6.
- **`UserOut`** → nunca expone `password_hash`.
- **`Token`** → `{access_token, token_type, user}`.
- **`VideoCreate`** → valida `video_url` y `thumbnail_url` como `HttpUrl`.
- **`VideoDetail`** → extiende `VideoOut` con `comments`.
- **`CommentCreate`** → `content` entre 1 y 1000 chars.

### 6. Routers (`app/routers/`)

**`users.py`**

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/users` | Registro (hash bcrypt) |
| POST | `/login` | Login → JWT |
| GET | `/users/{id}` | Info pública |
| GET | `/me` | Usuario autenticado |

**`videos.py`**

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/videos/upload-url` | URL prefirmada S3 (kind=video\|thumbnail) |
| POST | `/videos` | Crear video |
| GET | `/videos` | Listar (join owner) |
| GET | `/videos/{id}` | Detalle (incrementa `views`) |
| GET | `/videos/{id}/recommended` | Recomendados (mismo autor + populares) |
| PUT | `/videos/{id}` | owner | Actualizar |
| DELETE | `/videos/{id}` | owner | Eliminar |

**`comments.py`**

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/videos/{id}/comments` | Crear comentario |
| GET | `/videos/{id}/comments` | Listar comentarios |

### 7. `app/services/s3.py` — Subida directa a S3
- **No recibe archivos**: genera **URLs prefirmadas** (`generate_presigned_url`).
- El frontend hace `PUT` directo a S3 → ahorra ancho de banda de EC2.
- Devuelve `{upload_url, file_url, key}`.
- En EC2 las credenciales vienen del **IAM Role** (boto3 las detecta solo).

### 8. `app/utils/security.py`
- Hash con **bcrypt** (`passlib.CryptContext`).
- JWT con `python-jose` (HS256).
- `create_access_token(subject)` → firma `{sub, exp}`.
- `decode_token(token)` → devuelve `sub` o `None`.

### 9. `app/services/auth.py`
- `HTTPBearer` + `decode_token` → `get_current_user`.
- Lanza `401` si falta token, es inválido o el usuario no existe.

## Endpoints (contrato final)

    POST   /users
    POST   /login
    GET    /users/{id}
    GET    /me

    POST   /videos/upload-url?kind=video|thumbnail&content_type=...
    POST   /videos
    GET    /videos
    GET    /videos/{id}
    GET    /videos/{id}/recommended
    PUT    /videos/{id}
    DELETE /videos/{id}

    POST   /videos/{id}/comments
    GET    /videos/{id}/comments

    GET    /docs        ← Swagger UI

## Variables de entorno (`.env`)

    DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/videosdb
    SECRET_KEY=change-me-with-a-long-random-string
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=60

    AWS_REGION=us-east-1
    S3_BUCKET_VIDEOS=videos-mp4-tunombre
    S3_BUCKET_THUMBNAILS=videos-thumbnails-tunombre

    ALLOWED_ORIGINS=http://localhost:5173,http://videos-spa-frontend-tunombre.s3-website-us-east-1.amazonaws.com

> En **EC2** NO se ponen `AWS_ACCESS_KEY_ID` ni `AWS_SECRET_ACCESS_KEY`. El IAM Role las inyecta.

## Correr en local

    cd Back
    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    cp .env.example .env   # editar
    uvicorn app.main:app --reload

Docs: http://localhost:8000/docs

---

# 🎨 FRONTEND — `/Front`

## Estructura

    Front/
    ├── public/
    │   └── favicon.svg
    │
    ├── src/
    │   ├── main.jsx                 # Bootstrap React + Router + AuthProvider
    │   ├── App.jsx                  # Definición de rutas
    │   ├── index.css                # Variables CSS globales + reset
    │   │
    │   ├── api/                     # Cliente HTTP contra FastAPI
    │   │   ├── client.js            # fetch wrapper + JWT automático
    │   │   ├── users.js
    │   │   ├── videos.js
    │   │   └── comments.js
    │   │
    │   ├── context/
    │   │   └── AuthContext.jsx      # Estado global del usuario
    │   │
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   └── useFetch.js
    │   │
    │   ├── utils/
    │   │   ├── formatDate.js        # "hace 2 días", "1.2 K vistas"
    │   │   └── uploadToS3.js        # PUT directo con URL prefirmada
    │   │
    │   ├── components/
    │   │   ├── atoms/               # Piezas indivisibles
    │   │   │   ├── Icon/
    │   │   │   ├── Button/
    │   │   │   ├── IconButton/
    │   │   │   ├── Input/
    │   │   │   ├── Avatar/
    │   │   │   └── Spinner/
    │   │   │
    │   │   ├── molecules/           # Combinación de átomos
    │   │   │   ├── SearchBar/
    │   │   │   ├── VideoCard/
    │   │   │   ├── CommentItem/
    │   │   │   ├── CommentForm/
    │   │   │   ├── UploadForm/
    │   │   │   ├── UserBadge/
    │   │   │   └── ProtectedRoute/
    │   │   │
    │   │   └── organisms/           # Secciones grandes
    │   │       ├── Sidebar/
    │   │       ├── TopBar/
    │   │       ├── Layout/
    │   │       ├── VideoGrid/
    │   │       ├── VideoPlayer/
    │   │       ├── RecommendedList/
    │   │       └── CommentsSection/
    │   │
    │   └── pages/
    │       ├── AuthPage/            # Página 1: Registro / Login
    │       ├── HomePage/            # Página 2: Principal
    │       ├── WatchPage/           # Página 3: Reproductor
    │       └── ProfilePage/         # Página 4: Perfil
    │
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── .env.example
    └── .gitignore

## Puntos clave del Frontend

### 1. Reglas de HTML
- **Semántico puro**: `header`, `nav`, `main`, `section`, `article`, `aside`, `figure`, `footer`, `ul/li`.
- **Prohibido `<div>` como wrapper** para agrupar. Solo se usa `<div id="root">` en `index.html` (obligatorio por React).

### 2. Átomos — `components/atoms`
Cada carpeta tiene `<Nombre>.jsx` + `<Nombre>.module.css` (excepto `Icon`, que no tiene CSS porque el SVG hereda con `currentColor`).

| Componente | Propósito |
|---|---|
| `Icon` | Set de íconos SVG inline (`home`, `search`, `upload`, `user`, `logout`, `like`, `comment`, `share`, `menu`, `trash`, `edit`, `play`, `clock`) |
| `Button` | Variantes: `primary`, `secondary`, `ghost`, `danger`; prop `fullWidth` |
| `IconButton` | Botón circular para íconos |
| `Input` | Label + input + mensaje de error; genera `id` con `useId` |
| `Avatar` | Imagen circular con fallback automático |
| `Spinner` | Indicador de carga |

### 3. Moléculas — `components/molecules`

| Componente | Propósito |
|---|---|
| `SearchBar` | Formulario con ícono, dispara `onSearch` |
| `VideoCard` | Miniatura + título + autor + vistas + fecha |
| `CommentItem` | Avatar + nombre + timestamp + contenido |
| `CommentForm` | Input + botón, requiere auth |
| `UploadForm` | Crear/editar video: título, descripción, archivo MP4, miniatura; sube a S3 con URL prefirmada |
| `UserBadge` | Avatar + nombre + subtítulo |
| `ProtectedRoute` | Redirige a `/auth` si no hay sesión |

### 4. Organismos — `components/organisms`

| Componente | Propósito |
|---|---|
| `Sidebar` | Navegación fija a la izquierda |
| `TopBar` | Buscador + avatar + logout |
| `Layout` | Sidebar + TopBar + `<Outlet/>` + footer |
| `VideoGrid` | Grilla responsiva de `VideoCard` |
| `VideoPlayer` | `<video controls>` con poster |
| `RecommendedList` | Lista lateral de videos recomendados |
| `CommentsSection` | Título + form + lista de comentarios |

### 5. Páginas — `pages/`

| Página | Ruta | Contenido |
|---|---|---|
| **AuthPage** | `/auth` | Registro (nombre, correo, contraseña) e inicio de sesión con toggle |
| **HomePage** | `/` | Catálogo dinámico desde `GET /videos` + búsqueda por query |
| **WatchPage** | `/watch/:id` | Video + título + descripción + autor + vistas + comentarios + recomendados |
| **ProfilePage** | `/profile/:id` | Info del usuario + contador + lista de videos + crear/editar/eliminar |

### 6. API Client — `api/client.js`
- `BASE = import.meta.env.VITE_API_URL`.
- Lee el token de `localStorage` y lo inyecta como `Authorization: Bearer ...`.
- Maneja `204`, JSON y errores con `detail`.
- Métodos: `api.get`, `api.post`, `api.put`, `api.del`.

### 7. Auth — `context/AuthContext.jsx`
- Guarda `user`, `loading`, `isAuthenticated`.
- `login`, `register`, `logout`.
- Al montar, si hay token, llama a `/me` para rehidratar.

### 8. Subida directa a S3 — `utils/uploadToS3.js`
1. Llama a `POST /videos/upload-url?kind=...&content_type=...`.
2. Recibe `{upload_url, file_url}`.
3. Hace `PUT` del archivo a `upload_url`.
4. Devuelve `file_url` para guardarlo en `POST /videos`.

**Ventaja:** el archivo nunca pasa por EC2.

### 9. Vite config
- `base: './'` → rutas relativas, obligatorio para S3.
- `build.outDir: 'dist'`.
- **Dev proxy**: `/api/*` → `http://localhost:8000/*`.
- **Prod**: se cambia `VITE_API_URL` a la URL de EC2 antes del build.

### 10. Rutas (React Router)

    /auth              → AuthPage (pública)
    /                  → HomePage (pública)
    /watch/:id         → WatchPage (pública)
    /profile/:id       → ProfilePage (protegida)
    *                  → redirect a /

## Variables de entorno (`.env`)

    # Dev
    VITE_API_URL=/api

    # Prod (antes del build final)
    # VITE_API_URL=http://<ip-publica-ec2>:8000

## Correr en local

    cd Front
    npm install
    cp .env.example .env
    npm run dev
    # http://localhost:5173

## Build para S3

    npm run build
    aws s3 sync dist/ s3://videos-spa-frontend-tunombre --delete

Sube **solo el contenido de `dist/`**. Nunca `src/`, `node_modules/` ni `package.json`.

---

# DESPLIEGUE EN AWS

## S3 — 3 buckets

### Bucket 1: Frontend
- Nombre: `videos-spa-frontend-tunombre`
- **Block Public Access**:  
- **Static website hosting**: 
  - Index: `index.html`
  - Error: `index.html` (para SPA fallback)
- **Bucket policy**:

      {
        "Version": "2012-10-17",
        "Statement": [{
          "Sid": "PublicReadGetObject",
          "Effect": "Allow",
          "Principal": "*",
          "Action": "s3:GetObject",
          "Resource": "arn:aws:s3:::videos-spa-frontend-tunombre/*"
        }]
      }

- **CORS**: `GET, HEAD` desde `*`.

### Bucket 2: Videos
- Nombre: `videos-mp4-tunombre`
- Público para lectura.
- **CORS**:

      [{
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
      }]

- Restricciones: MP4, máx 100 MB.

### Bucket 3: Miniaturas
- Nombre: `videos-thumbnails-tunombre`
- Público para lectura.
- Mismo CORS que Videos.
- Restricciones: JPG, JPEG, PNG.

## RDS — PostgreSQL
- Engine: PostgreSQL 15/16
- Instance: `db.t3.micro` o `db.t4g.micro`
- Storage: 20 GB gp3
- **Publicly accessible**: 
- DB name: `videosdb`
- Puerto: `5432`
- Security Group `rds-videos-sg` → inbound 5432 desde IP de EC2 y tu IP.
- Endpoint se usa en `DATABASE_URL` del `.env` del backend.

## EC2 — FastAPI
- AMI: Ubuntu 22.04 LTS
- Tipo: `t2.micro` / `t3.small`
- Security Group `ec2-videos-sg`:
  - SSH (22) → tu IP
  - Custom TCP (8000) → `0.0.0.0/0`
- **IAM Role `ec2-s3-videos-role`** con `AmazonS3FullAccess` adjunto.
  - boto3 detecta credenciales automáticamente. Sin llaves en `.env`.

### Instalación en EC2

    sudo apt update
    sudo apt install -y python3-venv python3-pip postgresql-client git nginx
    git clone https://github.com/tu-usuario/tu-repo.git
    cd tu-repo/Back
    python3 -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    nano .env      # pegar el .env con DATABASE_URL de RDS y buckets
    uvicorn app.main:app --host 0.0.0.0 --port 8000

### systemd (`/etc/systemd/system/videos-api.service`)

    [Unit]
    Description=FastAPI Videos API
    After=network.target

    [Service]
    User=ubuntu
    WorkingDirectory=/home/ubuntu/tu-repo/Back
    Environment="PATH=/home/ubuntu/tu-repo/Back/.venv/bin"
    ExecStart=/home/ubuntu/tu-repo/Back/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
    Restart=always

    [Install]
    WantedBy=multi-user.target

    sudo systemctl daemon-reload
    sudo systemctl enable videos-api
    sudo systemctl start videos-api

---

# Conexión entre servicios

| Origen | Destino | Cómo |
|---|---|---|
| SPA (S3) | FastAPI (EC2) | `VITE_API_URL` apunta a `http://<ip-ec2>:8000` |
| FastAPI (EC2) | RDS | `DATABASE_URL` en `.env` |
| FastAPI (EC2) | S3 Videos/Miniaturas | boto3 + **IAM Role** |
| Navegador | S3 Videos/Miniaturas | `PUT` con URL prefirmada |
| Navegador | S3 Frontend | Static website hosting público |

**Nunca se ponen credenciales AWS en el código.** Todo por IAM Role + variables de entorno.



---

# Flujo completo del usuario

1. Entra a la SPA (S3 Frontend).
2. Se registra (`POST /users`) o inicia sesión (`POST /login` → JWT).
3. Ve el catálogo (`GET /videos`).
4. Entra a un video (`GET /videos/{id}` → incrementa vistas).
5. Comenta (`POST /videos/{id}/comments`).
6. Ve recomendados (`GET /videos/{id}/recommended`).
7. Va a su perfil (`GET /users/{id}` + `GET /videos` filtrado).
8. Sube un video:
   - `POST /videos/upload-url?kind=video` → `PUT` a S3.
   - `POST /videos/upload-url?kind=thumbnail` → `PUT` a S3.
   - `POST /videos` con las URLs finales.
9. Edita (`PUT /videos/{id}`) o elimina (`DELETE /videos/{id}`).
10. Cierra sesión (borra token de `localStorage`).
