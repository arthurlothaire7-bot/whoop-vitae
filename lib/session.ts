import { cookies } from 'next/headers';

const SESSION_COOKIE = 'whoop_session';

export interface Session {
  accessToken: string;
    refreshToken: string;
      expiresAt: number;
      }

      export async function getSession(): Promise<Session | null> {
        const cookieStore = cookies();
          const sessionCookie = cookieStore.get(SESSION_COOKIE);

            if (!sessionCookie?.value) {
                return null;
                  }

                    try {
                        const session: Session = JSON.parse(
                              Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
                                  );

                                      if (Date.now() >= session.expiresAt) {
                                            return null;
                                                }

                                                    return session;
                                                      } catch {
                                                          return null;
                                                            }
                                                            }

                                                            export async function saveSession(session: Session): Promise<void> {
                                                              const cookieStore = cookies();
                                                                const encoded = Buffer.from(JSON.stringify(session)).toString('base64');

                                                                  cookieStore.set(SESSION_COOKIE, encoded, {
                                                                      httpOnly: true,
                                                                          secure: process.env.NODE_ENV === 'production',
                                                                              sameSite: 'lax',
                                                                                  maxAge: 60 * 60 * 24 * 30,
                                                                                      path: '/',
                                                                                        });
                                                                                        }

                                                                                        export async function clearSession(): Promise<void> {
                                                                                          const cookieStore = cookies();
                                                                                            cookieStore.delete(SESSION_COOKIE);
                                                                                            }
