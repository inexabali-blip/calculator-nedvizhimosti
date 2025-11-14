import { describe, expect, it } from 'vitest';
import { calculateResults } from '../src/calculations/rentalCalculator';
import type { CalculatorInputs } from '../src/types/rentalTypes';

describe('calculateResults', () => {
  it('handles monthly rental scenarios', () => {
    const inputs: CalculatorInputs = {
      property: {
        purchasePrice: 200_000,
        currency: 'USD',
        initialCapex: 20_000,
      },
      rental: {
        model: 'monthly',
        monthlyRent: 4_000,
        nightlyRent: 200,
        occupancy: 80,
      },
      expenses: {
        fixed: {
          utilities: 300,
          staff: 400,
          insurance: 100,
          other: 100,
        },
        variable: {
          revenueShare: 10,
        },
      },
      taxes: {
        incomeTaxRate: 10,
      },
      financing: {
        equity: 120_000,
        loanAmount: 100_000,
        interestRate: 5,
        loanTermYears: 20,
      },
    };

    const results = calculateResults(inputs);

    expect(results.grossIncome.monthly).toBeCloseTo(3_200, 2);
    expect(results.grossIncome.annual).toBeCloseTo(38_400, 2);
    expect(results.operatingExpenses.monthlyTotal).toBeCloseTo(1_220, 2);
    expect(results.operatingExpenses.annualTotal).toBeCloseTo(14_640, 2);
    expect(results.noi).toBeCloseTo(23_760, 2);
    expect(results.loanPayments.monthly).toBeCloseTo(659.96, 2);
    expect(results.loanPayments.annual).toBeCloseTo(7_919.47, 2);
    expect(results.cashFlow.annualAfterDebtBeforeTax).toBeCloseTo(15_840.53, 2);
    expect(results.taxes).toBeCloseTo(1_584.05, 2);
    expect(results.cashFlow.annualAfterDebtAndTax).toBeCloseTo(14_256.48, 2);
    expect(results.returnMetrics.cashOnCash).toBeCloseTo(10.18, 2);
    expect(results.returnMetrics.capRate).toBeCloseTo(11.88, 2);
    expect(results.returnMetrics.paybackPeriodYears).toBeCloseTo(9.82, 2);
    expect(results.returnMetrics.breakEvenOccupancy).toBeCloseTo(43.33, 2);
  });

  it('handles daily rental scenarios', () => {
    const inputs: CalculatorInputs = {
      property: {
        purchasePrice: 300_000,
        currency: 'USD',
        initialCapex: 50_000,
      },
      rental: {
        model: 'daily',
        monthlyRent: 4_000,
        nightlyRent: 250,
        occupancy: 60,
      },
      expenses: {
        fixed: {
          utilities: 400,
          staff: 600,
          insurance: 120,
          other: 200,
        },
        variable: {
          revenueShare: 18,
        },
      },
      taxes: {
        incomeTaxRate: 12,
      },
      financing: {
        equity: 180_000,
        loanAmount: 150_000,
        interestRate: 7,
        loanTermYears: 15,
      },
    };

    const results = calculateResults(inputs);

    expect(results.grossIncome.monthly).toBeCloseTo(4_562.5, 2);
    expect(results.grossIncome.annual).toBeCloseTo(54_750, 2);
    expect(results.operatingExpenses.monthlyTotal).toBeCloseTo(2_141.25, 2);
    expect(results.operatingExpenses.annualTotal).toBeCloseTo(25_695, 2);
    expect(results.noi).toBeCloseTo(29_055, 2);
    expect(results.loanPayments.monthly).toBeCloseTo(1_348.24, 2);
    expect(results.loanPayments.annual).toBeCloseTo(16_178.91, 2);
    expect(results.cashFlow.annualAfterDebtBeforeTax).toBeCloseTo(12_876.09, 2);
    expect(results.taxes).toBeCloseTo(1_545.13, 2);
    expect(results.cashFlow.annualAfterDebtAndTax).toBeCloseTo(11_330.96, 2);
    expect(results.returnMetrics.cashOnCash).toBeCloseTo(4.93, 2);
    expect(results.returnMetrics.capRate).toBeCloseTo(9.685, 2);
    expect(results.returnMetrics.paybackPeriodYears).toBeCloseTo(20.3, 1);
    expect(results.returnMetrics.breakEvenOccupancy).toBeCloseTo(42.79, 2);
  });
});
