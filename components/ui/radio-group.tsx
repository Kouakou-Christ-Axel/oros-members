import type { ComponentProps, ReactNode } from "react";

/* RadioGroup — shadcn/ui radio-group.tsx. 16px dot, 8px indicator. */
export function RadioGroup(props: ComponentProps<"div">) {
  return <div data-slot="radio-group" role="radiogroup" {...props} />;
}

export interface RadioGroupItemProps extends Omit<ComponentProps<"button">, "onChange"> {
  checked?: boolean;
  label?: ReactNode;
  onChange?: (checked: boolean) => void;
}

export function RadioGroupItem({ checked, disabled, label, onChange, className, ...rest }: RadioGroupItemProps) {
  const control = (
    <button
      type="button"
      role="radio"
      aria-checked={!!checked}
      disabled={disabled}
      data-slot="radio-group-item"
      data-state={checked ? "checked" : "unchecked"}
      onClick={() => onChange?.(true)}
      className={label ? undefined : className}
      {...rest}
    />
  );
  if (!label) return control;
  return (
    <label className={className} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
      {control}
      <span>{label}</span>
    </label>
  );
}
