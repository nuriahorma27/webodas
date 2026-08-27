# Pendientes de webodas

## Infraestructura / cuando salgamos del prototipo
- [ ] **Reactivar auth real** (Supabase, ya hay tablas y RLS). Hoy `src/proxy.ts` es pass-through y todo el estado vive en `localStorage`.
- [ ] **Mover a base de datos** lo que hoy está en localStorage: contenido del editor de la web (`wedding_sites`), tareas + detalles, lista de regalos, respuestas RSVP, aportaciones.
  - Preocupación de escala: Postgres/Supabase aguanta millones de filas sin problema. Claves: buen esquema + índices por `owner_id`/`wedding_id`, RLS, imágenes en Storage (no en la BD), y guardar el JSON del editor como `jsonb` (un registro por boda, no por bloque).
- [ ] Subida de imágenes real a Supabase Storage (bucket `wedding-media` ya creado) en vez de data URLs.
- [ ] Dominios / subdominios para las webs publicadas.

## Pagos (Stripe)
- [ ] Crear cuenta de Stripe de webodas + activar **Connect (Express)** y **Bizum** como método de pago.
- [ ] Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
- [ ] `src/app/api/stripe/connect` — guardar `account.id` en la boda del usuario (Supabase). Hoy solo crea la cuenta y redirige.
- [ ] `src/app/api/stripe/checkout` — leer el `stripe_account_id` de la boda y pasarlo en `transfer_data.destination`. Hoy usa `STRIPE_DEMO_CONNECTED_ACCOUNT`.
- [ ] `src/app/api/stripe/webhook` — al recibir `checkout.session.completed`, insertar en `contributions` y sumar al regalo. Configurar el endpoint en el dashboard de Stripe y obtener el signing secret.
- [ ] **Emails automáticos al confirmarse una aportación**: (a) al invitado que ha pagado (confirmación/recibo), (b) a los novios (aviso "X ha contribuido con Y € a Z"). Enviar desde el webhook. Elegir proveedor (Resend, Supabase Auth SMTP, SendGrid…).
- [ ] Tablas Supabase: `contributions`, y en `weddings`: `stripe_account_id`, `stripe_charges_enabled`.
- [ ] Comisión de plataforma: hoy 0 (`applicationFee()` en `src/lib/stripe.ts`). Definir modelo (% o cuota fija) más adelante.

## Panel de administración de webodas (interno)
- [ ] **Crear el panel de administración propio** para gestionar: parejas/cuentas, listas de regalos, pagos y comisiones, estado de las cuentas Stripe conectadas, métricas de uso.
- [ ] Definir comisiones por aportación y poder cambiarlas desde ahí.

## Servicios 2 y 3
- [ ] Lista de bodas / regalos: método de cobro por pareja (manual vs Stripe) — **hecho a nivel UI en el prototipo**, falta el backend real.
- [ ] Panel de gestión: el resto de pestañas (presupuesto, invitados, mesas, proveedores) siguen con datos mock.
