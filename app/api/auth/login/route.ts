import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.WHOOP_CLIENT_ID!;
    const redirectUri = process.env.WHOOP_REDIRECT_URI!;

    const scope = [
          'read:recovery',
          'read:cycles',
          'read:sleep',
          'read:workout',
          'read:profile',
          'read:body_measurement',
        ].join(' ');

    const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope,
          state: crypto.randomUUID(),
        });

    const authUrl = `https://api.prod.whoop.com/oauth/oauth2/auth?${params.toString()}`;

    return NextResponse.redirect(authUrl);
  }
