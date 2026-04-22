# bsp-portfolio-tracker-live

Monorepo for a portfolio tracker with a .NET 8 Web API backend and a React + Vite frontend.

The backend loads portfolio data from portfolio.json on startup, keeps it in a singleton in-memory store, supports thread-safe price updates for background processing, broadcasts live snapshots over SignalR, and persists new positions back to disk.

## Tech Stack

- Backend: .NET 8 Web API
- Frontend: React + Vite
- Real-time packages: Microsoft.AspNetCore.SignalR and @microsoft/signalr
- Serialization: System.Text.Json
- Default backend URL: http://localhost:5182
- SignalR hub: http://localhost:5182/portfolioHub

## Repository Structure

```text
bsp-portfolio-tracker-live/
	README.md
	.gitignore
	backend/
		Program.cs
		portfolio.json
		src/
			Hubs/
			Models/
			Services/
	frontend/
		src/
			components/
			hooks/
			lib/
		public/
		package.json
```

## Prerequisites

- .NET SDK 8
- Node.js 18+ or newer
- npm

## Local Setup

### Backend

```bash
cd backend
dotnet restore
dotnet run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

If you need to point the frontend at a different backend, set these environment variables in frontend/.env:

```bash
VITE_API_BASE_URL=http://localhost:5182
VITE_PORTFOLIO_HUB_URL=http://localhost:5182/portfolioHub
```

## Build Commands

### Backend

```bash
cd backend
dotnet build
```

### Frontend

```bash
cd frontend
npm run build
```

## API Endpoints

### GET /portfolio

Returns the current in-memory portfolio.

Example response:

```json
[
  {
    "symbol": "AAPL",
    "quantity": 10,
    "currentPrice": 190.25,
    "lastUpdatedUtc": "2026-04-23T00:00:00Z"
  }
]
```

### PUT /portfolio/prices/{symbol}

Updates a position price in memory.

Example request:

```json
{
  "price": 202.15
}
```

### POST /portfolio/positions

Adds a new position, updates memory, and saves the change back to portfolio.json.

Example request:

```json
{
  "symbol": "NVDA",
  "quantity": 4,
  "currentPrice": 845.5
}
```

## Portfolio Data Behavior

- portfolio.json is loaded when the backend starts.
- The singleton store keeps the portfolio in memory.
- UpdatePrice changes memory only and is safe for BackgroundService use.
- AddPosition updates memory and persists the full snapshot back to portfolio.json.
- JSON serialization is handled with System.Text.Json.

## Background Service

- A hosted background service simulates periodic price changes.
- It updates in-memory prices every few seconds.
- It broadcasts each fresh portfolio snapshot to connected SignalR clients.

## Real-Time Flow

- Backend hub: [backend/src/Hubs/PortfolioHub.cs](backend/src/Hubs/PortfolioHub.cs)
- Backend broadcasts the `PortfolioUpdated` event whenever a price changes or a new position is added.
- Frontend listens for live updates in [frontend/src/hooks/usePortfolio.js](frontend/src/hooks/usePortfolio.js).
- The table and alert panel react to each new snapshot immediately.
