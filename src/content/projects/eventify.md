---
id: eventify
name: Eventify
status: Live
tier: featured
order: 2
repo: { url: https://github.com/surturn/ticketing-app, private: false }
liveUrl: https://ticketing-app-vert.vercel.app
standfirst: Event ticketing and M-Pesa payments for the Kenyan market, built for flash sales.
problem: "The M-Pesa callback never arrived. The ticket still printed."
stack: [Fastify, PostgreSQL, Drizzle ORM, Redis, BullMQ, M-Pesa Daraja]
figure: { src: /images/placeholders/eventify.svg, alt: Eventify checkout, width: 1600, height: 1000, placeholder: true }
flow:
  actors: [Buyer, Eventify, M-Pesa, Gate]
  steps:
    - { from: Buyer, to: Eventify, label: "Checkout, seat held" }
    - { from: Eventify, to: M-Pesa, label: "STK push" }
    - { from: M-Pesa, to: Eventify, label: "Callback lost", kind: fail }
    - { from: Eventify, to: M-Pesa, label: "Reconciler asks Daraja directly" }
    - { from: M-Pesa, to: Eventify, label: "Paid", kind: recover }
    - { from: Eventify, to: Buyer, label: "Signed QR ticket" }
    - { from: Gate, to: Gate, label: "Verifies offline, single use" }
outcome: Oversell-safe under flash-sale load, with every state change on an append-only ledger.
story:
  headline: "Someone paid. They should get their ticket."
  intro: "Flash sales are where ticketing breaks: thousands of people, one ticket tier, a few seconds."
  problem: "M-Pesa callbacks get lost, delayed, or land on a service that's mid-redeploy. Without a plan for that, someone pays and never gets a ticket."
  built: "Ticketing and M-Pesa payments built for flash sales. The database itself refuses to oversell, a reconciler asks M-Pesa directly when a callback never shows up, and tickets are signed QR codes that verify offline at the gate."
  learned: "Reconciliation isn't optional. And nothing slow belongs inside a transaction — the payment call happens after the seats are held, never while they're locked."
---

Inventory moves between available, reserved, and sold in single conditional statements, with a database constraint as the final guarantee.

- Idempotent checkout, so retries on unreliable connections are free
- Automatic reconciliation when a payment callback does not arrive
- Signed QR tickets that verify offline at the gate
