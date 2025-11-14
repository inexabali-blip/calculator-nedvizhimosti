import type { ChangeEvent } from 'react';

interface InputFieldProps {
  label: string;
  value: number | string;
  onChange: (value: number | string) => void;
  type?: 'number' | 'text';
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  description?: string;
}

export const InputField = ({
  label,
  value,
  onChange,
  type = 'number',
  step,
  min,
  max,
  suffix,
  description,
}: InputFieldProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (type === 'text') {
      onChange(event.target.value);
      return;
    }

    const parsedValue = event.target.value === '' ? 0 : Number(event.target.value);
    onChange(Number.isFinite(parsedValue) ? parsedValue : 0);
  };

  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <div className="field__input-wrapper">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          step={step}
          min={min}
          max={max}
        />
        {suffix ? <span className="field__suffix">{suffix}</span> : null}
      </div>
      {description ? <span className="field__description">{description}</span> : null}
    </label>
  );
};
