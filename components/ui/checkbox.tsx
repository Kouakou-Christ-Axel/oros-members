import type { ComponentProps } from "react";
import { Icon } from "./icon";

/* Checkbox — shadcn/ui checkbox.tsx. 16px box, 4px radius. */
export interface CheckboxProps extends Omit<ComponentProps<"button">, "onChange"> {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Checkbox({ checked, indeterminate, disabled, onChange, ...rest }: CheckboxProps) {
  const state = indeterminate ? "indeterminate" : checked ? "checked" : "unchecked";
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : !!checked}
      data-slot="checkbox"
      data-state={state}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      {...rest}
    >
      {state !== "unchecked" ? (
        <span data-slot="checkbox-indicator">
          <Icon name={indeterminate ? "minus" : "check"} size={12} strokeWidth={3} />
        </span>
      ) : null}
    </button>
  );
}
