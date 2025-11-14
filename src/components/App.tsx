import { FormSection } from './FormSection';
import { InputField } from './InputField';
import { ResultsView } from './ResultsView';
import { useRentalCalculator } from '../hooks/useRentalCalculator';

export const App = () => {
  const {
    inputs,
    results,
    updateProperty,
    updateRental,
    updateExpenses,
    updateTaxes,
    updateFinancing,
    reset,
  } = useRentalCalculator();

  const handleCurrencyChange = (value: number | string) => {
    updateProperty({ currency: String(value).toUpperCase() });
  };

  return (
    <div className="container">
      <header>
        <h1>Калькулятор доходности недвижимости</h1>
        <p>
          Изменяйте входные данные, чтобы мгновенно увидеть влияние на доходность
          объекта.
        </p>
      </header>
      <main className="layout">
        <form className="form">
          <FormSection title="Объект">
            <InputField
              label="Стоимость покупки"
              value={inputs.property.purchasePrice}
              onChange={(value) =>
                updateProperty({ purchasePrice: Number(value) })
              }
              step={1000}
              min={0}
            />
            <InputField
              label="Валюта"
              value={inputs.property.currency}
              onChange={handleCurrencyChange}
              type="text"
            />
            <InputField
              label="Дополнительные вложения (CapEx)"
              value={inputs.property.initialCapex}
              onChange={(value) => updateProperty({ initialCapex: Number(value) })}
              step={1000}
              min={0}
            />
          </FormSection>

          <FormSection title="Аренда">
            <label className="field">
              <span className="field__label">Модель аренды</span>
              <div className="field__input-wrapper">
                <select
                  value={inputs.rental.model}
                  onChange={(event) =>
                    updateRental({ model: event.target.value as typeof inputs.rental.model })
                  }
                >
                  <option value="monthly">Помесячно</option>
                  <option value="daily">Посуточно</option>
                </select>
              </div>
            </label>
            <InputField
              label="Аренда в месяц"
              value={inputs.rental.monthlyRent}
              onChange={(value) => updateRental({ monthlyRent: Number(value) })}
              step={100}
              min={0}
              description="Используется для модели помесячной аренды"
            />
            <InputField
              label="Аренда за ночь"
              value={inputs.rental.nightlyRent}
              onChange={(value) => updateRental({ nightlyRent: Number(value) })}
              step={10}
              min={0}
              description="Используется для посуточной аренды"
            />
            <InputField
              label="Заполняемость, %"
              value={inputs.rental.occupancy}
              onChange={(value) => updateRental({ occupancy: Number(value) })}
              step={1}
              min={0}
              max={100}
            />
          </FormSection>

          <FormSection title="Расходы">
            <InputField
              label="Коммунальные"
              value={inputs.expenses.fixed.utilities}
              onChange={(value) =>
                updateExpenses({
                  fixed: { ...inputs.expenses.fixed, utilities: Number(value) },
                })
              }
              step={50}
              min={0}
            />
            <InputField
              label="Персонал"
              value={inputs.expenses.fixed.staff}
              onChange={(value) =>
                updateExpenses({
                  fixed: { ...inputs.expenses.fixed, staff: Number(value) },
                })
              }
              step={50}
              min={0}
            />
            <InputField
              label="Страховка"
              value={inputs.expenses.fixed.insurance}
              onChange={(value) =>
                updateExpenses({
                  fixed: { ...inputs.expenses.fixed, insurance: Number(value) },
                })
              }
              step={50}
              min={0}
            />
            <InputField
              label="Прочие расходы"
              value={inputs.expenses.fixed.other}
              onChange={(value) =>
                updateExpenses({
                  fixed: { ...inputs.expenses.fixed, other: Number(value) },
                })
              }
              step={50}
              min={0}
            />
            <InputField
              label="Переменные расходы, % от выручки"
              value={inputs.expenses.variable.revenueShare}
              onChange={(value) =>
                updateExpenses({
                  variable: {
                    ...inputs.expenses.variable,
                    revenueShare: Number(value),
                  },
                })
              }
              step={1}
              min={0}
              max={100}
            />
          </FormSection>

          <FormSection title="Налоги">
            <InputField
              label="Ставка налога на прибыль, %"
              value={inputs.taxes.incomeTaxRate}
              onChange={(value) => updateTaxes({ incomeTaxRate: Number(value) })}
              step={1}
              min={0}
              max={100}
            />
          </FormSection>

          <FormSection title="Финансирование">
            <InputField
              label="Собственные средства"
              value={inputs.financing.equity}
              onChange={(value) => updateFinancing({ equity: Number(value) })}
              step={1000}
              min={0}
            />
            <InputField
              label="Кредит"
              value={inputs.financing.loanAmount}
              onChange={(value) => updateFinancing({ loanAmount: Number(value) })}
              step={1000}
              min={0}
            />
            <InputField
              label="Ставка по кредиту, %"
              value={inputs.financing.interestRate}
              onChange={(value) => updateFinancing({ interestRate: Number(value) })}
              step={0.1}
              min={0}
            />
            <InputField
              label="Срок кредита, лет"
              value={inputs.financing.loanTermYears}
              onChange={(value) => updateFinancing({ loanTermYears: Number(value) })}
              step={1}
              min={1}
            />
          </FormSection>
          <button
            type="button"
            className="reset-button"
            onClick={reset}
          >
            Сбросить на значения по умолчанию
          </button>
        </form>
        <ResultsView inputs={inputs} results={results} />
      </main>
    </div>
  );
};
