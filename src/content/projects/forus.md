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
story:
  headline: "What we do rarely matches what we say we want."
  intro: "A life-planning app for one person or a couple, built around one question: does what we actually do, and spend, match what we say we want?"
  problem: "Goals are easy to set and easy to drift from. Daily tasks and spending rarely get checked against the things they're supposed to serve."
  built: "An Android app where every task and every shilling links to a goal, from today up to a lifetime. At 8pm you reconcile the day: every open task is done, moved, or dropped with a reason."
  learned: "A reminder is easy to ignore. The real enforcement is at launch — if yesterday isn't reconciled, that's the only screen you can open."
---

Goals span day, week, month, quarter, half-year, year, and lifetime; spending is logged against the same goals.

- A nightly ritual that blocks the app until yesterday is reconciled
- Optional pairing, with private, listed, or shared items
