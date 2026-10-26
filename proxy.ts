import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getJwks } from "./app/lib/jwks-cache";

const PROTECTED_ROUTES = ["/", "/inventory", "/orders"];

function isProtectedPath(path: string) {
  return PROTECTED_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Handle confirmation links that still use the Supabase dashboard's
  // configured site URL instead of the callback URL used by new sign-ups.
  if (path !== "/auth/callback" && request.nextUrl.searchParams.has("code")) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/auth/callback";
    callbackUrl.searchParams.set("next", path);
    return NextResponse.redirect(callbackUrl);
  }

  if (!isProtectedPath(path)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // getClaims() verifies the JWT against Supabase's signing keys, so the user
  // is trusted even though the session arrives via a cookie.
  const jwks = await getJwks();
  const { data } = await supabase.auth.getClaims(undefined, jwks.keys.length ? { jwks } : undefined);

  if (!data?.claims?.sub) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/signin";
    signInUrl.searchParams.set("next", path);
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
