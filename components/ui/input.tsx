import type { ComponentProps } from "react";
import { Icon } from "./icon";

/* Input — shadcn/ui input.tsx. 36px tall, 8px radius, shadow-xs.
   SearchInput is the leading-magnifier variant used above every table. */
export interface InputProps extends Omit<ComponentProps<"input">, "size"> {
  size?: "sm";
  invalid?: boolean;
}

export function Input({ size, invalid, ...rest }: InputProps) {
  return <input data-slot="input" data-size={size} aria-invalid={invalid || undefined} {...rest} />;
}

export function SearchInput({
  placeholder = "Rechercher un membre, un téléphone, un code…",
  className,
  ...rest
}: ComponentProps<"input">) {
  return (
    <div data-slot="search-field" className={className}>
      <Icon name="search" size={15} />
      <input data-slot="input" type="search" placeholder={placeholder} {...rest} />
    </div>
  );
}
