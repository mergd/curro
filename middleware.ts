import {
  convexAuthNextjsMiddleware,
  ConvexAuthNextjsMiddlewareContext,
} from "@convex-dev/auth/nextjs/server";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/admin"];

export default convexAuthNextjsMiddleware(
  (
    request: NextRequest,
    ctx: {
      event: NextFetchEvent;
      convexAuth: ConvexAuthNextjsMiddlewareContext;
    },
  ) => {
    const { isAuthenticated } = ctx.convexAuth;
    if (
      !isAuthenticated &&
      PROTECTED_PATHS.some((path) => request.nextUrl.pathname.startsWith(path))
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  },
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
