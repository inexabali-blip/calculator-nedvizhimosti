import React from 'react';
import { FormSection } from './FormSection';
import { InputField } from './InputField';
import { ResultsView } from './ResultsView';
import { useRentalCalculator } from '../hooks/useRentalCalculator';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const {
    inputs,
    results,
    updateProperty,
    updateRental,
    updateExpenses,
    updateTaxes,
    updateFinancing,
    updateProjection,
    isAllEquity,
    reset,
  } = useRentalCalculator();

  // Название объекта — только для отчёта и имени файла
  const [propertyName, setPropertyName] = React.useState('');

  const handleCurrencyChange = (value: number | string) => {
    updateProperty({ currency: String(value).toUpperCase() });
  };

  /**
   * 📌 ИСПРАВЛЕННЫЙ ЭКСПОРТ В PDF
   * - работает и на десктопе, и на мобильных
   * - многостраничный отчёт без повторяющихся страниц
   * - фикс scrollY для мобильного Safari
   */
  const handleExportPdf = async () => {
    const element = document.getElementById('calculator-report');
    if (!element) return;

    const safeName = (propertyName || 'Investment Report').trim();
    const fileName = `${safeName} — Rental Report.pdf`;

    // Делаем скриншот блока формы + результатов
    const canvas = await html2canvas(element, {
      scale: 2,
      scrollY: -window.scrollY, // важно для мобильных браузеров
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');

    // Создаём PDF формата A4
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Пропорционально подгоняем ширину под PDF
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Многостраничная логика: режем одно длинное изображение по высоте
    let heightLeft = imgHeight;
    let position = 0;

    // Первая страница
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Последующие страницы — каждый раз сдвигаем изображение выше
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(fileName);
  };

  return (
    <div className="container">
      <header>
        <h1>
          Калькулятор доходности недвижимости (Real Estate Investment Calculator)
        </h1>
        <p>
          Изменяйте входные данные, чтобы мгновенно увидеть влияние на доходность объекта.
          Adjust the inputs to instantly see how they affect your property returns.
        </p>
      </header>

      {/* Весь блок формы + результатов заворачиваем в id=calculator-report,
          именно его мы экспортируем в PDF */}
      <main className="layout" id="calculator-report">
        <form className="form">
          {/* ОБЪЕКТ / PROPERTY */}
          <FormSection title="Объект (Property)">
            <InputField
              label="Название объекта (не влияет на расчёты) / Property Name"
              value={propertyName}
              onChange={(value) => setPropertyName(String(value))}
              type="text"
            />

            <InputField
              label="Стоимость покупки (Purchase Price)"
              value={inputs.property.purchasePrice}
              onChange={(value) =>
                updateProperty({ purchasePrice: Number(value) })
              }
              step={1000}
              min={0}
            />
            <InputField
              label="Валюта (Currency)"
              value={inputs.property.currency}
              onChange={handleCurrencyChange}
              type="text"
            />
            <InputField
              label="Дополнительные вложения (CapEx / Additional Capital Expenditures)"
              value={inputs.property.initialCapex}
              onChange={(value) =>
                updateProperty({ initialCapex: Number(value) })
              }
              step={1000}
              min={0}
            />
          </FormSection>

          {/* АРЕНДА / RENTAL */}
          <FormSection title="Аренда (Rental)">
            <label className="field">
              <span className="field__label">Модель аренды (Rental Model)</span>
              <div className="field__input-wrapper">
                <select
                  value={inputs.rental.model}
                  onChange={(event) =>
                    updateRental({
                      model: event.target.value as typeof inputs.rental.model,
                    })
                  }
                >
                  <option value="monthly">Помесячно (Monthly)</option>
                  <option value="daily">Посуточно (Daily)</option>
                </select>
              </div>
            </label>

            <InputField
              label="Аренда в месяц (Monthly Rent)"
              value={inputs.rental.monthlyRent}
              onChange={(value) =>
                updateRental({ monthlyRent: Number(value) })
              }
              step={100}
              min={0}
              description="Используется для модели помесячной аренды. Used for monthly rental model."
            />

            <InputField
              label="Аренда за ночь (учитывается только при посуточной аренде) / Nightly Rate (used only for daily rentals)"
              value={inputs.rental.nightlyRent}
              onChange={(value) =>
                updateRental({ nightlyRent: Number(value) })
              }
              step={10}
              min={0}
              description="Используется только для посуточной модели аренды. Used only for the daily rental model."
            />

            <InputField
              label="Заполняемость, % (Occupancy, %)"
              value={inputs.rental.occupancy}
              onChange={(value) => updateRental({ occupancy: Number(value) })}
              step={1}
              min={0}
              max={100}
            />
          </FormSection>

          {/* РАСХОДЫ / EXPENSES */}
          <FormSection title="Расходы (Expenses)">
            <InputField
              label="Коммунальные (Utilities)"
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
              label="Персонал (Staff)"
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
              label="Страховка (Insurance)"
              value={inputs.expenses.fixed.insurance}
              onChange={(value) =>
                updateExpenses({
                  fixed: {
                    ...inputs.expenses.fixed,
                    insurance: Number(value),
                  },
                })
              }
              step={50}
              min={0}
            />
            <InputField
              label="Прочие расходы (Other Fixed Expenses)"
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
              label="Переменные расходы, % от выручки (управляющая компания / management fee)"
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

          {/* НАЛОГИ / TAXES */}
          <FormSection title="Налоги (Taxes)">
            <InputField
              label="Ставка налога на прибыль, % (Income Tax Rate, %)"
              value={inputs.taxes.incomeTaxRate}
              onChange={(value) =>
                updateTaxes({ incomeTaxRate: Number(value) })
              }
              step={1}
              min={0}
              max={100}
            />
          </FormSection>

          {/* ФИНАНСИРОВАНИЕ / FINANCING */}
          <FormSection title="Финансирование (Financing)">
            <label className="field" style={{ marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={isAllEquity}
                onChange={(e) => {
                  const checked = e.target.checked;

                  if (checked) {
                    const total =
                      inputs.property.purchasePrice +
                      inputs.property.initialCapex;

                    updateFinancing({
                      equity: total,
                      loanAmount: 0,
                      interestRate: 0,
                      loanTermYears: 0,
                    });
                  } else {
                    updateFinancing({
                      loanAmount: 0,
                      interestRate: 0,
                      loanTermYears: 1,
                    });
                  }
                }}
              />
              <span style={{ marginLeft: 8 }}>
                Вся сумма своими средствами (100% Equity, No Loan)
              </span>
            </label>

            <InputField
              label="Собственные средства (Equity)"
              value={inputs.financing.equity}
              onChange={(value) =>
                updateFinancing({ equity: Number(value) })
              }
              step={1000}
              min={0}
            />
            <InputField
              label="Кредит (Loan Amount)"
              value={inputs.financing.loanAmount}
              onChange={(value) =>
                updateFinancing({ loanAmount: Number(value) })
              }
              step={1000}
              min={0}
              disabled={isAllEquity}
            />
            <InputField
              label="Ставка по кредиту, % (Interest Rate, %)"
              value={inputs.financing.interestRate}
              onChange={(value) =>
                updateFinancing({ interestRate: Number(value) })
              }
              step={0.1}
              min={0}
              disabled={isAllEquity}
            />
            <InputField
              label="Срок кредита, лет (Loan Term, years)"
              value={inputs.financing.loanTermYears}
              onChange={(value) =>
                updateFinancing({ loanTermYears: Number(value) })
              }
              step={1}
              min={1}
              disabled={isAllEquity}
            />
          </FormSection>

          {/* ПРОГНОЗ / PROJECTION */}
          <FormSection title="Прогноз / Рост стоимости (Projection / Capital Appreciation)">
            <InputField
              label="Срок владения, лет (Holding Period, years)"
              value={inputs.projection.holdingPeriodYears}
              onChange={(value) =>
                updateProjection({ holdingPeriodYears: Number(value) })
              }
              step={1}
              min={1}
              max={50}
            />
            <InputField
              label="Рост стоимости объекта, % в год (Annual Appreciation Rate, %)"
              value={inputs.projection.annualAppreciationRate}
              onChange={(value) =>
                updateProjection({
                  annualAppreciationRate: Number(value),
                })
              }
              step={0.5}
              min={0}
              max={20}
            />
          </FormSection>

          <button type="button" className="reset-button" onClick={reset}>
            Сбросить на значения по умолчанию (Reset to Defaults)
          </button>
        </form>

        <ResultsView inputs={inputs} results={results} />
      </main>

      {/* Кнопка экспорта — вне блока report, чтобы не попадала в PDF */}
      <div style={{ marginTop: '16px' }}>
        <button
          type="button"
          className="reset-button"
          onClick={handleExportPdf}
        >
          Скачать отчёт (PDF)
        </button>
      </div>
    </div>
  );
};

export default App;
