import { NextRequest, NextResponse } from 'next/server';
import { saveSession } from '@/lib/session';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error || !code) {
          return NextResponse.redirect(new URL('/onboarding?error=auth_failed', request.url));
        }

    try {
          const tokenResponse = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: new URLSearchParams({
                            grant_type: 'authorization_code',
                            code,
                            client_id: process.env.WHOOP_CLIENT_ID!,
                            client_secret: process.env.WHOOP_CLIENT_SECRET!,
                            redirect_uri: process.env.WHOOP_REDIRECT_URI!,
                          }),
                });

          if (!tokenResponse.ok) {
                  throw new Error('Token exchange failed');
                }

          const tokens = await tokenResponse.json();

          await saveSession({
                  accessToken: tokens.access_token,
                  refreshToken: tokens.refresh_token,
                  expiresAt: Date.now() + tokens.expires_in * 1000,
                });

          return NextResponse.redirect(new URL('/brief', request.url));
        } catch (err) {
          console.error('Auth callback error:', err);
          return NextResponse.redirect(new URL('/onboarding?error=token_failed', request.url));
        }
  }
