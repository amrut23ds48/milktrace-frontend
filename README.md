# MilkTrace Frontend

This is the Next.js frontend application for the **MilkTrace** supply chain and anomaly detection platform. It is designed to be highly responsive, resilient to network issues, and data-driven for logistics optimization.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Vanilla CSS Modules (Strictly Light Mode only)
- **Mapping:** React Leaflet (`react-leaflet`)
- **Charting:** Chart.js (`react-chartjs-2`)
- **Testing:** Vitest + React Testing Library (RTL)

## Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation

1. Install all dependencies:
```bash
npm install
```

2. Copy the example environment file and configure any necessary variables (e.g., API base URL):
```bash
cp .env.local.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

We use **Vitest** for blistering-fast unit and component testing. Our testing philosophy strictly isolates data-fetching, logic, and state management from presentation before progressing to UI component testing.

To run the test suite:
```bash
npm run test
```

For watch mode during active development:
```bash
npm run test:watch
```

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
```

## UI & Design Principles

- **Aesthetics:** The UI relies on rich, modern web design aesthetics (vibrant accents, smooth gradients, and glassmorphism where appropriate). 
- **Resilience:** All data-fetching layers must gracefully handle API loading states, 5xx backend errors, and network timeouts without crashing the React tree. Use Skeleton loaders during pending states.
