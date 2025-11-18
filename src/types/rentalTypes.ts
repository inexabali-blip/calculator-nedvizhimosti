export type RentalModel = 'monthly' | 'daily';

export interface PropertyInputs {
  purchasePrice: number;
  currency: string;
  initialCapex: number;
}

export interface RentalInputs {
  model: RentalModel;
  monthlyRent: number;
  nightlyRent: number;
  occupancy: number; // percentage 0-100
}

export interface FixedExpenses {
  utilities: number;
  staff: number;
  insurance: number;
  other: number;
}

export interface VariableExpenses {
  revenueShare: number; // percentage 0-100
}

export interface ExpenseInputs {
  fixed: FixedExpenses;
  variable: VariableExpenses;
}

export interface TaxInputs {
  incomeTaxRate: number; // percentage 0-100
}

export interface FinancingInputs {
  equity: number;
  loanAmount: number;
  interestRate: number; // percentage
  loanTermYears: number;
}

// 🔹 НОВЫЙ БЛОК: параметры прогноза / Total Return
export interface ProjectionInputs {
  holdingPeriodYears: number;       // срок владения, лет
  annualAppreciationRate: number;   // рост стоимости объекта, % в год
}

export interface CalculatorInputs {
  property: PropertyInputs;
  rental: RentalInputs;
  expenses: ExpenseInputs;
  taxes: TaxInputs;
  financing: FinancingInputs;
  projection: ProjectionInputs;     // 🔹 НОВОЕ ПОЛЕ
}

export interface GrossIncomeResult {
  monthly: number;
  annual: number;
}

export interface OperatingExpensesResult {
  monthlyFixed: number;
  monthlyVariable: number;
  monthlyTotal: number;
  annualTotal: number;
}

export interface LoanPaymentResult {
  monthly: number;
  annual: number;
}

export interface CashFlowResult {
  annualBeforeDebt: number;
  annualAfterDebtBeforeTax: number;
  annualAfterDebtAndTax: number;
}

export interface ReturnMetricsResult {
  cashOnCash: number;
  capRate: number;
  paybackPeriodYears: number | null;
  breakEvenOccupancy: number | null;
}

// 🔹 НОВЫЙ БЛОК: Total Return / Совокупная доходность
export interface TotalReturnResult {
  finalSaleValue: number;      // конечная стоимость продажи
  capitalGain: number;         // прирост капитала
  totalROI: number;            // совокупный ROI за весь срок, %
  annualizedReturn: number;    // среднегодовая доходность, %
}

export interface CalculatorResults {
  grossIncome: GrossIncomeResult;
  operatingExpenses: OperatingExpensesResult;
  noi: number;
  loanPayments: LoanPaymentResult;
  cashFlow: CashFlowResult;
  taxes: number;
  returnMetrics: ReturnMetricsResult;
  totalReturn: TotalReturnResult;   // 🔹 НОВОЕ ПОЛЕ
}
