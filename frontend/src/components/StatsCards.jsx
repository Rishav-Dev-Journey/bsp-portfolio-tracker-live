import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  BriefcaseBusiness,
} from "lucide-react";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../lib/formatters";

const statCardTone = {
  neutral: "from-slate-900/80 to-slate-950/70 border-slate-700/70",
  up: "from-emerald-500/10 to-emerald-500/5 border-emerald-400/20",
  down: "from-rose-500/10 to-rose-500/5 border-rose-400/20",
};

function StatCard({
  icon,
  label,
  value,
  subtext,
  tone = "neutral",
  valueClassName = "",
}) {
  const Icon = icon;

  return (
    <article
      className={`rounded-3xl border bg-gradient-to-br p-5 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl ${statCardTone[tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            {label}
          </p>
          <div
            className={`mt-3 text-3xl font-semibold tracking-tight ${valueClassName}`}
          >
            {value}
          </div>
          <p className="mt-2 text-sm text-slate-400">{subtext}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-100">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

export function StatsCards({ metrics, connectionStatus, lastUpdatedAt }) {
  const pnlTone = metrics.dailyPnL >= 0 ? "up" : "down";
  const PnLIcon = metrics.dailyPnL >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <StatCard
        icon={BadgeDollarSign}
        label="Total Portfolio Value"
        value={formatCurrency(metrics.totalValue)}
        subtext={`Live connection: ${connectionStatus}${lastUpdatedAt ? ` • updated ${new Date(lastUpdatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}`}
        tone="neutral"
      />
      <StatCard
        icon={PnLIcon}
        label="Daily P&L"
        value={formatCurrency(metrics.dailyPnL)}
        subtext={`${formatPercentage(metrics.winRate)} of holdings are above cost basis`}
        tone={pnlTone}
        valueClassName={
          metrics.dailyPnL >= 0 ? "text-emerald-300" : "text-rose-300"
        }
      />
      <StatCard
        icon={BriefcaseBusiness}
        label="Total Exposure"
        value={formatNumber(metrics.totalExposure)}
        subtext={
          metrics.topMover
            ? `Top mover: ${metrics.topMover.ticker}`
            : "Awaiting live holdings data"
        }
        tone="neutral"
      />
    </div>
  );
}
