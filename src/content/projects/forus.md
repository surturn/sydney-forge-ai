---
id: forus
name: FoRUs
status: In progress
tier: featured
order: 5
repo: { url: null, private: true }
standfirst: A life-planning Android app for one person or a couple — goals across seven horizons, reconciled every night.
problem: "What we do and what we spend rarely match what we say we want."
stack: [Kotlin, Android]
figure: { src: /images/placeholders/forus.svg, alt: FoRUs nightly reconcile screen, width: 1000, height: 1600, placeholder: true }
flow:
  actors: [You, Ritual, Goals, Partner]
  steps:
    - { from: Ritual, to: You, label: "8pm: reconcile today" }
    - { from: You, to: Ritual, label: "Every open task resolved" }
    - { from: Ritual, to: Goals, label: "Tomorrow linked to goals" }
    - { from: Goals, to: You, label: "Order proposed by goal rank" }
    - { from: Goals, to: Partner, label: "Shared by default, or listed only" }
outcome: A daily habit that keeps actions and spending tied to the goals they serve.
---

Goals span day, week, month, quarter, half-year, year, and lifetime; spending is logged against the same goals.

- A nightly ritual that blocks the app until yesterday is reconciled
- Optional pairing, with private, listed, or shared items
