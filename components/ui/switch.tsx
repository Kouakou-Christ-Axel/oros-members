import type { ComponentProps } from "react";

/* Switch — shadcn/ui switch.tsx. 32x18.4px track, 16px thumb. */
export interface SwitchProps extends Omit<ComponentProps<"button">, "onChange"> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Switch({ checked, disabled, onChange, ...rest }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      disabled={disabled}
      data-slot="switch"
      data-state={checked ? "checked" : "unchecked"}
      onClick={() => onChange?.(!checked)}
      {...rest}
    >
      <span data-slot="switch-thumb" />
    </button>
  );
}
