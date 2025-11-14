import type {
  CalculatorInputs,
  CalculatorResults,
} from '../types/rentalTypes';

const MONTHS_IN_YEAR = 12;
const DAYS_IN_YEAR = 365;

const clampPercentage = (value: number): number => {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

const toFraction = (value: number): number => clampPercentage(value) / 100;

const sumFixedExpenses = (inputs: CalculatorInputs): number => {
  const { fixed } = inputs.expenses;
  return (
    clampNumber(fixed.utilities) +
    clampNumber(fixed.staff) +
    clampNumber(fixed.insurance) +
    clampNumber(fixed.other)
  );
};

const clampNumber = (value: number): number => (Number.isFinite(value) ? value : 0);

const calculateMonthlyGrossIncome = (inputs: CalculatorInputs): number => {
  const { rental } = inputs;
  const occupancyFraction = toFraction(rental.occupancy);

  if (rental.model === 'monthly') {
    return clampNumber(rental.monthlyRent) * occupancyFraction;
  }

  const annualRevenueAtOccupancy =
    clampNumber(rental.nightlyRent) * occupancyFraction * DAYS_IN_YEAR;
  return annualRevenueAtOccupancy / MONTHS_IN_YEAR;
};

const calculateAnnualGrossIncome = (monthlyGross: number): number =>
  monthlyGross * MONTHS_IN_YEAR;

const calculateOperatingExpenses = (
  inputs: CalculatorInputs,
  monthlyGrossIncome: number,
) => {
  const fixedMonthly = sumFixedExpenses(inputs);
  const variableRate = toFraction(inputs.expenses.variable.revenueShare);
  const variableMonthly = monthlyGrossIncome * variableRate;
  const monthlyTotal = fixedMonthly + variableMonthly;

  return {
    monthlyFixed: fixedMonthly,
    monthlyVariable: variableMonthly,
    monthlyTotal,
    annualTotal: monthlyTotal * MONTHS_IN_YEAR,
  };
};

const calculateLoanPayment = (inputs: CalculatorInputs) => {
  const { loanAmount, interestRate, loanTermYears } = inputs.financing;
  if (loanAmount <= 0 || loanTermYears <= 0) {
    return { monthly: 0, annual: 0 };
  }

  const totalMonths = loanTermYears * MONTHS_IN_YEAR;
  const monthlyRate = interestRate > 0 ? interestRate / 100 / MONTHS_IN_YEAR : 0;

  if (monthlyRate === 0) {
    const payment = loanAmount / totalMonths;
    return { monthly: payment, annual: payment * MONTHS_IN_YEAR };
  }

  const payment =
    (loanAmount * monthlyRate) /
    (1 - Math.pow(1 + monthlyRate, -totalMonths));

  return { monthly: payment, annual: payment * MONTHS_IN_YEAR };
};

const calculateTaxes = (
  incomeBeforeTax: number,
  taxRatePercentage: number,
): number => {
  if (incomeBeforeTax <= 0 || taxRatePercentage <= 0) {
    return 0;
  }

  return incomeBeforeTax * (taxRatePercentage / 100);
};

const calculateBreakEvenOccupancy = (
  inputs: CalculatorInputs,
  monthlyGrossAtFullOccupancy: number,
  operatingExpensesMonthlyFixed: number,
  loanPaymentMonthly: number,
): number | null => {
  const variableRate = toFraction(inputs.expenses.variable.revenueShare);
  const denominator = monthlyGrossAtFullOccupancy * (1 - variableRate);

  if (denominator <= 0) {
    return null;
  }

  const occupancyFraction =
    (operatingExpensesMonthlyFixed + loanPaymentMonthly) / denominator;

  if (!Number.isFinite(occupancyFraction)) {
    return null;
  }

  if (occupancyFraction < 0) {
    return 0;
  }

  return occupancyFraction * 100;
};

export const calculateResults = (inputs: CalculatorInputs): CalculatorResults => {
  const monthlyGrossIncome = calculateMonthlyGrossIncome(inputs);
  const annualGrossIncome = calculateAnnualGrossIncome(monthlyGrossIncome);

  const operatingExpenses = calculateOperatingExpenses(
    inputs,
    monthlyGrossIncome,
  );

  const noi = annualGrossIncome - operatingExpenses.annualTotal;

  const loanPayments = calculateLoanPayment(inputs);
  const cashFlowBeforeDebt = noi;
  const cashFlowAfterDebtBeforeTax = noi - loanPayments.annual;
  const taxableIncome = Math.max(cashFlowAfterDebtBeforeTax, 0);
  const taxes = calculateTaxes(
    taxableIncome,
    inputs.taxes.incomeTaxRate,
  );
  const cashFlowAfterDebtAndTax = cashFlowAfterDebtBeforeTax - taxes;

  const equityInvested = Math.max(
    inputs.financing.equity + inputs.property.initialCapex,
    0,
  );

  const cashOnCash =
    equityInvested > 0
      ? (cashFlowAfterDebtAndTax / equityInvested) * 100
      : 0;

  const capRate =
    inputs.property.purchasePrice > 0
      ? (noi / inputs.property.purchasePrice) * 100
      : 0;

  const paybackPeriodYears =
    cashFlowAfterDebtAndTax > 0 && equityInvested > 0
      ? equityInvested / cashFlowAfterDebtAndTax
      : null;

  const monthlyGrossAtFullOccupancy =
    inputs.rental.model === 'monthly'
      ? clampNumber(inputs.rental.monthlyRent)
      : (clampNumber(inputs.rental.nightlyRent) * DAYS_IN_YEAR) /
        MONTHS_IN_YEAR;

  const breakEvenOccupancy = calculateBreakEvenOccupancy(
    inputs,
    monthlyGrossAtFullOccupancy,
    operatingExpenses.monthlyFixed,
    loanPayments.monthly,
  );

  return {
    grossIncome: {
      monthly: monthlyGrossIncome,
      annual: annualGrossIncome,
    },
    operatingExpenses,
    noi,
    loanPayments,
    cashFlow: {
      annualBeforeDebt: cashFlowBeforeDebt,
      annualAfterDebtBeforeTax: cashFlowAfterDebtBeforeTax,
      annualAfterDebtAndTax,
    },
    taxes,
    returnMetrics: {
      cashOnCash,
      capRate,
      paybackPeriodYears,
      breakEvenOccupancy,
    },
  };
};
