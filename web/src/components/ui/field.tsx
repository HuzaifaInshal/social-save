import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import * as Select from "@radix-ui/react-select";

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

export type SelectOption = { value: string; label: string };

type SelectInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
};

const EMPTY_SENTINEL = "__empty__";
const toInternal = (v: string) => v === "" ? EMPTY_SENTINEL : v;
const toExternal = (v: string) => v === EMPTY_SENTINEL ? "" : v;

export function SelectInput({ value, onValueChange, options, placeholder }: SelectInputProps) {
  const displayed = options.find((o) => o.value === value)?.label ?? placeholder ?? "Select…";
  return (
    <Select.Root value={toInternal(value)} onValueChange={(v) => onValueChange(toExternal(v))}>
      <Select.Trigger className="field__control field__select-trigger" aria-label="Select">
        <span className="field__select-value">{displayed}</span>
        <Select.Icon className="field__select-icon">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="field__select-content" position="popper" sideOffset={4}>
          <Select.ScrollUpButton className="field__select-scroll-btn">▲</Select.ScrollUpButton>
          <Select.Viewport className="field__select-viewport">
            {options.map((opt) => (
              <Select.Item key={opt.value} value={toInternal(opt.value)} className="field__select-item">
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="field__select-scroll-btn">▼</Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
