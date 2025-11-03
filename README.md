A frontend prototype and system design for a modern Answering Machine Detection (AMD) platform.
The UI is production-grade and demonstrates workflow, logging, and strategy selection.
Backend hooks are included but require implementation.

 What this project demonstrates

Professional AMD dashboard UI

Modular architecture supporting multiple AMD approaches

Typed data models and validation

Prisma DB schema for call logs + results

Strategy selection + real-time status polling

Exportable call history

Detailed docs for completing backend (Twilio, ML, etc.)

This repo focuses on frontend + system architecture. Backend integration points are prepared, just not wired yet.

 Folder structure
src/
  components/
    DialerForm.tsx
    CallStatusMonitor.tsx
    CallHistory.tsx
  lib/
    amd-strategies.ts
    strategies/
      twilio-native.ts
      jambonz.ts
      huggingface.ts
      gemini.ts
    api-client.ts
    db.ts
prisma/
  schema.prisma
IMPLEMENTATION.md
.env.example

- Getting started
npm install
cp .env.example .env
createdb amd_system
npx prisma migrate dev
npm run dev


Runs at:

http://localhost:5173

Starts in demo mode — no actual calls until backend is added.

🔌 Backend requirements (to complete)

You can connect the UI to your backend in one of three ways:

Next.js 14+ API routes (recommended)

Supabase Edge Functions

Node/Express service with Twilio webhooks
