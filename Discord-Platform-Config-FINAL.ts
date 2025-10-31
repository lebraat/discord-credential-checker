/**
 * =============================================================================
 * DISCORD PLATFORM CONFIGURATION - ENHANCED STAMP
 * =============================================================================
 *
 * This configuration enables comprehensive Discord participation verification
 * through account age, server membership, role assignments, and verified connections.
 *
 * FILE LOCATION IN PASSPORT REPO:
 * platforms/src/Discord/Providers-config.ts
 *
 * =============================================================================
 * OAUTH SCOPES REQUIRED
 * =============================================================================
 * Update App-Bindings.ts to include these scopes:
 *
 * - identify              : Basic user information (ID, username)
 * - guilds                : Server membership list
 * - guilds.members.read   : Member details and roles in each server
 * - connections           : External account connections (Spotify, YouTube, etc.)
 *
 * Example OAuth URL generation:
 * const scopes = ['identify', 'guilds', 'guilds.members.read', 'connections'];
 * const url = `https://discord.com/api/oauth2/authorize?response_type=code&scope=${scopes.join('%20')}&client_id=${clientId}...`
 *
 * =============================================================================
 * VERIFICATION CRITERIA (All 4 must be met)
 * =============================================================================
 *
 * 1. ACCOUNT AGE: > 365 days
 *    - Extracted from Discord snowflake ID
 *    - Prevents throwaway/fake accounts
 *    - Calculation: snowflake >> 22n + 1420070400000 = timestamp
 *
 * 2. SERVER MEMBERSHIP: >= 10 servers
 *    - Fetched from GET /users/@me/guilds
 *    - Shows active Discord ecosystem participation
 *    - Easy to achieve for genuine users
 *
 * 3. ROLE ASSIGNMENTS: >= 3 servers with roles
 *    - Fetched from GET /users/@me/guilds/:id/member for each guild
 *    - Excludes @everyone role (default role in all servers)
 *    - Proves contribution, not just lurking
 *    - Skip servers that return 403/404 errors
 *
 * 4. VERIFIED CONNECTIONS: >= 2 verified external accounts
 *    - Fetched from GET /users/@me/connections
 *    - Filter for connections where verified === true
 *    - Supported platforms: Spotify, YouTube, Twitter, Twitch, Steam,
 *      Reddit, GitHub, Xbox, PlayStation, Battle.net, Facebook, etc.
 *    - Provides cross-platform identity consistency
 *
 * =============================================================================
 * ERROR MESSAGES (User-Facing)
 * =============================================================================
 * Return specific error messages for each failed criterion:
 *
 * - "Account age is {X} days (requires > 365 days)"
 * - "Member of {X} servers (requires 10 or more)"
 * - "Has roles in {X} servers (requires 3 or more)"
 * - "Has {X} verified connections (requires 2 or more)"
 *
 * =============================================================================
 * CREDENTIAL RECORD DATA
 * =============================================================================
 * Store these fields in the verified credential:
 *
 * {
 *   id: string,                        // Discord user ID (consider hashing)
 *   accountAgeDays: string,            // Age in days
 *   serverCount: string,               // Number of servers
 *   serversWithRoles: string,          // Number of servers with roles
 *   verifiedConnectionCount: string    // Number of verified connections
 * }
 *
 * DO NOT STORE:
 * - Server names or IDs
 * - Specific role names or IDs
 * - Message content or history
 * - Friend lists
 * - Connection account details
 *
 * =============================================================================
 * RATE LIMITING & PERFORMANCE
 * =============================================================================
 * This verification makes multiple API calls:
 * - 1 token exchange
 * - 1 user info fetch
 * - 1 guilds list fetch
 * - N guild member fetches (where N = number of guilds, typically 10-50)
 * - 1 connections fetch
 *
 * Total: ~4-52 API calls per verification
 * Expected verification time: 5-10 seconds
 *
 * Implement:
 * - Exponential backoff for 429 errors
 * - Timeout handling (10 second max)
 * - Graceful error handling for guild member 403/404 errors
 * - Consider limiting concurrent guild member fetches
 *
 */

import { PlatformSpec, PlatformGroupSpec, Provider } from "../types.js";
import { DiscordProvider } from "./Providers/discord.js";

/**
 * Platform-level configuration for Discord Stamp
 * Displayed in the Passport UI when users browse available stamps
 */
export const PlatformDetails: PlatformSpec = {
  icon: "./assets/discordStampIcon.svg",
  platform: "Discord",
  name: "Discord",
  description: "Verify Discord account activity and engagement",
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

/**
 * Provider instance
 * The DiscordProvider class must implement the enhanced verification logic
 * See implementation notes in header comments
 */
export const providers: Provider[] = [new DiscordProvider()];

/**
 * =============================================================================
 * IMPLEMENTATION CHECKLIST
 * =============================================================================
 *
 * [ ] Update App-Bindings.ts with new OAuth scopes
 * [ ] Update discord.ts provider with 4-step verification logic
 * [ ] Add TypeScript interfaces for Discord API responses
 * [ ] Implement rate limiting and error handling
 * [ ] Add unit tests for each verification criterion
 * [ ] Test with accounts that meet/fail each criterion
 * [ ] Update Discord Developer Portal OAuth scopes
 * [ ] Update support documentation with new requirements
 * [ ] Deploy to staging and test end-to-end flow
 * [ ] Monitor verification success rates in production
 *
 * =============================================================================
 * ADDITIONAL RESOURCES
 * =============================================================================
 *
 * Discord API Documentation:
 * - Users: https://discord.com/developers/docs/resources/user
 * - Guilds: https://discord.com/developers/docs/resources/guild
 * - OAuth2: https://discord.com/developers/docs/topics/oauth2
 *
 * Snowflake ID Format:
 * - https://discord.com/developers/docs/reference#snowflakes
 * - Timestamp = (snowflake >> 22) + 1420070400000
 *
 * Rate Limits:
 * - https://discord.com/developers/docs/topics/rate-limits
 * - Global: 50 requests/second per user
 * - Handle 429 responses with retry-after header
 *
 * =============================================================================
 */
