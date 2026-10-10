# Publicación de la demostración

Esta configuración es para una presentación con datos ficticios, no para uso
operativo real. No exportar la base local ni publicar usuarios/contraseñas.

## Backend: Render + Neon

- Repositorio: Emily-Hrdz/Sistema_Bodega; rama: main.
- Runtime: Node; raíz: `Warehouse/backend`; instancia: Free.
- Build: `npm ci --include=dev && npx prisma generate && npm run build`.
- Start: `npm run start:render`.
- Health check: `/api/health`.
- Variables privadas en Render: `DATABASE_URL` (cadena completa de Neon con SSL),
  `JWT_SECRET` (aleatorio, mínimo 32 caracteres), `JWT_EXPIRES_IN=7d`.
- Opcional: `SEED_DEMO=true` para crear catálogos y movimientos ficticios.
- Opcional: `CORS_ORIGINS` con orígenes adicionales separados por comas.

El comando start:render comprueba que el destino sea Neon y que Render esté
presente, aplica las migraciones versionadas, carga ejemplos si SEED_DEMO está
activado y arranca la API en PORT. No carga el .env local. Para migraciones utiliza
el endpoint directo equivalente de Neon; la aplicación conserva la URL agrupada.
Ante un error de migración no arranca. No usa migrate reset ni db push.

La carga de ejemplos usa nombres y códigos habituales (por ejemplo, `PROD-001`),
no crea cuentas ni contraseñas y no sobrescribe los datos de catálogos
existentes. En cada arranque se renombran una sola vez los registros de la
versión anterior que llevaban etiquetas DEMO, conservando sus ID y movimientos.
Puede volver a crear un catálogo eliminado al reiniciar mientras `SEED_DEMO`
esté activo. Desactivar `SEED_DEMO` después de la primera carga.

Comprobar `/api/health` después del despliegue. En el plan gratuito puede haber
espera al reactivarse tras inactividad; abrir la demo antes de la presentación.

## Frontend: GitHub Pages

1. Esperar la URL pública real del backend Render.
2. En Settings > Secrets and variables > Actions > Variables crear `API_BASE_URL`
   con `https://NOMBRE-REAL.onrender.com/api`. No es una contraseña.
3. En Settings > Pages seleccionar GitHub Actions como fuente.
4. En Actions ejecutar manualmente `Publicar demo en GitHub Pages`.
5. Abrir el enlace del resultado. La base del sitio será `/Sistema_Bodega/`.

El workflow no se ejecuta al hacer push. Genera la URL de API en el entorno de
producción, compila Angular y publica únicamente dist/frontend/browser. Nunca
colocar DATABASE_URL ni JWT_SECRET en variables del frontend.

La configuración de producción utiliza rutas con # para permitir recargas en
GitHub Pages. El desarrollo sigue usando localhost:3000/api y rutas normales.

## Verificación sin modificar la base local

En backend: `npm run build` y `npm run test:deployment` (persistencia simulada).
En frontend: `npm run build` (para publicar usar el workflow y su URL configurada).
No ejecutar start:render, migraciones o cargas demo contra la base local.

Después de publicar: registrar una cuenta de presentación con correo ficticio,
iniciar sesión, consultar catálogos, realizar una entrada/salida de prueba,
verificar auditoría, recargar una ruta y exportar CSV. Estas comprobaciones cloud
no se consideran realizadas por la compilación local.

## Alcance y límites

Se agregaron guards JWT a las rutas de catálogos que faltaban, guard ADMIN para
gestionar usuarios, lectura de rol vigente desde la base, secreto obligatorio en
producción y validación de cantidades positivas. Sigue existiendo registro público
de OPERADORES con acceso a los datos compartidos de demostración. No usar datos
reales ni anunciar la URL como un servicio de producción.

Continúan pendientes el control de concurrencia/reconstrucción histórica de
saldos, paginación completa del historial, limitación de intentos y una política
de permisos más granular. La documentación PDF anterior describe la revisión
previa; actualizarla con la URL y la configuración efectivamente desplegadas
cuando se verifique la demo, no antes.

Referencias de configuración:
- https://render.com/docs/web-services
- https://render.com/docs/free
- https://neon.com/docs/guides/prisma
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
