# ArchAce

**Practice software architecture the way interviews and real systems work:** trade-offs, failure modes, and *why* a design holds up.

Not flashcards of port numbers. Not “in what year did DynamoDB launch.”

[**Open the live app →**](https://akgarhwal.github.io/archace/)

---

## What it is

ArchAce is a short, timed practice loop for backend and platform engineers.

1. Pick **Junior / Senior / Staff+**
2. Pick **Quiz** or **Flashcards**
3. Work ~**30** mixed questions from that path

Next time you load the same path, **missed and new** items come first. Answers you got right are remembered for **7 days** (a few hashes in the browser, then they expire).

| | Junior | Senior | Staff+ |
| --- | --- | --- | --- |
| What you train | Why the basic patterns exist | Scaling, isolation, production trade-offs | Deep internals and what you would actually choose |
| Quiz timer | 30s | 45s | 60s |

![Choose a level](docs/screenshots/01-level.png)

![Choose quiz or flashcards](docs/screenshots/02-mode.png)

![A quiz item always names the system](docs/screenshots/03-quiz.png)

![Flashcards: think, flip, mark Got it](docs/screenshots/04-flashcards.png)

---

## What a good question looks like

Every item tells you **which system** you are in — a topic chip on the card, and the stem itself. You should never have to guess whether “GAC” is a DynamoDB, Kubernetes, or networking thing.

**Weak (no context, pure trivia)**

> What is the function of the 'Global Admission Control' (GAC) service?
> A) Manage region failovers · B) Track capacity with token buckets · …

**Better (you know it is DynamoDB, and the question is a trade-off)**

> In DynamoDB, a table keyed on `status=OPEN` starts throttling even though most capacity is unused. What actually went wrong?
> A) DynamoDB cannot store more than one item per key
> B) Almost all writes hashed to one hot partition
> C) Global tables rebalance keys automatically
> D) On-demand mode removes partition limits

The first one is a vocabulary test. The second one is something you can use on a design.

---

## Topics in the bank

PostgreSQL · MySQL · B-tree & LSM · Cassandra · DynamoDB · Redis · AWS & S3 · Kubernetes · Java · Spring Boot · Python · C++ · Data Structures & Algorithms · Gen AI · AI Agents

Widely used tools only. No obscure databases nobody runs.

**1,273 items** in this version (803 quiz + 470 flashcards):

| Level | Quiz | Flashcards |
| --- | ---: | ---: |
| Junior | 215 | 122 |
| Senior | 379 | 226 |
| Staff | 209 | 122 |

The app loads `public/data/{level}-quiz.csv` (and flashcards) that ship with the build. Master files with `Section` + `Level` live in [`content/`](content/). Rebuild with:

```bash
python3 scripts/merge_questions.py
```

---

## How a session is picked

1. Load the bank for **that level + mode**.
2. Take about **30** items (or the whole bank if it is smaller).
3. Prefer recently **wrong**, then **unseen**.
4. Recently **correct** items wait **7 days**, then they can appear again.

Nothing but a short hash and a day stamp is stored. Question text never goes into `localStorage`.

---

## Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173/archace/](http://localhost:5173/archace/).

```bash
npm run build      # production bundle
npm run preview    # serve that bundle
```

Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy.yml`.
