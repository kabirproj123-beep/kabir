"use client";

/**
 * Education-loan EMI estimator. Calculates freely; the "get low-interest help"
 * form beside it is the lead capture.
 */
import { useMemo, useState } from "react";
import { LeadForm } from "./LeadForm";

const TENURES = [3, 5, 7, 10];

function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function LoanCalculator() {
  const [amount, setAmount] = useState(10_00_000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(5);

  const { emi, total, interest } = useMemo(() => {
    const p = amount;
    const r = rate / 12 / 100;
    const n = years * 12;
    // Zero-rate guard: straight-line repayment, no compounding.
    if (r === 0) return { emi: p / n, total: p, interest: 0 };
    const factor = Math.pow(1 + r, n);
    const e = (p * r * factor) / (factor - 1);
    return { emi: e, total: e * n, interest: e * n - p };
  }, [amount, rate, years]);

  const field = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-semibold";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="card p-6">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-lg font-bold">EMI estimator</h3>
          <span className="chip chip-brand">From 8.5% p.a.</span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="loan-amt" className="mb-1 block text-xs font-semibold text-muted">
              Loan amount — {inr(amount)}
            </label>
            <input
              id="loan-amt"
              type="range"
              min={1_00_000}
              max={50_00_000}
              step={50_000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-[var(--color-brand-600)]"
            />
          </div>

          <div>
            <label htmlFor="loan-rate" className="mb-1 block text-xs font-semibold text-muted">
              Interest rate (p.a.)
            </label>
            <input
              id="loan-rate"
              type="number"
              min={1}
              max={20}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className={field}
            />
          </div>
        </div>

        <div className="mt-4">
          <span className="mb-1 block text-xs font-semibold text-muted">Tenure</span>
          <div className="flex flex-wrap gap-2">
            {TENURES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setYears(t)}
                aria-pressed={years === t}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                  years === t
                    ? "border-brand bg-brand-tint text-brand-700"
                    : "border-line bg-white text-muted hover:bg-paper-2"
                }`}
              >
                {t} yr
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-navy p-4 text-white sm:col-span-1">
            <p className="font-display text-2xl font-extrabold sm:text-xl">{inr(emi)}</p>
            <p className="text-xs text-on-navy-dim">Monthly EMI</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:contents">
            <div className="rounded-xl border border-line bg-paper-2 p-4">
              <p className="font-display text-lg font-extrabold text-ink sm:text-xl">{inr(total)}</p>
              <p className="text-xs text-muted">Total repayment</p>
            </div>
            <div className="rounded-xl border border-line bg-paper-2 p-4">
              <p className="font-display text-lg font-extrabold text-ink sm:text-xl">
                {inr(interest)}
              </p>
              <p className="text-xs text-muted">Interest payable</p>
            </div>
          </div>
        </div>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {[
            "Zero processing fee with partner banks",
            "Help with the state student credit card scheme",
            "Approvals typically within 48 hours",
            "Guidance on scholarship applications",
          ].map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-muted">
              <span aria-hidden className="mt-0.5 text-success">
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs text-faint">
          Indicative only. Actual EMI depends on the lender, your co-applicant profile and the
          moratorium period.
        </p>
      </div>

      <div className="card h-fit border-brand/40 p-5">
        <p className="eyebrow">Loan assistance</p>
        <h3 className="mt-1 font-display text-lg font-bold">Want a low-interest loan?</h3>
        <p className="mt-1 mb-4 text-sm text-muted">
          We connect you with verified partner banks and fast-track the paperwork.
        </p>
        <LeadForm
          source="loan-calculator"
          compact
          submitLabel="Get loan assistance"
          note="We share your details only with verified partner banks."
          hiddenMeta={{
            loan_amount: String(amount),
            tenure_years: String(years),
            rate: String(rate),
          }}
          extraFields={[
            {
              name: "family_income",
              label: "Family income range*",
              type: "select",
              required: true,
              options: [
                "Under ₹3 Lakhs",
                "₹3 Lakhs – ₹6 Lakhs",
                "₹6 Lakhs – ₹10 Lakhs",
                "Above ₹10 Lakhs",
              ],
            },
          ]}
        />
      </div>
    </div>
  );
}
