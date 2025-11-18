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
  // 🔹 НОВЫЙ БЛОК: параметры прогноза
  projection: {
    holdingPeriodYears: 15,      // срок владения, лет
    annualAppreciationRate: 5,   // рост стоимости объекта, % в год
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

  // 🔹 Переключение режима "вся сумма своими средствами"
  const setAllEquity = () => {
    setInputs((prev) => {
      const total =
        (prev.property.purchasePrice || 0) +
        (prev.property.initialCapex || 0);

      return {
        ...prev,
        financing: {
          equity: total,
          loanAmount: 0,
          interestRate: 0,
          loanTermYears: 0,
        },
      };
    });
  };

  const unsetAllEquity = () => {
    // Просто разрешаем снова работать с кредитом вручную,
    // сами числа пользователь потом введёт
    setInputs((prev) => ({
      ...prev,
      financing: {
        ...prev.financing,
        // оставляем equity как есть, кредит снова можно задавать
        loanAmount: prev.financing.loanAmount,
      },
    }));
  };

  const results: CalculatorResults = useMemo(
    () => calculateResults(inputs),
    [inputs],
  );

  // Признак, что сейчас по сути "вся сумма своими"
  const isAllEquity =
    inputs.financing.loanAmount === 0 &&
    inputs.financing.equity >=
      inputs.property.purchasePrice + inputs.property.initialCapex;

  return {
    inputs,
    results,
    updateProperty: updateSection('property'),
    updateRental: updateSection('rental'),
    updateExpenses: updateSection('expenses'),
    updateTaxes: updateSection('taxes'),
    updateFinancing: updateSection('financing'),
    updateProjection: updateSection('projection'), // 🔹 добавили апдейтер для блока прогноза
    // режим полной оплаты своими средствами
    isAllEquity,
    setAllEquity,
    unsetAllEquity,
    reset: () => setInputs(defaultInputs),
  };
};
