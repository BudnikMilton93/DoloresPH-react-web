# Prompt para agente de arquitectura de API — DoloresPH

## Contexto del proyecto

Sitio web de estudio fotográfico con panel de administración privado.
El frontend ya está construido en **React 19 + TypeScript + Vite + Tailwind CSS 4**.
Tu tarea es diseñar e implementar la API REST que lo sirve.

**Base URL del frontend:** `http://localhost:5173` (dev) / dominio de producción (TBD)
**Base URL de la API:** `http://localhost:5000` (dev), variable de entorno `VITE_API_URL`

---

## Stack recomendado

- **Runtime**: Node.js 20 LTS
- **Framework**: Express 5 (o NestJS si se prefiere estructura más rígida)
- **ORM**: Prisma (simplifica migraciones y tipado)
- **Base de datos**: PostgreSQL 16
- **Autenticación**: JWT (jsonwebtoken) + bcrypt
- **Procesamiento de imágenes**: Sharp
- **Validación de payloads**: Zod (o class-validator con NestJS)
- **Subida de archivos**: Multer (middleware de Express)
- **Almacenamiento de archivos**: local `/uploads/` en dev; en producción migrar a S3/Cloudinary mediante variable de entorno
- **Rate limiting**: express-rate-limit (proteger `/api/auth/login`)
- **CORS**: configurar para aceptar solo el origen del frontend

---

## Base de datos — Tablas necesarias

### `admin_users`
```sql
id            SERIAL PRIMARY KEY
email         VARCHAR(255) UNIQUE NOT NULL
password_hash TEXT NOT NULL
created_at    TIMESTAMPTZ DEFAULT now()
```
> Un solo registro. El sistema no contempla registro público. El primer usuario
> se crea via seed/script de inicialización.

---

### `sections`
```sql
id         SERIAL PRIMARY KEY
name       VARCHAR(100) NOT NULL          -- 'Hero', 'About', 'Portfolio', 'Services', 'Essays', 'Testimonials', 'Contact'
is_visible BOOLEAN NOT NULL DEFAULT true
sort_order INTEGER NOT NULL DEFAULT 0
```

---

### `photos`
```sql
id            SERIAL PRIMARY KEY
url           TEXT NOT NULL               -- ruta pública a la imagen original/optimizada
thumbnail_url TEXT                        -- ruta al thumbnail (generado automáticamente)
alt           VARCHAR(255) DEFAULT ''
category      VARCHAR(100) DEFAULT ''     -- filtro libre, ej. 'Retrato', 'Boda'
is_visible    BOOLEAN NOT NULL DEFAULT true
sort_order    INTEGER NOT NULL DEFAULT 0
essay_id      INTEGER REFERENCES essays(id) ON DELETE SET NULL   -- nullable
created_at    TIMESTAMPTZ DEFAULT now()
```

---

### `essays`
```sql
id          SERIAL PRIMARY KEY
title       VARCHAR(255) NOT NULL
description TEXT DEFAULT ''
is_visible  BOOLEAN NOT NULL DEFAULT true
sort_order  INTEGER NOT NULL DEFAULT 0
created_at  TIMESTAMPTZ DEFAULT now()
updated_at  TIMESTAMPTZ DEFAULT now()
```

---

### `site_content`
```sql
key        VARCHAR(100) PRIMARY KEY           -- ej. 'hero_headline', 'logo_url', 'brandmark_hero'
value      TEXT NOT NULL DEFAULT ''
updated_at TIMESTAMPTZ DEFAULT now()
```

Claves predefinidas a sembrar en el seed inicial:

| key                | valor por defecto                       |
|--------------------|----------------------------------------|
| `hero_headline`    | `Dolores PH`                           |
| `hero_subtext`     | `Fotografía de autor`                  |
| `about_title`      | `Sobre mí`                             |
| `about_text`       | (texto largo)                          |
| `about_photo_url`  | ``                                     |
| `services_list`    | (JSON string con array de servicios)   |
| `contact_email`    | ``                                     |
| `contact_instagram`| ``                                     |
| `logo_url`         | `/logo.png`                            |
| `brandmark_hero`   | `/brandmark-1.svg`                     |
| `brandmark_about`  | `/brandmark-2.svg`                     |
| `brandmark_services`| `/brandmark-1.svg`                    |
| `brandmark_contact`| `/brandmark-2.svg`                     |
| `brandmark_footer` | `/brandmark-2.svg`                     |
| `custom_fonts`     | ``                                     |

---

### `theme_config`
```sql
id          SERIAL PRIMARY KEY            -- siempre una sola fila (id = 1)
primary     VARCHAR(20) DEFAULT '#7C5CBF'
accent      VARCHAR(20) DEFAULT '#B08AD9'
background  VARCHAR(20) DEFAULT '#F9F6FF'
text_color  VARCHAR(20) DEFAULT '#2D2040'
surface     VARCHAR(20) DEFAULT '#FFFFFF'
font_heading VARCHAR(100) DEFAULT 'Playfair Display'
font_body    VARCHAR(100) DEFAULT 'Inter'
updated_at  TIMESTAMPTZ DEFAULT now()
```

---

### `testimonials`
```sql
id         SERIAL PRIMARY KEY
author     VARCHAR(255) NOT NULL
handle     VARCHAR(100) DEFAULT ''       -- ej. @usuario de Instagram
text       TEXT NOT NULL
avatar_url TEXT DEFAULT ''
is_visible BOOLEAN NOT NULL DEFAULT true
sort_order INTEGER NOT NULL DEFAULT 0
created_at TIMESTAMPTZ DEFAULT now()
```

---

## Endpoints — Matriz completa

### Convenciones
- Todas las rutas bajo prefijo `/api`
- Respuestas siempre en `application/json`
- camelCase en JSON de respuesta (`isVisible`, `sortOrder`, `avatarUrl`)
- Rutas protegidas requieren header: `Authorization: Bearer <jwt>`
- Errores: `{ "error": "mensaje legible" }` con código HTTP apropiado

---

### Auth — `/api/auth`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Obtener JWT |

**POST /api/auth/login**
```json
// Body
{ "email": "admin@example.com", "password": "plaintext" }

// 200 OK
{ "token": "eyJ..." }

// 401
{ "error": "Credenciales inválidas" }
```
> Aplicar rate limiting: máximo 10 intentos por IP cada 15 minutos.
> Lockout de 30 minutos tras 5 fallos consecutivos (opcional pero recomendado).

---

### Site Config — `/api/site-config`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/site-config` | No | Devuelve todo el estado del sitio |

**GET /api/site-config**
```jsonc
// 200 OK — estructura que el frontend consume al iniciar
{
  "sections": [ { "id": 1, "name": "Hero", "isVisible": true, "sortOrder": 0 }, ... ],
  "photos":   [ { "id": 1, "url": "/uploads/foto.webp", "thumbnailUrl": "/uploads/foto-thumb.webp", "alt": "", "category": "Retrato", "isVisible": true, "sortOrder": 0, "essayId": null }, ... ],
  "essays":   [ { "id": 1, "title": "Ensayo 1", "description": "", "isVisible": true, "sortOrder": 0, "photos": [ /* fotos con essayId === este essay */ ] }, ... ],
  "content":  [ { "key": "hero_headline", "value": "Dolores PH" }, ... ],
  "theme":    { "id": 1, "primary": "#7C5CBF", "accent": "#B08AD9", "background": "#F9F6FF", "textColor": "#2D2040", "surface": "#FFFFFF", "fontHeading": "Playfair Display", "fontBody": "Inter", "updatedAt": "..." },
  "testimonials": [ { "id": 1, "author": "Ana G.", "handle": "@anag", "text": "...", "avatarUrl": "", "isVisible": true, "sortOrder": 0 }, ... ]
}
```
> Este endpoint es el único que el frontend público llama. Debe ser rápido.
> Considera cachear la respuesta 30–60 segundos en memoria (ej. `node-cache`)
> e invalidar el caché cuando cualquier recurso es modificado.

---

### Sections — `/api/sections`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| PATCH | `/api/sections/:id` | Sí | Actualizar visibilidad o sortOrder |

**PATCH /api/sections/:id**
```json
// Body (campos opcionales)
{ "isVisible": false, "sortOrder": 3 }

// 200 OK
{ "id": 2, "name": "About", "isVisible": false, "sortOrder": 3 }
```

---

### Photos — `/api/photos`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/photos` | Sí | Subir imagen + crear registro |
| PATCH | `/api/photos/:id` | Sí | Actualizar metadatos (alt, category, isVisible, sortOrder, essayId) |
| DELETE | `/api/photos/:id` | Sí | Eliminar imagen y registro |

**POST /api/photos** — `multipart/form-data`
```
Campo: file      → archivo de imagen (jpeg, png, webp, avif — ver §Imágenes)
Campo: alt       → string opcional
Campo: category  → string opcional
Campo: essayId   → número opcional
```
```json
// 201 Created
{
  "id": 10, "url": "/uploads/photos/abc123.webp",
  "thumbnailUrl": "/uploads/photos/abc123-thumb.webp",
  "alt": "", "category": "Retrato", "isVisible": true, "sortOrder": 99, "essayId": null
}
```

**PATCH /api/photos/:id**
```json
// Body (campos opcionales)
{ "alt": "nueva descripción", "isVisible": false, "sortOrder": 2, "essayId": 3 }

// 200 OK — mismo shape que POST
```

**DELETE /api/photos/:id**
```
// 204 No Content
// Eliminar también los archivos físicos (original + thumbnail) del disco / S3
```

---

### Essays — `/api/essays`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/essays` | Sí | Crear ensayo |
| PATCH | `/api/essays/:id` | Sí | Editar metadatos |
| DELETE | `/api/essays/:id` | Sí | Eliminar (no desvincula fotos, las pone essayId=null) |

**POST /api/essays**
```json
// Body
{ "title": "Verano 2025", "description": "...", "isVisible": true, "sortOrder": 0 }

// 201 Created
{ "id": 4, "title": "Verano 2025", "description": "...", "isVisible": true, "sortOrder": 0, "photos": [] }
```

**PATCH /api/essays/:id**
```json
// Body (campos opcionales)
{ "title": "Nuevo título", "isVisible": false, "sortOrder": 1 }

// 200 OK — mismo shape que POST
```

---

### Content — `/api/content`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| PATCH | `/api/content/:key` | Sí | Actualizar valor de una clave de contenido |

**PATCH /api/content/:key**
```json
// Body
{ "value": "Nuevo texto del hero" }

// 200 OK
{ "key": "hero_headline", "value": "Nuevo texto del hero" }
```
> Si `key` no existe en `site_content`, hacer upsert (crear el registro).
> No permitir que `key` sea vacío o contenga caracteres no permitidos (validar con `/^[a-z0-9_]+$/`).

---

### Theme — `/api/theme`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| PATCH | `/api/theme` | Sí | Actualizar configuración de tema |

**PATCH /api/theme**
```json
// Body (todos los campos opcionales)
{
  "primary": "#7C5CBF",
  "accent": "#B08AD9",
  "background": "#F9F6FF",
  "textColor": "#2D2040",
  "surface": "#FFFFFF",
  "fontHeading": "Playfair Display",
  "fontBody": "Inter"
}

// 200 OK — fila completa actualizada
{
  "id": 1,
  "primary": "...", "accent": "...", "background": "...",
  "textColor": "...", "surface": "...",
  "fontHeading": "...", "fontBody": "...",
  "updatedAt": "2026-04-15T..."
}
```
> Validar que los campos de color sean hex válidos (`/^#[0-9A-Fa-f]{6}$/`).
> Siempre operar sobre la fila con `id = 1` (upsert en seed).

---

### Media Assets — `/api/media`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/media` | Sí | Subir asset genérico (logo, brandmarks PNG/SVG) |

**POST /api/media** — `multipart/form-data`
```
Campo: file → PNG o SVG (tipos MIME permitidos: image/png, image/svg+xml)
```
```json
// 201 Created
{ "url": "/uploads/media/logo-1713123456.png" }
```
> Este endpoint es usado por BrandingManager para subir el logo y los 5 brandmarks.
> PNG: comprimir lossless con Sharp (ver §Imágenes).
> SVG: validar que sea SVG bien formado; **no ejecutar ni sanitizar JS inline** (seguridad).
> **No** aplicar resize de dimensiones; la fotografa controla el tamaño visual desde CSS.

---

### Testimonials — `/api/testimonials`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/testimonials` | Sí | Crear testimonio |
| PATCH | `/api/testimonials/:id` | Sí | Editar testimonio |
| DELETE | `/api/testimonials/:id` | Sí | Eliminar testimonio |

**POST /api/testimonials**
```json
// Body
{ "author": "Ana G.", "handle": "@anag", "text": "Excelente trabajo...", "avatarUrl": "", "isVisible": true, "sortOrder": 0 }

// 201 Created — misma estructura + id
```

**PATCH /api/testimonials/:id**
```json
// Body (campos opcionales)
{ "isVisible": false, "sortOrder": 2, "text": "..." }

// 200 OK — fila completa
```

**DELETE /api/testimonials/:id**
```
// 204 No Content
```

---

## Controladores sugeridos (estructura de archivos)

```
src/
  controllers/
    auth.controller.ts          → login
    sections.controller.ts      → patchSection
    photos.controller.ts        → uploadPhoto, patchPhoto, deletePhoto
    essays.controller.ts        → createEssay, patchEssay, deleteEssay
    content.controller.ts       → patchContent
    theme.controller.ts         → patchTheme
    media.controller.ts         → uploadMediaAsset
    testimonials.controller.ts  → createTestimonial, patchTestimonial, deleteTestimonial
    siteConfig.controller.ts    → getSiteConfig
  middleware/
    auth.middleware.ts           → verifica JWT, adjunta req.user
    rateLimiter.middleware.ts    → express-rate-limit para /auth/login
    upload.middleware.ts         → Multer config (memoryStorage para Sharp; diskStorage para assets pequeños)
    validate.middleware.ts       → wrapper de Zod que llama next(error) si falla
  services/
    image.service.ts             → lógica de Sharp (resize, compress, thumbnail, detectar orientación EXIF)
    cache.service.ts             → invalidación del caché de /api/site-config
  routes/
    index.ts                     → monta todos los routers
  prisma/
    schema.prisma
    seed.ts
```

---

## Autenticación y seguridad

### Flujo JWT
1. `POST /api/auth/login` → bcrypt.compare contra `password_hash` en `admin_users`
2. Si válido: `jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' })`
3. Responder `{ token }` — el frontend lo guarda en `sessionStorage` (ya implementado)
4. Rutas protegidas: middleware extrae `Authorization: Bearer <token>`, verifica con `jwt.verify()`
5. Si token expirado o inválido → 401 `{ "error": "No autorizado" }`

### Variables de entorno requeridas
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/doloresph
JWT_SECRET=<string aleatorio >= 32 chars, nunca hardcodeado>
UPLOAD_DIR=./uploads          # ruta local de almacenamiento
ALLOWED_ORIGIN=http://localhost:5173
PORT=5000
NODE_ENV=development
```

### Seguridad adicional (OWASP)
- Helmet.js para headers HTTP de seguridad
- CORS configurado solo para `ALLOWED_ORIGIN`
- Sanitizar `key` en PATCH `/api/content/:key` con whitelist de caracteres
- SVG: pasar por DOMPurify server-side o usar `svgo` + rechazar SVGs con `<script>` inline
- No exponer stack traces en producción (`NODE_ENV=production`)
- Usar `crypto.timingSafeEqual` para comparaciones de tokens si se implementa refresh

---

## Manejo de imágenes de gran tamaño

### Pipeline para fotos de portfolio (`POST /api/photos`)

El objetivo es convertir RAW/DSLR JPEGs pesados (10–50 MB) en assets eficientes para web sin pérdida de calidad visual perceptible.

```
Input → Multer memoryStorage (no escribe a disco primero)
       ↓
       Sharp pipeline:
       1. Detectar orientación EXIF y aplicar rotate() automático
       2. Resize: max width 1920px, max height 1080px
          → fit: 'inside' (preserva aspect ratio, no recorta)
          → withoutEnlargement: true (no ampliar si imagen es pequeña)
       3. Convertir a WebP:
          → quality: 82
          → effort: 4 (balance velocidad/compresión)
       → Guardar como: uploads/photos/<uuid>.webp

       Thumbnail paralelo (mismo buffer de entrada):
       1. Resize: max 600px width, max 600px height, fit: 'inside'
       2. WebP quality: 75
       → Guardar como: uploads/photos/<uuid>-thumb.webp
```

**Formatos de entrada admitidos:** JPEG, PNG, WebP, AVIF, TIFF
**Validar con Sharp** que el buffer sea una imagen real antes de procesar (evita exploits).

### Pipeline para assets de marca (`POST /api/media`)

```
PNG:
  Sharp → comprimir con png() { compressionLevel: 9, palette: false }
  → No redimensionar (el CSS maneja el tamaño visual)
  → Guardar como: uploads/media/<slug>-<timestamp>.png

SVG:
  Pasar por svgo para optimizar y eliminar scripts
  → Guardar como: uploads/media/<slug>-<timestamp>.svg
```

### Límites de Multer
```js
// Fotos de portfolio
limits: { fileSize: 60 * 1024 * 1024 }  // 60 MB máximo input

// Assets de marca (logo, brandmarks)
limits: { fileSize: 5 * 1024 * 1024 }   // 5 MB máximo
```

### Consideraciones de producción
- En producción reemplazar `diskStorage` por streaming directo a **AWS S3** o **Cloudinary** desde el buffer de Sharp (sin escribir temporales a disco)
- Retornar la URL pública de S3/Cloudinary en vez de `/uploads/...`
- Usar presigned URLs de S3 para mayor seguridad si los archivos deben ser privados (no aplica aquí — son imágenes públicas)

---

## Seed inicial

El script de seed debe:
1. Crear el usuario admin: `admin@doloresph.com` con contraseña segura hasheada con bcrypt rounds=12
2. Insertar las 7 secciones con sus `sort_order` iniciales
3. Insertar todas las claves de `site_content` listadas en la tabla de arriba
4. Insertar la fila de `theme_config` con valores por defecto
5. Insertar 3–4 testimonios de muestra

```bash
npx prisma db seed
# o
node dist/prisma/seed.js
```

---

## Resumen de endpoints por recurso

| Recurso | Rutas públicas | Rutas protegidas |
|---------|----------------|-----------------|
| Auth | — | POST /api/auth/login |
| Site config | GET /api/site-config | — |
| Sections | — | PATCH /api/sections/:id |
| Photos | — | POST /api/photos · PATCH /api/photos/:id · DELETE /api/photos/:id |
| Essays | — | POST /api/essays · PATCH /api/essays/:id · DELETE /api/essays/:id |
| Content | — | PATCH /api/content/:key |
| Theme | — | PATCH /api/theme |
| Media assets | — | POST /api/media |
| Testimonials | — | POST /api/testimonials · PATCH /api/testimonials/:id · DELETE /api/testimonials/:id |

**Total: 1 pública + 14 protegidas = 15 rutas**

---

## Notas finales para el agente

- El frontend ya existe y consume exactamente estas rutas y shapes — no cambiar paths ni estructura de respuesta sin acordar con el equipo frontend
- El shape de respuesta debe usar **camelCase** en JSON (`isVisible`, no `is_visible`)
- Prisma puede mapear `is_visible` → `isVisible` con `@map` en el schema
- La tabla `essays` en el endpoint `GET /api/site-config` debe incluir el array `photos` (JOIN) prefiltrado por `is_visible = true` para uso público; en admin se devuelven todos
- Implementar middleware global de manejo de errores que log en consola y devuelva `{ error }` limpio al cliente
