# [ArchAce](https://akgarhwal.github.io/ArchAce/) Learning Path

A React + TypeScript application for technical learning paths, offering quizzes and flashcards driven dynamically by Google Sheets.

## Data Management (Google Sheets integration)

The questions and flashcards are entirely managed via Google Sheets. The application fetches the data directly from the published CSV endpoints.

There are 6 active Google Sheets mapped to the different difficulties and modes:

| Level | Quiz Mode GID | Flashcard Mode GID |
|-------|---------------|--------------------|
| **Junior (Easy)** | `886577120` | `1099335189` |
| **Senior (Medium)** | `1620893919` | `1910075225` |
| **Staff (Hard)** | `1857699421` | `1484665705` |

*(These mappings are configured in `src/data/sheetConfig.ts`)*

### Sheet Formats

Depending on the mode, the Google Sheets must adhere to specific column headers for the parser to work correctly.

#### 1. Quiz Format (4-column layout)
Required column headers:
- `Question`
- `Option A`
- `Option B`
- `Option C`
- `Option D`
- `Correct Answer` (Must be 'A', 'B', 'C', or 'D')

#### 2. Flashcard Format (2-column layout)
Required column headers:
- `Question`
- `Correct Answer`

---

## Game Rules

### Quiz Mode
- **Questions:** 20 questions per session (randomized)
- **Time Limits:**
  - Junior: 30 seconds per question
  - Senior: 45 seconds per question
  - Staff: 60 seconds per question

### Flashcard Mode
- **Cards:** 20 cards per session (randomized)
- **Features:**
  - Flippable cards (Question on front, Answer on back)
  - "Got It" tracking to count memorized concepts
  - Reshuffle ability to restart the session

---

## Development Tasks

### Available Scripts
- `npm run dev` - Start local development server
- `npm run build` - Compile TypeScript and build production bundle
- `npm run preview` - Preview the production build locally

## Deployment
This project is configured to deploy to GitHub Pages automatically via GitHub Actions whenever changes are pushed to the `main` branch.
