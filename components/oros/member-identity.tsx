import type { ComponentProps, ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

/* MemberIdentity — photo + name + code, the left-most cell of every
   member row and the header of the fiche. Code is monospaced so a column
   of them aligns and can be read aloud over the phone. */
export interface MemberIdentityProps extends ComponentProps<"div"> {
  name: ReactNode;
  code?: ReactNode;
  photo?: string;
  meta?: ReactNode;
  size?: number;
}

export function MemberIdentity({ name, code, photo, meta, size = 32, ...rest }: MemberIdentityProps) {
  return (
    <div data-slot="member-identity" {...rest}>
      <MemberPhoto src={photo} alt={typeof name === "string" ? name : undefined} width={size} height={size} radius="var(--radius-full)" />
      <div style={{ minWidth: 0 }}>
        <div data-slot="member-name">{name}</div>
        {code || meta ? (
          <div data-slot="member-meta">
            {code}
            {code && meta ? " · " : ""}
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* MemberPhoto — the ID photo. Rectangular by default (it is printed on the
   fiche at 35x45mm, passport ratio); pass radius for the round list avatar. */
export interface MemberPhotoProps extends ComponentProps<"div"> {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  radius?: string;
  hint?: string;
}

export function MemberPhoto({ src, alt, width = 96, height = 120, radius, hint = "Photo", ...rest }: MemberPhotoProps) {
  const style = { width, height, borderRadius: radius };
  if (!src) {
    return (
      <div data-slot="member-photo-empty" style={style} {...rest}>
        <Icon name="user-round" size={20} />
        {height >= 64 ? <span>{hint}</span> : null}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- ponytail: fixed-size ID photo, no responsive/remote-loader needs yet.
    <img data-slot="member-photo" src={src} alt={alt || ""} style={style} />
  );
}
