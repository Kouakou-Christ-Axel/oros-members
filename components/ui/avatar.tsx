import type { ComponentProps } from "react";

/* Avatar — shadcn/ui avatar.tsx. Circular, 32px default.
   Member photos on the fiche use MemberPhoto (rectangular) instead. */
export interface AvatarProps extends ComponentProps<"span"> {
  src?: string;
  alt?: string;
  initials?: string;
  size?: number;
}

export function Avatar({ src, alt, initials, size = 32, style, ...rest }: AvatarProps) {
  return (
    <span data-slot="avatar" style={{ width: size, height: size, ...style }} {...rest}>
      {src ? (
        // ponytail: plain <img>, not next/image — avatar is a small fixed-size
        // circle with no responsive/remote-loader needs; upgrade if photos end
        // up served from an external CDN with real optimization to gain from.
        // eslint-disable-next-line @next/next/no-img-element
        <img data-slot="avatar-image" src={src} alt={alt || ""} />
      ) : (
        <span data-slot="avatar-fallback" style={{ fontSize: Math.max(10, Math.round(size * 0.36)) }}>
          {initials}
        </span>
      )}
    </span>
  );
}
