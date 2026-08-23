# MilkTrace — Frontend

Next.js frontend application for the MilkTrace supply-chain traceability platform. Designed to be highly responsive, resilient to network issues, and data-driven for logistics optimization.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Node.js + Next.js (App Router) | React Framework |
| TypeScript (strict) | Language |
| Vanilla CSS Modules | Styling (Light Mode only) |
| React Leaflet (`react-leaflet`) | Mapping |
| Chart.js (`react-chartjs-2`) | Charting |
| Vitest + React Testing Library (RTL) | Testing |
| ESLint + Prettier | Code quality |

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
# Edit .env.local and configure your backend API URL
```

### 3. Start the dev server
```bash
npm run dev
```
Server starts on `http://localhost:3000` by default.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Compile Next.js production build |
| `npm run start` | Run compiled production build |
| `npm run test` | Run Vitest test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format code with Prettier |

---

## Project Structure

```
frontend/
├── src/
│   ├── app/           # Next.js App Router pages and layouts
│   ├── components/    # Reusable UI components (Chart, Maps, Forms)
│   ├── hooks/         # Custom React hooks (Data fetching, State)
│   ├── services/      # API communication abstractions
│   ├── types/         # Global TypeScript interfaces
│   └── utils/         # Pure, side-effect-free helper functions
├── .env.local.example # Template for required environment variables
├── vitest.config.ts   # Vitest configuration
└── next.config.ts     # Next.js configuration
```

### UI & Design Principles

- **Aesthetics:** The UI relies on rich, modern web design aesthetics (vibrant accents, smooth gradients, and glassmorphism where appropriate). 
- **Light Mode Only:** The application does not support dark mode. Ensure all CSS targets a clean, bright, high-contrast light theme.
- **Resilience:** All data-fetching layers must gracefully handle API loading states, 5xx backend errors, and network timeouts without crashing the React tree. Use Skeleton loaders during pending states.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL for backend API | `http://localhost:3001/api/v1` |

> ⚠️ Never commit `.env.local` — it is in `.gitignore`.

---

## Testing

```bash
npm run test          # Run all tests once
npm run test:watch    # Watch mode
```

Tests are co-located in `src/` inside `__tests__` directories. The stack uses **Vitest** for blistering-fast unit and hook testing, isolating data-fetching and state management before progressing to UI component testing.

---

*This file will be updated as the project evolves through subsequent development phases.*
