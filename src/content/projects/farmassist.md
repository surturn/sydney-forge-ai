---
id: farmassist
name: FarmAssist
status: In progress
tier: featured
order: 4
repo: { url: https://github.com/surturn/farm-assist-grow, private: false }
standfirst: An AI farming companion — photograph a leaf, get a diagnosis and what to do next.
problem: "A farmer with one photo and no agronomist nearby."
stack: [React, TypeScript, Express, Prisma, PostgreSQL, Redis, YOLOv8, OpenAI]
figure: { src: /images/placeholders/farmassist.svg, alt: FarmAssist crop diagnosis, width: 1600, height: 1000, placeholder: true }
flow:
  actors: [Farmer, App, Model, Advisor]
  steps:
    - { from: Farmer, to: App, label: "Photo of a sick leaf" }
    - { from: App, to: Model, label: "Custom-trained YOLOv8 detects disease" }
    - { from: Model, to: App, label: "Diagnosis with confidence" }
    - { from: App, to: Advisor, label: "Diagnosis + local weather" }
    - { from: Advisor, to: Farmer, label: "Treatment and timing", kind: recover }
outcome: A model trained on real crop disease data, wrapped in advice a farmer can act on.
story:
  headline: "Photograph a leaf. Find out what's wrong."
  intro: "A farmer with one photo, and no agronomist nearby."
  problem: "When a crop gets sick, the person who could tell you what it is, and what to do about it, often isn't close by."
  built: "An AI farming companion. A YOLOv8 model I trained on real crop disease data spots the problem, and local weather shapes the advice on what to do next. A WhatsApp channel is in progress."
---

A monorepo with a feature-driven React frontend and a layered Express and Prisma backend, with Redis for caching and rate limiting.

- Disease detection from a custom-trained YOLOv8 model
- Weather-based recommendations
- A WhatsApp diagnosis channel — *in progress*
