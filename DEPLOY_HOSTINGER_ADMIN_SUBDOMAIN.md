## Deploy del panel a `admin.imparablesjhn.shop` (Hostinger)

### 1) DNS / Subdominio
- En Hostinger crea el subdominio **`admin`** para `imparablesjhn.shop`.
- Apunta el subdominio a una carpeta tipo: `public_html/admin` (según tu panel de Hostinger).

### 2) Build del panel
En local:

```bash
cd panel
cp .env.example .env
# VITE_API_BASE_URL debe ser donde vive la API Laravel, p. ej. https://app.imparablesjhn.shop
npm install
npm run build
```

Esto genera `panel/dist/`.

### 3) Subida de archivos (SPA + router history)
Sube **TODO** el contenido de `panel/dist/` a la carpeta del subdominio (ej: `public_html/admin/`).

Incluye el `.htaccess` (Vite copia `public/.htaccess` al build).

### 4) Backend/API
El panel consume:
- `POST /api/login` (token Sanctum)
- Rutas admin: `/api/admin/*` (protegidas por `auth:sanctum` + middleware `mlm.admin`)

En producción asegúrate de:
- `APP_URL` coherente con el host del API (p. ej. `https://app.imparablesjhn.shop`).
- CORS / Sanctum: permite el origen del panel (p. ej. `https://admin.imparablesjhn.shop`) en `config/cors.php` y `SANCTUM_STATEFUL_DOMAINS` si aplica.

### 5) Cron (jobs/cola)
Mantén:
- `artisan schedule:run` cada minuto
- worker de cola estable (ideal):

```bash
* * * * * /usr/bin/php /home/.../artisan queue:work --sleep=1 --tries=3 --max-time=55 >> /dev/null 2>&1
```

