# Discord Passport Stamp Update Guide

## Overview

This guide outlines the changes needed to update the Discord Passport stamp from a simple account ownership verification to a comprehensive credential check that validates meaningful Discord participation.

## Current vs. New Requirements

### Current Implementation
- **Single Check**: Discord account ownership via OAuth
- **OAuth Scope**: `identify` (basic user info only)
- **Verification**: Confirms user has a Discord account
- **Data Collected**: Discord user ID only

### New Implementation
- **Four Comprehensive Checks**:
  1. Account age > 365 days
  2. Member of 10+ servers
  3. Has role assignments in 3+ servers (shows actual participation)
  4. Has 2+ verified external connections (Spotify, YouTube, Twitter, etc.)
- **OAuth Scopes**: `identify`, `guilds`, `guilds.members.read`, `connections`
- **Verification**: Multi-factor validation of Discord activity and engagement
- **Data Collected**: Account creation date, server list, role assignments, verified connections

## Changes Required

### 1. OAuth Scope Updates

**File**: `/Users/lebraat/Documents/GitHub/passport/platforms/src/Discord/App-Bindings.ts`

**Current**:
```typescript
async getOAuthUrl(state: string): Promise<string> {
  return `https://discord.com/api/oauth2/authorize?response_type=code&scope=identify&client_id=${this.clientId}&state=${state}&redirect_uri=${this.redirectUri}`;
}
```

**Updated**:
```typescript
async getOAuthUrl(state: string): Promise<string> {
  const scopes = ['identify', 'guilds', 'guilds.members.read', 'connections'];
  return `https://discord.com/api/oauth2/authorize?response_type=code&scope=${scopes.join('%20')}&client_id=${this.clientId}&state=${state}&redirect_uri=${this.redirectUri}`;
}
```

**Rationale**: New scopes are required to access:
- `guilds` - User's server membership list
- `guilds.members.read` - User's member details in each server (for role checks)
- `connections` - User's verified external account connections

### 2. Provider Verification Logic

**File**: `/Users/lebraat/Documents/GitHub/passport/platforms/src/Discord/Providers/discord.ts`

**Current Implementation**: Simple OAuth verification that only checks account ownership.

**New Implementation**: Add comprehensive credential checks:

```typescript
import { ProviderExternalVerificationError } from "../../types";

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

export interface DiscordGuildMember {
  user?: DiscordUser;
  nick?: string;
  avatar?: string;
  roles: string[];
  joined_at: string;
  premium_since?: string | null;
  deaf: boolean;
  mute: boolean;
  flags: number;
  pending?: boolean;
  permissions?: string;
}

export interface DiscordConnection {
  type: string;
  id: string;
  name: string;
  verified: boolean;
  friend_sync: boolean;
  show_activity: boolean;
  visibility: number;
}

export class DiscordProvider implements Provider {
  type = "Discord";

  async verify(payload: RequestPayload, context: ProviderContext): Promise<VerifiedPayload> {
    const errors: string[] = [];
    let valid = false;
    let record: Record<string, string> = {};

    try {
      const { code } = payload.proofs;

      // Exchange authorization code for access token
      const tokenRequest = await axios.post(
        `https://discord.com/api/oauth2/token`,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: this.redirectUri,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (tokenRequest.status !== 200) {
        throw new ProviderExternalVerificationError("Error getting access token from Discord");
      }

      const { access_token } = tokenRequest.data;
      const headers = { Authorization: `Bearer ${access_token}` };

      // Fetch user information
      const userResponse = await axios.get<DiscordUser>(
        "https://discord.com/api/users/@me",
        { headers }
      );

      if (userResponse.status !== 200) {
        throw new ProviderExternalVerificationError("Error fetching user info from Discord");
      }

      const user = userResponse.data;

      // Check 1: Account Age (> 365 days)
      const snowflake = BigInt(user.id);
      const timestamp = Number(snowflake >> 22n) + 1420070400000;
      const createdAt = new Date(timestamp);
      const accountAgeDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      if (accountAgeDays <= 365) {
        errors.push(`Account age is ${accountAgeDays} days (requires > 365 days)`);
      }

      // Check 2: Server Membership (>= 10 servers)
      const guildsResponse = await axios.get<DiscordGuild[]>(
        "https://discord.com/api/users/@me/guilds",
        { headers }
      );

      if (guildsResponse.status !== 200) {
        throw new ProviderExternalVerificationError("Error fetching guilds from Discord");
      }

      const guilds = guildsResponse.data;

      if (guilds.length < 10) {
        errors.push(`Member of ${guilds.length} servers (requires 10 or more)`);
      }

      // Check 3: Role Assignments (>= 3 servers with roles)
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
          }
        } catch (error) {
          // If we can't fetch member info for a guild, skip it
          // This can happen if the user left the server between fetching guilds and checking members
          continue;
        }
      }

      if (serversWithRoles < 3) {
        errors.push(`Has roles in ${serversWithRoles} servers (requires 3 or more)`);
      }

      // Check 4: Verified External Connections (>= 2)
      const connectionsResponse = await axios.get<DiscordConnection[]>(
        "https://discord.com/api/users/@me/connections",
        { headers }
      );

      if (connectionsResponse.status !== 200) {
        throw new ProviderExternalVerificationError("Error fetching connections from Discord");
      }

      const connections = connectionsResponse.data;
      const verifiedConnections = connections.filter((conn) => conn.verified);

      if (verifiedConnections.length < 2) {
        errors.push(`Has ${verifiedConnections.length} verified connections (requires 2 or more)`);
      }

      // Overall validation
      if (errors.length === 0) {
        valid = true;
        record = {
          id: user.id,
          accountAgeDays: accountAgeDays.toString(),
          serverCount: guilds.length.toString(),
          serversWithRoles: serversWithRoles.toString(),
          verifiedConnectionCount: verifiedConnections.length.toString(),
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ProviderExternalVerificationError(`Discord API error: ${error.message}`);
      }
      throw error;
    }

    return {
      valid,
      errors,
      record,
    };
  }
}
```

**Key Changes**:
- Extracts account creation date from Discord snowflake ID
- Fetches user's guild (server) list
- Iterates through guilds to check role assignments
- Fetches verified external connections
- Returns detailed validation errors if any check fails
- Stores additional metadata in the credential record

### 3. Provider Configuration Updates

**File**: `/Users/lebraat/Documents/GitHub/passport/platforms/src/Discord/Providers-config.ts`

**Current**:
```typescript
export const PlatformDetails: PlatformSpec = {
  icon: "./assets/discordStampIcon.svg",
  platform: "Discord",
  name: "Discord",
  description: "Verify that you own a Discord account",
  connectMessage: "Connect Account",
  website: "https://discord.com/",
  timeToGet: "1-2 minutes",
  price: "Free",
};

export const ProviderConfig: PlatformGroupSpec[] = [
  {
    platformGroup: "Account Verification",
    providers: [
      {
        title: "Verify Discord Account Ownership",
        description: "Connect and verify ownership of your Discord account",
        name: "Discord",
      },
    ],
  },
];
```

**Updated**:
```typescript
export const PlatformDetails: PlatformSpec = {
  icon: "./assets/discordStampIcon.svg",
  platform: "Discord",
  name: "Discord",
  description: "Verify Discord account activity and engagement through account age, server participation, role assignments, and verified connections",
  connectMessage: "Connect Account",
  website: "https://discord.com/",
  timeToGet: "2-3 minutes",
  price: "Free",
  guide: [
    {
      type: "list",
      title: "Stamp Requirements",
      items: [
        "Your Discord account must be older than 365 days",
        "You must be a member of at least 10 servers",
        "You must have role assignments in at least 3 servers (excluding the default @everyone role)",
        "You must have at least 2 verified external connections (such as Spotify, YouTube, Twitter, Twitch, etc.)",
        "All four requirements must be met to successfully verify the stamp",
      ],
    },
  ],
};

export const ProviderConfig: PlatformGroupSpec[] = [
  {
    platformGroup: "Account Activity & Engagement",
    providers: [
      {
        title: "Verify Active Discord Participation",
        description: "Connect and verify Discord roles, memberships, and activity",
        name: "Discord",
      },
    ],
  },
];
```

**Key Changes**:
- Updated platform description to reflect new verification criteria
- Added `guide` property with "Stamp Requirements" list detailing all verification criteria
- Changed platformGroup from "Account Verification" to "Account Activity & Engagement"
- Updated provider title and description to emphasize active participation
- Increased estimated time from "1-2 minutes" to "2-3 minutes" (more API calls)

### 4. Type Definitions

**File**: Create `/Users/lebraat/Documents/GitHub/passport/platforms/src/Discord/types.ts`

```typescript
export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

export interface DiscordGuildMember {
  user?: DiscordUser;
  nick?: string;
  avatar?: string;
  roles: string[];
  joined_at: string;
  premium_since?: string | null;
  deaf: boolean;
  mute: boolean;
  flags: number;
  pending?: boolean;
  permissions?: string;
}

export interface DiscordConnection {
  type: string;
  id: string;
  name: string;
  verified: boolean;
  friend_sync: boolean;
  show_activity: boolean;
  visibility: number;
}
```

### 5. Test Updates

**File**: `/Users/lebraat/Documents/GitHub/passport/platforms/src/Discord/__tests__/discord.test.ts`

Add new test cases to cover:

```typescript
describe("Discord Provider - Enhanced Verification", () => {
  it("should return valid payload when all criteria are met", async () => {
    // Mock responses for user with:
    // - Account age > 365 days
    // - 10+ servers
    // - Roles in 3+ servers
    // - 2+ verified connections
  });

  it("should fail when account age is less than 365 days", async () => {
    // Mock user created less than 365 days ago
  });

  it("should fail when user is in fewer than 10 servers", async () => {
    // Mock guilds response with < 10 servers
  });

  it("should fail when user has roles in fewer than 3 servers", async () => {
    // Mock member responses with insufficient role assignments
  });

  it("should fail when user has fewer than 2 verified connections", async () => {
    // Mock connections with < 2 verified
  });

  it("should handle guild member fetch errors gracefully", async () => {
    // Mock scenario where some guild member fetches fail (403/404)
  });

  it("should return multiple errors when multiple criteria fail", async () => {
    // Mock user failing multiple checks
  });
});
```

### 6. Discord Developer Portal Configuration

**Required Updates**:

1. **OAuth2 Scopes** - In your Discord Application settings, ensure these scopes are enabled:
   - `identify`
   - `guilds`
   - `guilds.members.read`
   - `connections`

2. **Redirect URLs** - No changes needed (same callback URLs work)

3. **Bot Permissions** - Not required (using OAuth2 user permissions, not bot)

### 7. Environment Variables

**No changes required** - Same environment variables work:

**Backend**:
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_CALLBACK`

**Frontend**:
- `NEXT_PUBLIC_PASSPORT_DISCORD_CLIENT_ID`
- `NEXT_PUBLIC_PASSPORT_DISCORD_CALLBACK`

### 8. API Rate Limiting Considerations

The new implementation makes multiple API calls per verification:

1. Token exchange (1 call)
2. User info (1 call)
3. Guilds list (1 call)
4. Guild member info (N calls, where N = number of guilds)
5. Connections list (1 call)

**Discord Rate Limits**:
- Standard rate limit: 50 requests per second (per user)
- Guild member endpoint: May have stricter limits

**Recommendations**:
- Implement exponential backoff for 429 (rate limit) errors
- Consider caching guild member responses temporarily
- Add timeout handling for slow responses
- Limit concurrent guild member fetches (e.g., max 10 concurrent)

**Example Rate Limit Handling**:
```typescript
const fetchWithRetry = async (url: string, headers: any, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { headers });
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '1', 10);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};
```

### 9. Privacy & Security Considerations

**Data Minimization**:
- Store only aggregate counts, not detailed server/role information
- Don't store server names or role IDs in the credential
- Hash user IDs before storing in verifiable credentials

**User Consent**:
- Update OAuth consent screen to clearly explain what data is being accessed
- Provide documentation on why each permission is needed

**Data Retention**:
- Don't cache Discord API responses longer than necessary
- Clear access tokens after verification completes

### 10. User Experience Updates

**Frontend Changes Needed**:

**Loading States**:
- Display progress indicator during multi-step verification
- Show which checks are being performed
- Estimated time: 5-10 seconds (vs. 1-2 seconds for old version)

**Error Messaging**:
- Show specific failures to help users understand requirements:
  - "Your Discord account is X days old. Accounts must be older than 365 days."
  - "You're a member of X servers. You need to join at least 10 servers."
  - "You have roles in X servers. You need roles in at least 3 servers."
  - "You have X verified connections. You need at least 2 verified connections."

**Helpful Guidance**:
- Link to Discord guide on joining servers
- Link to Discord guide on connecting external accounts
- Explain how to get roles in servers (participate in community)

### 11. Migration Strategy

**For Existing Discord Stamp Holders**:

**Option A: Grandfather Existing Stamps**
- Keep existing simple Discord stamps valid
- Create new "Discord Verified Active" stamp with higher weight
- Allow users to upgrade voluntarily

**Option B: Require Re-verification**
- Expire all existing Discord stamps on a certain date
- Require users to re-verify under new criteria
- Provide advance notice (30-60 days)

**Recommendation**: Option A (grandfathering) to avoid user frustration and churn.

### 12. Scoring & Weight Updates

**Current Weight**: [To be determined by data services team]

**Recommended New Weight**: Higher than current, to reflect:
- Greater verification rigor
- Proof of active community participation
- Longer-term account commitment (>365 days)
- Multi-platform identity verification (via connections)

**Suggested Multiplier**: 2-3x current weight

### 13. Documentation Updates

**Files to Update**:

1. **Support Article**: `https://support.passport.xyz/passport-knowledge-base/stamps/how-do-i-add-passport-stamps/connecting-a-discord-account-to-passport`
   - Update screenshots
   - Add new requirements explanation
   - Add FAQ section for common issues

2. **Developer Docs**: Add section explaining:
   - Why Discord stamp now requires more permissions
   - What data is collected and why
   - Privacy guarantees

3. **Changelog**: Document breaking changes and migration path

### 14. Deployment Checklist

- [ ] Update Discord OAuth application with new scopes
- [ ] Deploy backend provider changes to staging
- [ ] Deploy frontend OAuth scope changes to staging
- [ ] Test full verification flow in staging
- [ ] Test error scenarios (insufficient servers, no roles, etc.)
- [ ] Update documentation
- [ ] Deploy to production
- [ ] Monitor error rates and success rates
- [ ] Collect user feedback

### 15. Monitoring & Analytics

**Metrics to Track**:
- Verification success rate (before vs. after)
- Failure breakdown by criterion:
  - % failing account age check
  - % failing server count check
  - % failing role assignment check
  - % failing verified connections check
- Average verification time
- API error rates (Discord API failures)
- Rate limit hits

**Success Criteria**:
- >60% success rate (indicating realistic requirements)
- <10 second average verification time
- <1% API error rate
- <5% user dropoff during OAuth flow

## Summary

This update transforms Discord from a simple identity verification to a comprehensive engagement validation. The changes affect:

1. **OAuth Scopes**: 4 scopes instead of 1
2. **Verification Logic**: 4 separate checks instead of basic ownership
3. **API Calls**: 4-20+ calls instead of 2
4. **Verification Time**: 5-10 seconds instead of 1-2 seconds
5. **Success Rate**: Expected to decrease (more stringent requirements)
6. **Stamp Value**: Should increase significantly to reflect greater rigor

The implementation follows Discord's API best practices and provides clear error messaging to help users meet the requirements.
