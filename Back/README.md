# Backend - Plataforma de Videos (FastAPI + AWS)

## Requisitos
- Python 3.11+
- PostgreSQL (local o RDS)

## Instalación local

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edita .env con tu DATABASE_URL, SECRET_KEY y buckets S3
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Docs: http://localhost:8000/docs

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/users` | Registro |
| POST | `/login` | Login (devuelve JWT) |
| GET | `/users/{id}` | Info de usuario |
| GET | `/me` | Usuario autenticado |
| POST | `/videos/upload-url?kind=video\|thumbnail&content_type=...` | URL prefirmada S3 |
| POST | `/videos` | Crear video |
| GET | `/videos` | Listar videos |
| GET | `/videos/{id}` | Detalle (incrementa vistas) |
| GET | `/videos/{id}/recommended` | Videos recomendados |
| PUT | `/videos/{id}` | Actualizar video (owner) |
| DELETE | `/videos/{id}` | Eliminar video (owner) |
| POST | `/videos/{id}/comments` | Crear comentario |
| GET | `/videos/{id}/comments` | Listar comentarios |

## Despliegue en EC2

1. Crear instancia EC2 (Ubuntu 22.04) con un **IAM Role** que dé acceso a los buckets S3 (lectura/escritura).
2. Security Group: permitir 22 (SSH) y 8000 (API) desde tu IP / el frontend.
3. Instalar dependencias del sistema:
   ```bash
   sudo apt update && sudo apt install -y python3-venv python3-pip postgresql-client
   ```
4. Clonar repo, crear venv, instalar `requirements.txt`.
5. Configurar `.env` (sin credenciales AWS — se toman del IAM Role).
6. Levantar con systemd o:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
7. Opcional: Nginx como reverse proxy + Certbot para HTTPS.

## Seguridad
- Las contraseñas se hashean con bcrypt.
- JWT firmado con HS256.
- Los archivos NO pasan por EC2: el frontend sube directo a S3 con URLs prefirmadas.
- Sin credenciales hardcodeadas: todo por variables de entorno + IAM Role.