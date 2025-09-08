# CRM de Clientes con IA

## Descripción

CRM moderno para gestión de clientes con:
- Base de datos en tiempo real (Convex)
- Dashboard y vistas en React + Next.js + ShadcnUI
- Asistente IA (análisis y categorización)
- Automatización con QStash (Upstash) para marcar clientes inactivos
- Deploy en Vercel

## Stack

- pnpm
- Next.js
- React + ShadcnUI
- Convex (BD realtime)
- Upstash QStash (automatización)
- Vercel AI SDK (opcional, para IA)
- Vercel (deploy)

## Instalación

```sh
pnpm install
pnpm dev
```

## Variables de entorno

Crea un archivo `.env.local` con:

```
NEXT_PUBLIC_CONVEX_URL=tu_url_convex
OPENAI_API_KEY=tu_api_key_openai
QSTASH_TOKEN=tu_token_qstash
QSTASH_CURRENT_SIGNING_KEY=tu_signing_key_actual
QSTASH_NEXT_SIGNING_KEY=tu_signing_key_siguiente
VERCEL_URL=tu_url_deploy.vercel.app
```

## Automatización con QStash

- El endpoint `/api/qstash/setup` crea un schedule real en Upstash QStash si tienes las variables configuradas.
- El job llama a `/api/cron/check-inactive-clients` cada 6 horas (por defecto) y marca como "Inactivo" a los clientes sin interacciones recientes.

## Flujo IA

- Botón "Analizar cliente": llama a `/api/ai/analyze-client` y guarda análisis y prioridad sugerida.
- Botón "Categorizar automáticamente": llama a `/api/ai/categorize-client` y actualiza el estado del cliente.

## Scripts

```sh
pnpm dev        # desarrollo
pnpm build      # build producción
pnpm start      # producción
```

## Deploy

El proyecto está listo para deploy en Vercel. Solo asegúrate de configurar las variables de entorno en el dashboard de Vercel.
