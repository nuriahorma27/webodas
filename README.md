This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Actividad diaria de Supabase

El workflow `.github/workflows/supabase-activity.yml` consulta la tabla `weddings`
cada día a las 08:17 UTC (09:17 en invierno y 10:17 en verano en Madrid).
Se ejecuta en GitHub con el ordenador apagado y también se puede lanzar desde
Actions → Actividad diaria de Supabase → Run workflow.

Necesita los secretos de Actions `NEXT_PUBLIC_SUPABASE_URL` y
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, con los valores del proyecto. Usa los permisos
anónimos existentes y respeta RLS; no modifica datos ni registra resultados o claves.
Una respuesta vacía también cuenta como consulta correcta. Los errores de conexión
o HTTP hacen fallar la ejecución y pueden revisarse en Actions.

Esta actividad no garantiza que Supabase nunca pause el plan gratuito ni reactiva
un proyecto pausado: hay que restaurarlo desde su panel. Véase la
[documentación de Supabase](https://supabase.com/docs/guides/platform/free-project-pausing).
En repositorios públicos, GitHub desactiva las tareas programadas tras 60 días sin
actividad en el repositorio; en ese caso hay que volver a habilitar el workflow en
Actions. Véase la [documentación de GitHub](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

## Documentación de Next.js

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
