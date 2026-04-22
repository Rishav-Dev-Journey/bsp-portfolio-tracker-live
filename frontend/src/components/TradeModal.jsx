import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { formatCurrency } from "../lib/formatters";

const initialForm = {
  ticker: "",
  quantity: "",
  averageCost: "",
  currentPrice: "",
};

export function TradeModal({ open, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(initialForm);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ticker: form.ticker.trim().toUpperCase(),
      quantity: Number(form.quantity),
      averageCost: Number(form.averageCost),
      currentPrice: Number(form.currentPrice || form.averageCost),
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
              Submit a new position and let the backend persist it to
              portfolio.json.
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Ticker"
              value={form.ticker}
              onChange={updateField("ticker")}
              placeholder="NVDA"
            />
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

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
              <span>Estimated market value</span>
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
              {submitting ? "Submitting..." : "Add Trade"}
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
