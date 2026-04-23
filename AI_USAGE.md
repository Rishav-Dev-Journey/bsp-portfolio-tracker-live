# AI Usage

## Tools Used
- GitHub Copilot Chat (VS Code)
- Model: GPT-5.3-Codex

## How AI Was Used
- Built and refined frontend dashboard UI.
- Added SignalR-based real-time updates.
- Implemented backend + frontend CRUD for holdings.
- Fixed issues in CORS, merge flow, and runtime null-safety.

## Prompt Summary
- Build financial dashboard with live updates.
- Improve notifications UX.
- Support accumulation of same symbol with weighted average cost.
- Add full edit/delete CRUD behavior.
- Fix 400 error during Add New Trade merge.

## AI-Modified Files
- backend/Program.cs
- backend/src/Services/IPortfolioStore.cs
- backend/src/Services/PortfolioStore.cs
- frontend/src/App.jsx
- frontend/src/components/HoldingsTable.jsx
- frontend/src/components/TradeModal.jsx
- frontend/src/components/Alerts.jsx
- frontend/src/components/NotificationCenter.jsx
- frontend/src/components/EditHoldingModal.jsx (new)

## Validation
- Manual browser checks
- Frontend build success
- Backend build success
