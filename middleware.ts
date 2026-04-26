import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/brief'];

// Routes accessible only when NOT authenticated
const AUTH_ROUTES = ['/onboarding'];

function getSessionFromCookie(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get('whoop_session');
    if (!sessionCookie?.value) return false;

      try {
          const session = JSON.parse(
                Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
                    );
                        return session?.accessToken && Date.now() < session.expiresAt;
                          } catch {
                              return false;
                                }
                                }

                                export function middleware(request: NextRequest) {
                                  const { pathname } = request.nextUrl;
                                    const isAuthenticated = getSessionFromCookie(request);

                                      // Redirect unauthenticated users away from protected routes
                                        const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
                                          if (isProtected && !isAuthenticated) {
                                              return NextResponse.redirect(new URL('/onboarding', request.url));
                                                }

                                                  // Redirect authenticated users away from auth routes
                                                    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
                                                      if (isAuthRoute && isAuthenticated) {
                                                          return NextResponse.redirect(new URL('/brief', request.url));
                                                            }

                                                              return NextResponse.next();
                                                              }

                                                              export const config = {
                                                                matcher: [
                                                                    /*
                                                                         * Match all request paths except:
                                                                              * - _next/static (static files)
                                                                                   * - _next/image (image optimization)
                                                                                        * - favicon.ico
                                                                                             * - /api/auth/* (auth routes must always be accessible)
                                                                                                  */
                                                                                                      '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
                                                                                                        ],
                                                                                                        };
