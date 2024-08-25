import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "./lib/auth/actions/get-auth";
import { appRoute, signinRoute } from "./lib/const";

export const middleware = async (request: NextRequest) => {
  const protectedRoutes = [appRoute];
  const publicRoutes = [signinRoute];

  const pathname = request.nextUrl.pathname;

  const auth = await getAuth();

  if (!auth && protectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL(signinRoute, request.url));
  }

  if (auth && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL(appRoute, request.url));
  }

  return NextResponse.next();
};
