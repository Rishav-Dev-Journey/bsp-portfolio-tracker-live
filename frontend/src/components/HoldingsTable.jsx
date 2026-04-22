import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { calculatePositionGainLoss } from '../lib/portfolio'
import { formatCurrency, formatNumber } from '../lib/formatters'

export function HoldingsTable({ holdings }) {
  const previousPricesRef = useRef(new Map())
  const [flashMap, setFlashMap] = useState({})

  useEffect(() => {
    const nextFlashMap = {}

    holdings.forEach((holding) => {
      const previousPrice = previousPricesRef.current.get(holding.ticker)

      if (typeof previousPrice === 'number' && previousPrice !== holding.currentPrice) {
        nextFlashMap[holding.ticker] = holding.currentPrice > previousPrice ? 'up' : 'down'
      }

      previousPricesRef.current.set(holding.ticker, holding.currentPrice)
    })

    if (Object.keys(nextFlashMap).length > 0) {
      setFlashMap(nextFlashMap)
      const timeout = setTimeout(() => setFlashMap({}), 450)
      return () => clearTimeout(timeout)
    }

    return undefined
  }, [holdings])

  const totals = useMemo(() => {
    return holdings.reduce(
      (accumulator, holding) => {
        const positionValue = holding.quantity * holding.currentPrice
        const gainLoss = calculatePositionGainLoss(holding)

        accumulator.marketValue += positionValue
        accumulator.gainLoss += gainLoss
        return accumulator
      },
      { marketValue: 0, gainLoss: 0 },
    )
  }, [holdings])

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 shadow-[0_24px_80px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/5 px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Holdings</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Portfolio Positions</h2>
        </div>
        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          {holdings.length} active positions
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/5 text-left">
          <thead className="text-xs uppercase tracking-[0.24em] text-slate-400">
            <tr>
              <th className="px-5 py-4 font-medium sm:px-6">Ticker</th>
              <th className="px-5 py-4 font-medium sm:px-6">Quantity</th>
              <th className="px-5 py-4 font-medium sm:px-6">Average Cost</th>
              <th className="px-5 py-4 font-medium sm:px-6">Current Price</th>
              <th className="px-5 py-4 font-medium sm:px-6">Gain / Loss</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {holdings.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-10 text-center text-slate-400 sm:px-6">
                  Waiting for live portfolio data from SignalR...
                </td>
              </tr>
            ) : (
              holdings.map((holding) => {
                const gainLoss = calculatePositionGainLoss(holding)
                const isPositive = gainLoss >= 0
                const flashTone = flashMap[holding.ticker]

                return (
                  <tr key={holding.ticker} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-5 py-5 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-sm font-semibold text-slate-100 ring-1 ring-white/10">
                          {holding.ticker.slice(0, 4)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{holding.ticker}</div>
                          <div className="text-xs text-slate-400">
                            {holding.isAlert ? 'Alert active' : 'Normal'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-sm text-slate-200 sm:px-6">{formatNumber(holding.quantity)}</td>
                    <td className="px-5 py-5 text-sm text-slate-200 sm:px-6">
                      {formatCurrency(holding.averageCost)}
                    </td>
                    <td className="px-5 py-5 sm:px-6">
                      <div
                        className={`inline-flex min-w-[110px] items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                          flashTone === 'up'
                            ? 'bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-400/30 shadow-[0_0_0_1px_rgba(52,211,153,0.18)]'
                            : flashTone === 'down'
                              ? 'bg-rose-400/10 text-rose-200 ring-1 ring-rose-400/30 shadow-[0_0_0_1px_rgba(251,113,133,0.18)]'
                              : 'bg-white/5 text-slate-100 ring-1 ring-white/10'
                        }`}
                      >
                        {flashTone === 'up' ? <ChevronUp className="h-4 w-4" /> : null}
                        {flashTone === 'down' ? <ChevronDown className="h-4 w-4" /> : null}
                        <span>{formatCurrency(holding.currentPrice)}</span>
                      </div>
                    </td>
                    <td className={`px-5 py-5 text-sm font-semibold sm:px-6 ${isPositive ? 'text-emerald-300' : 'text-rose-300'}`}>
                      <div className="flex items-center gap-2">
                        {isPositive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {formatCurrency(gainLoss)}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-5 py-4 text-sm text-slate-400 sm:px-6">
        <span>Net market value: {formatCurrency(totals.marketValue)}</span>
        <span>Unrealized P&amp;L: {formatCurrency(totals.gainLoss)}</span>
      </div>
    </section>
  )
}
