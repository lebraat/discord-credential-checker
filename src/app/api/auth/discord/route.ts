import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Discord OAuth2 is not configured' },
      { status: 500 }
    );
  }

  const scopes = ['identify', 'guilds', 'guilds.members.read', 'connections'];
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scopes.join('%20')}`;

  return NextResponse.redirect(discordAuthUrl);
}
