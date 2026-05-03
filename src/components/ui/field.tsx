import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldWrapperProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
};

export function FieldWrapper({ label, hint, children }: FieldWrapperProps) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="field__control" {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="field__control field__control--area" {...props} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="field__control" {...props} />;
}
