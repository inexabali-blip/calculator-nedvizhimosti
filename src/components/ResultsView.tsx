import type { CalculatorInputs, CalculatorResults } from '../types/rentalTypes';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

interface ResultsViewProps {
  inputs: CalculatorInputs;
  results: CalculatorResults;
}

const formatPayback = (value: number | null): string => {
  if (value === null) {
    return '—';
  }

  return `${formatNumber(value, 1)} лет`;
};

export const ResultsView = ({ inputs, results }: ResultsViewProps) => {
  const currency = inputs.property.currency || 'USD';

  return (
    <section className="results">
      <h2>Результаты</h2>
      <div className="results__grid">
        <div>
          <h3>Выручка</h3>
          <ul>
            <li>
              Месячная: {formatCurrency(results.grossIncome.monthly, currency)}
            </li>
            <li>
              Годовая: {formatCurrency(results.grossIncome.annual, currency)}
            </li>
          </ul>
        </div>
        <div>
          <h3>Операционные расходы</h3>
          <ul>
            <li>
              Месячные фиксированные:{' '}
              {formatCurrency(results.operatingExpenses.monthlyFixed, currency)}
            </li>
            <li>
              Месячные переменные:{' '}
              {formatCurrency(results.operatingExpenses.monthlyVariable, currency)}
            </li>
            <li>
              Итого в месяц:{' '}
              {formatCurrency(results.operatingExpenses.monthlyTotal, currency)}
            </li>
            <li>
              Итого в год:{' '}
              {formatCurrency(results.operatingExpenses.annualTotal, currency)}
            </li>
          </ul>
        </div>
        <div>
          <h3>NOI и налоги</h3>
          <ul>
            <li>Чистый операционный доход (NOI): {formatCurrency(results.noi, currency)}</li>
            <li>Налог на прибыль: {formatCurrency(results.taxes, currency)}</li>
          </ul>
        </div>
        <div>
          <h3>Кредит</h3>
          <ul>
            <li>
              Ежемесячный платёж: {formatCurrency(results.loanPayments.monthly, currency)}
            </li>
            <li>
              Ежегодный платёж: {formatCurrency(results.loanPayments.annual, currency)}
            </li>
          </ul>
        </div>
        <div>
          <h3>Денежный поток</h3>
          <ul>
            <li>
              До обслуживания долга:{' '}
              {formatCurrency(results.cashFlow.annualBeforeDebt, currency)}
            </li>
            <li>
              После обслуживания долга (до налогов):{' '}
              {formatCurrency(results.cashFlow.annualAfterDebtBeforeTax, currency)}
            </li>
            <li>
              После обслуживания долга и налогов:{' '}
              {formatCurrency(results.cashFlow.annualAfterDebtAndTax, currency)}
            </li>
          </ul>
        </div>
        <div>
          <h3>Показатели доходности</h3>
          <ul>
            <li>Cash-on-Cash: {formatPercent(results.returnMetrics.cashOnCash)}</li>
            <li>Cap Rate: {formatPercent(results.returnMetrics.capRate)}</li>
            <li>
              Срок окупаемости: {formatPayback(results.returnMetrics.paybackPeriodYears)}
            </li>
            <li>
              Точка безубыточности:{' '}
              {results.returnMetrics.breakEvenOccupancy !== null
                ? formatPercent(results.returnMetrics.breakEvenOccupancy)
                : '—'}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
