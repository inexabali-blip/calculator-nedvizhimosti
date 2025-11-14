import type { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

export const FormSection = ({ title, children }: FormSectionProps) => (
  <fieldset className="form-section">
    <legend>{title}</legend>
    <div className="form-section__content">{children}</div>
  </fieldset>
);
