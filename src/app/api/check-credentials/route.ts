import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import {
  DiscordUser,
  DiscordGuild,
  DiscordGuildMember,
  DiscordConnection,
  CredentialCheckResult,
} from '@/types/discord';

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    // Fetch user information
    const userResponse = await axios.get<DiscordUser>('https://discord.com/api/users/@me', {
      headers,
    });
    const user = userResponse.data;

    // Calculate account age
    const snowflake = BigInt(user.id);
    const timestamp = Number(snowflake >> 22n) + 1420070400000;
    const createdAt = new Date(timestamp);
    const accountAgeDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const accountAgePassed = accountAgeDays > 365;

    // Fetch user's guilds
    const guildsResponse = await axios.get<DiscordGuild[]>('https://discord.com/api/users/@me/guilds', {
      headers,
    });
    const guilds = guildsResponse.data;
    const serverCountPassed = guilds.length >= 10;

    // Check role assignments in each guild
    const roleDetails: Array<{ guildName: string; roleCount: number }> = [];
    let serversWithRoles = 0;

    for (const guild of guilds) {
      try {
        const memberResponse = await axios.get<DiscordGuildMember>(
          `https://discord.com/api/users/@me/guilds/${guild.id}/member`,
          { headers }
        );

        const member = memberResponse.data;
        // Exclude @everyone role (each guild has this by default)
        const roleCount = member.roles.length;

        if (roleCount > 0) {
          serversWithRoles++;
          roleDetails.push({
            guildName: guild.name,
            roleCount: roleCount,
          });
        }
      } catch (error) {
        // If we can't fetch member info for a guild, skip it
        console.error(`Could not fetch member info for guild ${guild.id}:`, error);
      }
    }

    const roleAssignmentsPassed = serversWithRoles >= 3;

    // Fetch verified connections
    const connectionsResponse = await axios.get<DiscordConnection[]>(
      'https://discord.com/api/users/@me/connections',
      { headers }
    );
    const connections = connectionsResponse.data;
    const verifiedConnections = connections.filter((conn) => conn.verified);
    const verifiedConnectionsPassed = verifiedConnections.length >= 2;

    const result: CredentialCheckResult = {
      accountAge: {
        passed: accountAgePassed,
        days: accountAgeDays,
        createdAt: createdAt.toISOString(),
      },
      serverCount: {
        passed: serverCountPassed,
        count: guilds.length,
      },
      roleAssignments: {
        passed: roleAssignmentsPassed,
        serversWithRoles: serversWithRoles,
        details: roleDetails,
      },
      verifiedConnections: {
        passed: verifiedConnectionsPassed,
        count: verifiedConnections.length,
        connections: verifiedConnections.map((conn) => ({
          type: conn.type,
          name: conn.name,
        })),
      },
      overallPassed:
        accountAgePassed && serverCountPassed && roleAssignmentsPassed && verifiedConnectionsPassed,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking credentials:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return NextResponse.json({ error: 'Invalid or expired access token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to check credentials' }, { status: 500 });
  }
}
