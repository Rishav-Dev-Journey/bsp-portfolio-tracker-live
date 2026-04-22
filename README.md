# bsp-portfolio-tracker-live

Monorepo for a portfolio tracker with a .NET 8 Web API backend and a React + Vite frontend.

The backend loads portfolio data from portfolio.json on startup, keeps it in a singleton in-memory store, supports thread-safe price updates for background processing, and persists new positions back to disk.

## Tech Stack

- Backend: .NET 8 Web API
- Frontend: React + Vite
- Real-time packages: Microsoft.AspNetCore.SignalR and @microsoft/signalr
- Serialization: System.Text.Json

## Repository Structure

```text
bsp-portfolio-tracker-live/
	README.md
	.gitignore
	backend/
		Program.cs
		portfolio.json
		src/
			Models/
			Services/
	frontend/
		src/
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
- It does not write those simulated price changes back to portfolio.json.
