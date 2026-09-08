import type { ComponentProps } from "react";
import { Icon } from "./icon";

/* NativeSelect — shadcn/ui native-select.tsx. A real <select>: the church
   office works on tablets and native pickers beat custom listboxes there. */
export interface NativeSelectProps extends Omit<ComponentProps<"select">, "size"> {
  size?: "default" | "sm";
  invalid?: boolean;
}

export function NativeSelect({ size = "default", invalid, className, children, ...rest }: NativeSelectProps) {
  return (
    <div data-slot="native-select-wrapper" className={className}>
      <select data-slot="native-select" data-size={size} aria-invalid={invalid || undefined} {...rest}>
        {children}
      </select>
      <Icon name="chevron-down" size={16} data-slot="native-select-icon" />
    </div>
  );
}
