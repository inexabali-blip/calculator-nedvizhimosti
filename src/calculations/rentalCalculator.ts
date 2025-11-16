import type { CalculatorInputs, CalculatorResults } from '../types/rentalTypes';

// Небольшой helper, чтобы не ловить NaN/бесконечности
const safeNumber = (value: number): number =>
  Number.isFinite(value) ? value : 0;

export const calculateResults = (inputs: CalculatorInputs): CalculatorResults => {
  const { property, rental, expenses, taxes, financing } = inputs;

  // ---------- 1. ВЫРУЧКА ----------
  const occupancy = Math.min(Math.max(rental.occupancy, 0), 100) / 100; // 0–1

  let monthlyGross = 0;
  let annualGross = 0;

  if (rental.model === 'monthly') {
    // Помесячная аренда — берём ставку за месяц, заполняемость не влияет
    monthlyGross = safeNumber(rental.monthlyRent);
    annualGross = monthlyGross * 12;
  } else {
    // Посуточная аренда — считаем по ночам и заполняемости
    const nightly = safeNumber(rental.nightlyRent);
    monthlyGross = nightly * 30 * occupancy;
    annualGross = nightly * 365 * occupancy;
  }

  const grossIncome = {
    monthly: monthlyGross,
    annual: annualGross,
  };

  // ---------- 2. ОПЕРАЦИОННЫЕ РАСХОДЫ ----------
  const monthlyFixed =
    safeNumber(expenses.fixed.utilities) +
    safeNumber(expenses.fixed.staff) +
    safeNumber(expenses.fixed.insurance) +
    safeNumber(expenses.fixed.other);

  const revenueShare = Math.min(Math.max(expenses.variable.revenueShare, 0), 100) / 100;
  const monthlyVariable = monthlyGross * revenueShare;

  const monthlyTotal = monthlyFixed + monthlyVariable;
  const annualTotal = monthlyTotal * 12;

  const operatingExpenses = {
    monthlyFixed,
    monthlyVariable,
    monthlyTotal,
    annualTotal,
  };

  // ---------- 3. NOI (годовой) ----------
  const annualNOI = annualGross - annualTotal;
  const noi = annualNOI;

  // ---------- 4. КРЕДИТ (аннуитетный платёж) ----------
  const loanAmount = safeNumber(financing.loanAmount);
  const interestRate = safeNumber(financing.interestRate);
  const loanTermYears = safeNumber(financing.loanTermYears);

  let monthlyDebtPayment = 0;

  if (loanAmount > 0 && interestRate > 0 && loanTermYears > 0) {
    const monthlyRate = interestRate / 100 / 12;
    const n = loanTermYears * 12;
    const factor = Math.pow(1 + monthlyRate, n);
    const payment = (loanAmount * monthlyRate * factor) / (factor - 1);
    monthlyDebtPayment = safeNumber(payment);
  }

  const annualDebtPayment = monthlyDebtPayment * 12;

  const loanPayments = {
    monthly: monthlyDebtPayment,
    annual: annualDebtPayment,
  };

  // ---------- 5. НАЛОГИ ----------
  const incomeTaxRate = Math.min(Math.max(taxes.incomeTaxRate, 0), 100) / 100;

  // База для налога — прибыль после обслуживания долга, но не ниже 0
  const taxBase = Math.max(annualNOI - annualDebtPayment, 0);
  const taxesAmount = taxBase * incomeTaxRate;

  // ---------- 6. CASH FLOW ----------
  const annualBeforeDebt = annualNOI;
  const annualAfterDebtBeforeTax = annualNOI - annualDebtPayment;
  const annualAfterDebtAndTax = annualAfterDebtBeforeTax - taxesAmount;

  const cashFlow = {
    annualBeforeDebt,
    annualAfterDebtBeforeTax,
    annualAfterDebtAndTax,
  };

  // ---------- 7. ПОКАЗАТЕЛИ ДОХОДНОСТИ ----------
  // Cap Rate считаем от полной стоимости объекта (цена + CapEx)
  const totalPurchase = safeNumber(property.purchasePrice) + safeNumber(property.initialCapex);
  const equity = safeNumber(financing.equity);

  const capRate =
    totalPurchase > 0 ? (annualNOI / totalPurchase) * 100 : 0;

  const cashOnCash =
    equity > 0 ? (annualAfterDebtAndTax / equity) * 100 : 0;

  // Срок окупаемости по equity (в годах)
  const paybackPeriodYears =
    annualAfterDebtAndTax > 0 && equity > 0
      ? equity / annualAfterDebtAndTax
      : null;

  // Точка безубыточности по заполняемости (для посуточной модели)
  let breakEvenOccupancy: number | null = null;

  if (rental.model === 'daily') {
    const nightly = safeNumber(rental.nightlyRent);
    const annualFixed = monthlyFixed * 12;

    // Упрощённо: считаем точку, где NOI ≈ долг (налоги игнорируем для упрощения)
    // annualNOI(x) = nightly * 365 * x * (1 - revenueShare) - annualFixed
    // break-even: annualNOI(x) - annualDebtPayment = 0
    // => nightly * 365 * x * (1 - revenueShare) = annualFixed + annualDebtPayment
    const denominator = nightly * 365 * (1 - revenueShare);

    if (denominator > 0) {
      const x = (annualFixed + annualDebtPayment) / denominator; // доля 0–1
      const percent = x * 100;
      if (percent > 0 && percent < 1000) {
        // если расчёт вменяемый
        breakEvenOccupancy = percent;
      }
    }
  }

  const returnMetrics = {
    cashOnCash,
    capRate,
    paybackPeriodYears,
    breakEvenOccupancy,
  };

  // ---------- 8. Финальный объект ----------
  const results: CalculatorResults = {
    grossIncome,
    operatingExpenses,
    noi,
    loanPayments,
    cashFlow,
    taxes: taxesAmount,
    returnMetrics,
  };

  return results;
};
