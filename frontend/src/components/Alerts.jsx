import { useEffect, useMemo, useRef, useState } from "react";
import { BellRing } from "lucide-react";
import { formatCurrency, formatPercentage } from "../lib/formatters";
import { normalizePortfolio } from "../lib/portfolio";

const alertTone = {
  bullish: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  bearish: "border-rose-400/20 bg-rose-400/10 text-rose-100",
};

export function Alerts({ portfolio, onAlert = () => {} }) {
  const [recentAlerts, setRecentAlerts] = useState([]);
  const seenRef = useRef(new Set());

  const normalized = useMemo(() => normalizePortfolio(portfolio), [portfolio]);

  useEffect(() => {
    const nextAlerts = [];

    normalized.forEach((holding) => {
      const base = Number(holding.averageCost || 0);
      const movement = base ? ((holding.currentPrice - base) / base) * 100 : 0;
      const isAlert = Boolean(holding.isAlert) || Math.abs(movement) >= 5;
      const key = `${holding.ticker}-${holding.lastUpdatedUtc || holding.currentPrice}`;

      if (isAlert) {
        nextAlerts.push({ ...holding, movement });
      }

      // Trigger notification for new alerts
      if (isAlert && !seenRef.current.has(key)) {
        seenRef.current.add(key);
        onAlert({
          id: key,
          ticker: holding.ticker,
          movement,
          currentPrice: holding.currentPrice,
          averageCost: holding.averageCost,
        });
      }
    });

    setRecentAlerts(nextAlerts.slice(0, 4));
  }, [normalized, onAlert]);

  return (
    <aside className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            Live Alerts
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Event Watchlist
          </h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200">
          <BellRing className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {recentAlerts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">
            No alerts yet. When a holding moves more than 5%, the card and toast
            feed will light up here.
          </div>
        ) : (
          recentAlerts.map((alert) => {
            const movement = alert.movement ?? 0;
            const tone = movement >= 0 ? alertTone.bullish : alertTone.bearish;

            return (
              <div
                key={`${alert.ticker}-${alert.lastUpdatedUtc || alert.currentPrice}`}
                className={`rounded-2xl border p-4 ${tone}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">{alert.ticker}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.24em] opacity-70">
                      {formatPercentage(Math.abs(movement) / 100)} move
                    </div>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${movement >= 0 ? "bg-emerald-500/15 text-emerald-200" : "bg-rose-500/15 text-rose-200"}`}
                  >
                    {movement >= 0 ? "+" : ""}
                    {movement.toFixed(2)}%
                  </div>
                </div>
                <p className="mt-3 text-sm opacity-90">
                  {alert.ticker} is now {formatCurrency(alert.currentPrice)}{" "}
                  against {formatCurrency(alert.averageCost)} average cost.
                </p>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
