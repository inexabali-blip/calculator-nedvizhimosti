import { useMemo, useState } from 'react';
import { calculateResults } from '../calculations/rentalCalculator';
import type { CalculatorInputs, CalculatorResults } from '../types/rentalTypes';

const defaultInputs: CalculatorInputs = {
  property: {
    purchasePrice: 250_000,
    currency: 'USD',
    initialCapex: 25_000,
  },
  rental: {
    model: 'monthly',
    monthlyRent: 3_500,
    nightlyRent: 180,
    occupancy: 75,
  },
  expenses: {
    fixed: {
      utilities: 250,
      staff: 500,
      insurance: 100,
      other: 150,
    },
    variable: {
      revenueShare: 15,
    },
  },
  taxes: {
    incomeTaxRate: 10,
  },
  financing: {
    equity: 150_000,
    loanAmount: 125_000,
    interestRate: 6.5,
    loanTermYears: 15,
  },
};

type SectionUpdater<Section extends keyof CalculatorInputs> = (
  changes: Partial<CalculatorInputs[Section]>,
) => void;

export const useRentalCalculator = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);

  const updateSection = <Section extends keyof CalculatorInputs>(
    section: Section,
  ): SectionUpdater<Section> =>
    (changes) => {
      setInputs((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          ...changes,
        },
      }));
    };

  const results: CalculatorResults = useMemo(
    () => calculateResults(inputs),
    [inputs],
  );

  return {
    inputs,
    results,
    updateProperty: updateSection('property'),
    updateRental: updateSection('rental'),
    updateExpenses: updateSection('expenses'),
    updateTaxes: updateSection('taxes'),
    updateFinancing: updateSection('financing'),
    reset: () => setInputs(defaultInputs),
  };
};
