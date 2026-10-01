---
id: digital-twin
name: Digital Twin
status: In progress
tier: featured
order: 3
repo: { url: null, private: true }
standfirst: An AI study partner for computer science students that learns how you learn.
problem: "Most AI tutors forget you the moment the chat ends."
stack: [Python, LangChain, Groq, ChromaDB, Streamlit, NumPy]
figure: { src: /images/placeholders/digital-twin.svg, alt: Digital Twin study session, width: 1600, height: 1000, placeholder: true }
flow:
  actors: [Student, Twin, Retriever, LLM]
  steps:
    - { from: Student, to: Twin, label: "Asks about deadlocks" }
    - { from: Twin, to: Retriever, label: "Chunk, embed, top-k from the unit" }
    - { from: Retriever, to: Twin, label: "Your lecture slides, cited" }
    - { from: Twin, to: Twin, label: "Old turns folded into a summary" }
    - { from: Twin, to: LLM, label: "Prompt within a token budget" }
    - { from: LLM, to: Student, label: "Grounded answer, faithfulness checked", kind: recover }
outcome: Long sessions that keep their thread, and answers measured against a hand-written question set.
story:
  headline: "A study partner that remembers you."
  intro: "Most AI tutors are stateless. Every conversation starts from zero."
  problem: "They don't know which unit you're on, what you understood last week, or that analogies work better for you than formal definitions."
  built: "An AI study partner that teaches inside your actual course — your slides, your notes, cited — and holds a two-hour session without losing the thread. A map of what you know is still in progress."
  learned: "Memory should be legible: something you can open, inspect and correct. And “grounded” should be something you measure, not a slogan."
---

The context window is managed to a measured token budget: recent turns stay verbatim, older ones fold into a running summary.

- Retrieval over the student's own course material, stored in a local vector database
- A predictive network written from scratch in NumPy with hand-derived backpropagation — *in progress*
- A semantic map of what the student knows — *in progress*
