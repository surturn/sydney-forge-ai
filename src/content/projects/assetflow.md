---
id: assetflow
name: AssetFlow Schools
status: Beta
tier: featured
order: 1
repo: { url: null, private: true }
liveUrl: https://asset-manager-tan-rho.vercel.app
standfirst: Multi-tenant asset management for Kenyan schools — tracking, borrowing, invoicing, and an assistant you can ask.
problem: "The classroom has no signal. The register still has to balance."
stack: [Django, Django REST Framework, PostgreSQL, React, TypeScript, Celery, Redis]
figure: { src: /images/placeholders/assetflow.svg, alt: AssetFlow dashboard, width: 1600, height: 1000, placeholder: true }
flow:
  actors: [Teacher, PWA, Queue, API]
  steps:
    - { from: Teacher, to: PWA, label: "Records a return, offline" }
    - { from: PWA, to: Queue, label: "Write queued, idempotent" }
    - { from: Queue, to: API, label: "Sync attempt, no signal", kind: fail }
    - { from: Queue, to: API, label: "Reconnect: replays in order", kind: recover }
    - { from: API, to: API, label: "Row-level security per school" }
    - { from: API, to: PWA, label: "Damages roll into invoices" }
outcome: Schools keep working through dead zones, and no school can ever see another's data.
---

Every tenant-scoped table is isolated by PostgreSQL row-level security, not just application filters.

- Asset lifecycle with QR tracking and straight-line depreciation
- Borrow, return, and damage invoicing with server-side PDFs
- An assistant that answers from the school's own data first, with an LLM as fallback
