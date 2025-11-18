import type { CalculatorInputs, CalculatorResults } from '../types/rentalTypes';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

interface ResultsViewProps {
  inputs: CalculatorInputs;
  results: CalculatorResults | null; // results может быть null в начале
}

const formatPayback = (value: number | null): string => {
  if (value === null) {
    return '—';
  }

  return `${formatNumber(value, 1)} лет`;
};

export const ResultsView = ({ inputs, results }: ResultsViewProps) => {
  const currency = inputs.property.currency || 'USD';

  // 🔒 Страхуемся от "дыр" в объекте results,
  // чтобы не было падения на results.grossIncome.monthly
  if (
    !results ||
    !results.grossIncome ||
    !results.operatingExpenses ||
    !results.loanPayments ||
    !results.cashFlow ||
    !results.returnMetrics ||
    !results.totalReturn
  ) {
    return (
      <section className="results">
        <h2>Результаты (Results)</h2>
        <p>Недостаточно данных для расчёта (results ещё не полностью посчитан).</p>
      </section>
    );
  }

  const { totalReturn } = results;

  return (
    <section className="results">
      <h2>Результаты (Results)</h2>
      <div className="results__grid">
        {/* Выручка / Revenue */}
        <div>
          <h3>Выручка (Revenue)</h3>
          <ul>
            <li>
              Месячная выручка (Monthly Revenue):{' '}
              {formatCurrency(results.grossIncome.monthly, currency)}
            </li>
            <li>
              Годовая выручка (Annual Revenue):{' '}
              {formatCurrency(results.grossIncome.annual, currency)}
            </li>
          </ul>
        </div>

        {/* Операционные расходы / Operating Expenses */}
        <div>
          <h3>Операционные расходы (Operating Expenses)</h3>
          <ul>
            <li>
              Месячные фиксированные расходы (Monthly Fixed Expenses):{' '}
              {formatCurrency(results.operatingExpenses.monthlyFixed, currency)}
            </li>
            <li>
              Месячные переменные расходы (Monthly Variable Expenses):{' '}
              {formatCurrency(results.operatingExpenses.monthlyVariable, currency)}
            </li>
            <li>
              Итого расходов в месяц (Total Monthly Expenses):{' '}
              {formatCurrency(results.operatingExpenses.monthlyTotal, currency)}
            </li>
            <li>
              Итого расходов в год (Total Annual Expenses):{' '}
              {formatCurrency(results.operatingExpenses.annualTotal, currency)}
            </li>
          </ul>
        </div>

        {/* NOI и налоги / NOI and Taxes */}
        <div>
          <h3>NOI и налоги (NOI and Taxes)</h3>
          <ul>
            <li>
              Чистый операционный доход (NOI / Net Operating Income):{' '}
              {formatCurrency(results.noi, currency)}
            </li>
            <li>
              Налог на прибыль (Income Tax):{' '}
              {formatCurrency(results.taxes, currency)}
            </li>
          </ul>
        </div>

        {/* Кредит / Loan */}
        <div>
          <h3>Кредит (Loan)</h3>
          <ul>
            <li>
              Ежемесячный платёж (Monthly Debt Service):{' '}
              {formatCurrency(results.loanPayments.monthly, currency)}
            </li>
            <li>
              Ежегодный платёж (Annual Debt Service):{' '}
              {formatCurrency(results.loanPayments.annual, currency)}
            </li>
          </ul>
        </div>

        {/* Денежный поток / Cash Flow */}
        <div>
          <h3>Денежный поток (Cash Flow)</h3>
          <ul>
            <li>
              До обслуживания долга (Before Debt Service):{' '}
              {formatCurrency(results.cashFlow.annualBeforeDebt, currency)}
            </li>
            <li>
              После обслуживания долга, до налогов (After Debt, Before Tax):{' '}
              {formatCurrency(results.cashFlow.annualAfterDebtBeforeTax, currency)}
            </li>
            <li>
              После обслуживания долга и налогов (After Debt and Tax):{' '}
              {formatCurrency(results.cashFlow.annualAfterDebtAndTax, currency)}
            </li>
          </ul>
        </div>

        {/* Показатели доходности / Return Metrics */}
        <div>
          <h3>Показатели доходности (Return Metrics)</h3>
          <ul>
            <li>
              Cash-on-Cash: {formatPercent(results.returnMetrics.cashOnCash)}
            </li>
            <li>
              Cap Rate: {formatPercent(results.returnMetrics.capRate)}
            </li>
            <li>
              Окупаемость по денежному потоку (Cashflow Payback Period):{' '}
              {formatPayback(results.returnMetrics.paybackPeriodYears)}
            </li>
            <li>
              Точка безубыточности по заполняемости (Break-even Occupancy):{' '}
              {results.returnMetrics.breakEvenOccupancy !== null
                ? formatPercent(results.returnMetrics.breakEvenOccupancy)
                : '—'}
            </li>
          </ul>
        </div>

        {/* Общая доходность / Total Return */}
        <div>
          <h3>Показатели общей доходности (Total Return Metrics)</h3>
          <ul>
            <li>
              Конечная стоимость объекта (Final Sale Value):{' '}
              {formatCurrency(totalReturn.finalSaleValue, currency)}
            </li>
            <li>
              Прирост капитала за весь период (Capital Gain for Holding Period):{' '}
              {formatCurrency(totalReturn.capitalGain, currency)}
            </li>
            <li>
              Совокупный ROI за период владения (Total ROI for Holding Period):{' '}
              {formatPercent(totalReturn.totalROI)}
            </li>
            <li>
              Среднегодовая доходность (Average Annual Return):{' '}
              {formatPercent(totalReturn.annualizedReturn)}
            </li>
            <li>
              Полная окупаемость с учётом роста стоимости
              (Total Payback Period including Appreciation):{' '}
              {formatPayback(totalReturn.totalPaybackPeriodYears)}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
