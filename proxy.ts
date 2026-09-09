import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/* proxy.ts — anciennement "middleware.ts" (renommé en Next.js 16, voir
   CLAUDE.md > Conventions Next.js). Vérification OPTIMISTE uniquement
   (cookie présent ou non, pas de requête DB) : sert à rediriger vite les
   visiteurs non connectés. La vraie vérification (session valide, rôle)
   se fait dans lib/auth/dal.ts, appelé par chaque page/Server Action
   protégée — ne jamais considérer ce fichier comme la barrière de
   sécurité réelle. */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)",
  ],
};
