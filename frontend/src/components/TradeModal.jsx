import { useMemo, useState } from "react";
import { ChevronDown, X, AlertCircle } from "lucide-react";
import { formatCurrency } from "../lib/formatters";

const initialForm = {
  ticker: "",
  quantity: "",
  averageCost: "",
  currentPrice: "",
};

export function TradeModal({
  open,
  onClose,
  onSubmit,
  submitting,
  existingHoldings = [],
}) {
  const [form, setForm] = useState(initialForm);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Find matching existing holding
  const matchingHolding = useMemo(() => {
    if (!form.ticker.trim() || !Array.isArray(existingHoldings)) return null;
    return existingHoldings.find(
      (h) =>
        h &&
        (h.symbol || h.ticker || "")
          .toUpperCase()
          .includes(form.ticker.toUpperCase()),
    );
  }, [form.ticker, existingHoldings]);

  // Calculate merged position if adding to existing
  const mergedPosition = useMemo(() => {
    if (!matchingHolding || !form.quantity || !form.averageCost) return null;

    const existingQty = Number(matchingHolding.quantity || 0);
    const existingCost = Number(matchingHolding.averageCost || 0);
    const newQty = Number(form.quantity);
    const newCost = Number(form.averageCost);

    const totalQty = existingQty + newQty;
    const weightedCost =
      (existingQty * existingCost + newQty * newCost) / totalQty;

    return {
      totalQty,
      weightedCost,
      existingQty,
      existingCost,
      newQty,
      newCost,
    };
  }, [matchingHolding, form]);

  const previewValue = useMemo(() => {
    const quantity = Number(form.quantity || 0);
    const price = Number(form.currentPrice || form.averageCost || 0);
    return quantity * price;
  }, [form.currentPrice, form.averageCost, form.quantity]);

  if (!open) {
    return null;
  }

  const updateField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const selectExistingStock = (holding) => {
    const ticker = holding.symbol || holding.ticker || "";
    setForm((current) => ({
      ...current,
      ticker,
      currentPrice: String(holding.currentPrice || ""),
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ticker: form.ticker.trim().toUpperCase(),
      quantity: Number(form.quantity),
      averageCost: Number(form.averageCost),
      currentPrice: Number(form.currentPrice || form.averageCost),
      isAccumulation: !!matchingHolding,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-slate-950/70 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Trade desk
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Add New Trade
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {matchingHolding
                ? "Adding to existing position—average cost will be recalculated."
                : "Submit a new position to your portfolio."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          className="flex-1 space-y-5 overflow-y-auto p-6"
          onSubmit={handleSubmit}
        >
          {/* Ticker field with suggestions */}
          <div className="space-y-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Ticker
              </span>
              <div className="relative">
                <input
                  type="text"
                  value={form.ticker}
                  onChange={(e) => {
                    updateField("ticker")(e);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="NVDA"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/20"
                  required
                />
                {showSuggestions && form.ticker.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/10 bg-slate-900/95 shadow-lg max-h-48 overflow-y-auto z-20">
                    {Array.isArray(existingHoldings) &&
                      existingHoldings
                        .filter(
                          (h) =>
                            h &&
                            (h.symbol || h.ticker || "")
                              .toUpperCase()
                              .includes(form.ticker.toUpperCase()),
                        )
                        .map((holding) => {
                          const ticker = holding.symbol || holding.ticker || "?";
                          return (
                            <button
                              key={ticker}
                              type="button"
                              onClick={() => selectExistingStock(holding)}
                              className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/10 border-b border-white/5 last:border-b-0"
                            >
                              <div className="font-semibold">{ticker}</div>
                              <div className="text-xs text-slate-500">
                                {holding.quantity} shares @{formatCurrency(holding.averageCost)}
                              </div>
                            </button>
                          );
                        })}
                    {(!Array.isArray(existingHoldings) ||
                      existingHoldings.filter((h) =>
                        h &&
                        (h.symbol || h.ticker || "")
                          .toUpperCase()
                          .includes(form.ticker.toUpperCase()),
                      ).length === 0) && (
                      <div className="px-4 py-3 text-xs text-slate-400">
                        No matching stocks found. This will be a new position.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Quantity"
              value={form.quantity}
              onChange={updateField("quantity")}
              placeholder="10"
              type="number"
              step="1"
              min="0"
            />
            <Field
              label="Average Cost"
              value={form.averageCost}
              onChange={updateField("averageCost")}
              placeholder="840.00"
              type="number"
              step="0.01"
              min="0"
            />
            <Field
              label="Current Price"
              value={form.currentPrice}
              onChange={updateField("currentPrice")}
              placeholder="845.50"
              type="number"
              step="0.01"
              min="0"
            />
          </div>

          {/* Merge preview if adding to existing */}
          {mergedPosition && (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-100">
                  <p className="font-semibold mb-2">Position Merge Preview</p>
                  <div className="space-y-1 text-xs">
                    <div>
                      Current: {mergedPosition.existingQty} shares @{" "}
                      {formatCurrency(mergedPosition.existingCost)}
                    </div>
                    <div>
                      Adding: {mergedPosition.newQty} shares @{" "}
                      {formatCurrency(mergedPosition.newCost)}
                    </div>
                    <div className="border-t border-emerald-400/20 pt-1 mt-1 font-semibold">
                      New Total: {mergedPosition.totalQty} shares @{" "}
                      {formatCurrency(mergedPosition.weightedCost)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
              <span>Estimated market value (new shares)</span>
              <span className="font-semibold text-white">
                {formatCurrency(previewValue)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting..."
                : matchingHolding
                  ? "Accumulate Position"
                  : "Add Trade"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  step,
  min,
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.28em] text-slate-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        min={min}
        className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/20"
        required
      />
    </label>
  );
}
