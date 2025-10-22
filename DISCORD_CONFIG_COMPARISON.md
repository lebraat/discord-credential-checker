# Discord Stamp Configuration - Before & After Comparison

This document shows the exact changes to the Discord stamp configuration in the Passport app.

## File: `platforms/src/Discord/Providers-config.ts`

### BEFORE (Current Implementation)

```typescript
import { PlatformSpec, PlatformGroupSpec, Provider } from "../types.js";
import { DiscordProvider } from "./Providers/discord.js";

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

export const providers: Provider[] = [new DiscordProvider()];
```

### AFTER (Enhanced Implementation)

```typescript
import { PlatformSpec, PlatformGroupSpec, Provider } from "../types.js";
import { DiscordProvider } from "./Providers/discord.js";

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

export const providers: Provider[] = [new DiscordProvider()];
```

---

## Change Summary

### PlatformDetails Changes

| Field | Before | After | Rationale |
|-------|--------|-------|-----------|
| `description` | "Verify that you own a Discord account" | "Verify Discord account activity and engagement through account age, server participation, role assignments, and verified connections" | Reflects comprehensive verification criteria |
| `timeToGet` | "1-2 minutes" | "2-3 minutes" | More API calls = longer verification time |
| `guide` | Not present | Added "Stamp Requirements" list with 5 items detailing all verification criteria | Provides clear upfront explanation of requirements to users |

### ProviderConfig Changes

| Field | Before | After | Rationale |
|-------|--------|-------|-----------|
| `platformGroup` | "Account Verification" | "Account Activity & Engagement" | Better categorization for engagement-based stamp |
| `title` | "Verify Discord Account Ownership" | "Verify Active Discord Participation" | Emphasizes participation vs. simple ownership |
| `description` | "Connect and verify ownership of your Discord account" | "Connect and verify Discord roles, memberships, and activity" | Clear about what's being verified |

---

## User-Facing Text Updates

### Stamp Card (UI) - Before

**Title**: Discord
**Description**: Verify that you own a Discord account
**Category**: Account Verification
**Time**: 1-2 minutes

### Stamp Card (UI) - After

**Title**: Discord
**Description**: Verify Discord account activity and engagement through account age, server participation, role assignments, and verified connections
**Category**: Account Activity & Engagement
**Time**: 2-3 minutes

### Stamp Requirements Section (New)

Users will now see a "Stamp Requirements" section when viewing the Discord stamp details:

**Stamp Requirements**
- Your Discord account must be older than 365 days
- You must be a member of at least 10 servers
- You must have role assignments in at least 3 servers (excluding the default @everyone role)
- You must have at least 2 verified external connections (such as Spotify, YouTube, Twitter, Twitch, etc.)
- All four requirements must be met to successfully verify the stamp

---

## Error Messages (User-Facing)

When verification fails, users will see specific error messages:

### Account Age Failure
```
❌ Your Discord account is 287 days old. Accounts must be older than 365 days to qualify.
```

### Server Membership Failure
```
❌ You're a member of 8 servers. You need to join at least 10 servers to qualify.
```

### Role Assignment Failure
```
❌ You have roles in 2 servers. You need roles in at least 3 servers to qualify.

💡 Tip: Actively participate in Discord communities to earn roles. Many servers give roles for:
• Verified members
• Active contributors
• Event participants
```

### Verified Connections Failure
```
❌ You have 1 verified connection. You need at least 2 verified connections to qualify.

💡 Tip: Go to Discord Settings → Connections → Connect accounts like Spotify, YouTube, Twitter, etc., and click "Verify" after connecting.
```

### Multiple Failures Example
```
❌ Your Discord account doesn't meet all requirements yet:

• Account age: 287 days (needs >365 days)
• Server membership: ✓ 12 servers
• Role assignments: 2 servers with roles (needs 3+)
• Verified connections: ✓ 3 verified connections

You're close! Your account needs to be 78 more days old and you need roles in 1 more server.
```

---

## Help Text & Tooltips

### "What is this stamp?" Tooltip

**Before**:
> This stamp verifies that you own a Discord account.

**After**:
> This stamp verifies meaningful Discord participation through account age, active server membership, community roles, and verified cross-platform identity. It requires:
> - Account age > 365 days
> - Member of 10+ servers
> - Roles in 3+ servers
> - 2+ verified external connections

### "How do I qualify?" Help Section

**Account Age**
- **What it is**: Your Discord account must be at least 1 year old
- **Why it matters**: Demonstrates commitment to the platform and reduces throwaway accounts
- **How to check**: User Settings → My Account → Shows account creation date
- **Can't meet it yet?**: Wait until your account reaches 365 days

**Server Membership**
- **What it is**: You must be a member of at least 10 Discord servers
- **Why it matters**: Shows active participation across the Discord ecosystem
- **How to achieve**: Search for and join public servers related to your interests
- **Tips**: Look for communities in gaming, crypto, tech, art, etc.

**Role Assignments**
- **What it is**: You must have roles in at least 3 different servers
- **Why it matters**: Roles indicate actual participation and contribution (not just lurking)
- **How to achieve**:
  - Participate actively in server discussions
  - Complete verification processes (many servers give verified member roles)
  - Contribute content (some servers give contributor/creator roles)
  - Attend events (event participant roles)
  - Support communities (supporter/donor roles)
- **Note**: The @everyone role doesn't count

**Verified External Connections**
- **What it is**: You must have at least 2 verified accounts connected to Discord
- **Why it matters**: Proves consistent cross-platform identity
- **How to achieve**:
  1. Open Discord → User Settings → Connections
  2. Click platforms to connect (Spotify, YouTube, Twitter, Twitch, etc.)
  3. Authorize each connection
  4. Click "Verify" button after connecting
  5. Look for green checkmark
- **Available platforms**: Spotify, YouTube, Twitter, Twitch, Steam, Reddit, GitHub, Xbox, PlayStation, Battle.net, Facebook, and more

---

## FAQ Content

### Q: Why does this stamp require more permissions than before?

**A**: The enhanced Discord stamp now verifies active participation, not just account ownership. To check server membership, roles, and connections, we need additional permissions:
- `guilds` - To see which servers you're in
- `guilds.members.read` - To check your roles in each server
- `connections` - To verify your external account connections

All data is used only for verification and is not stored beyond what's needed for the credential.

### Q: What data does Passport collect?

**We collect**:
- Discord user ID (anonymized in the credential)
- Account creation date (stored as "days old")
- Number of servers you're in
- Number of servers where you have roles
- Number of verified connections

**We DO NOT collect**:
- Server names or IDs
- Specific role names
- Message content or history
- Friend lists
- Connection account details

### Q: Can I check if I'll qualify before connecting?

**A**: Yes! Before attempting verification:

1. **Check account age**: Settings → My Account (calculate if >365 days old)
2. **Count servers**: Look at your server list (need 10+)
3. **Check roles**: In each server, right-click your name → View Profile → Roles (need roles in 3+ servers)
4. **Count verified connections**: Settings → Connections → Count green checkmarks (need 2+)

### Q: I failed verification. What now?

**A**: The error message will tell you exactly what's missing. Common solutions:

- **Account too new**: Wait until your account is 365+ days old
- **Not enough servers**: Join more public Discord communities
- **Not enough roles**: Participate more actively to earn roles
- **Not enough connections**: Connect and verify more external accounts

You can retry verification at any time after meeting the requirements.

### Q: How long does verification take?

**A**: The enhanced verification takes 5-10 seconds (vs. 1-2 seconds for the old version) because we're checking multiple criteria across multiple servers. Please wait for the process to complete.

### Q: What if some servers don't let you check my member info?

**A**: Some private servers restrict API access. If we can't check your roles in a server, we skip it and move to the next one. As long as you have roles in 3+ accessible servers, you'll qualify.

### Q: Why are the requirements so specific (365 days, 10 servers, 3 roles, 2 connections)?

**A**: These thresholds are designed to identify genuinely active Discord users while remaining achievable for legitimate participants. They balance:
- **Authenticity** (365 days prevents fake accounts)
- **Engagement** (10+ servers shows you use Discord regularly)
- **Participation** (3+ roles proves you contribute, not just lurk)
- **Identity** (2+ connections confirms consistent cross-platform presence)

### Q: Will the requirements change?

**A**: The thresholds may be adjusted based on data and community feedback. Any changes will be announced in advance.

---

## Marketing/Announcement Copy

### Short Announcement (Twitter/Social)

> 🎮 Discord stamp just got an upgrade!
>
> Now verifies:
> ✅ Account age (>365d)
> ✅ Server participation (10+)
> ✅ Active roles (3+ servers)
> ✅ Verified connections (2+)
>
> A stamp that proves you're truly active in Discord communities.

### Medium Announcement (Blog Intro)

**Enhanced Discord Stamp: From Ownership to Engagement**

We're upgrading the Discord stamp to better reflect meaningful community participation. The new stamp goes beyond simple account ownership to verify account longevity, active server membership, community role assignments, and verified cross-platform identity.

**What's Changing:**
- Old: Simple account ownership verification
- New: Comprehensive engagement validation with four distinct criteria

**What This Means for Users:**
- Higher stamp value for Discord participants
- More permissions required (to check servers, roles, connections)
- Slightly longer verification (2-3 min vs. 1-2 min)
- Clear feedback when requirements aren't met

**What This Means for Projects:**
- Discord stamps now signal actual community participation
- Better filtering for active vs. passive Discord users
- More reliable indicator of platform engagement

### Long Announcement (Full Blog Post)

**The Case for Enhanced Discord Verification**

Simple account ownership stamps have become easy to farm. Anyone can create a Discord account in seconds, making the old Discord stamp a weak signal of identity or participation.

**The New Standard: Activity Over Ownership**

Our enhanced Discord stamp validates four key signals:

1. **Time Commitment** (365+ day account age)
   - Prevents throwaway accounts
   - Demonstrates long-term platform commitment
   - Calculated from Discord's snowflake ID timestamp

2. **Ecosystem Engagement** (10+ server memberships)
   - Shows you actually use Discord
   - Indicates participation across multiple communities
   - Easy to achieve for genuine users

3. **Community Participation** (roles in 3+ servers)
   - Roles are earned through contribution
   - Proves you're not just lurking
   - Validates actual community involvement

4. **Identity Consistency** (2+ verified external connections)
   - Cross-platform verification
   - Reduces likelihood of fraudulent accounts
   - Easy to achieve (connect Spotify, YouTube, etc.)

**Implementation Details**

The new verification:
- Requires additional OAuth scopes (guilds, guilds.members.read, connections)
- Takes 5-10 seconds (checking multiple criteria)
- Provides specific feedback on failed requirements
- Respects privacy (stores only aggregate counts, not detailed data)

**Migration Plan**

Existing Discord stamp holders can choose to upgrade voluntarily. The enhanced stamp will carry significantly higher weight to reflect its greater verification rigor.

**Why This Matters**

For communities and projects using Passport, Discord stamps will now be a reliable signal of engaged, active Discord users rather than just account owners. This helps with:
- Airdrop eligibility (target active community members)
- Governance participation (identify engaged voters)
- Community access (verify real participants)
- Sybil resistance (higher barrier to gaming the system)

---

This enhanced Discord stamp represents our commitment to meaningful identity verification that goes beyond surface-level checks.

---

## Developer Communication

### Internal Announcement

**Discord Stamp Enhancement - Dev Team**

We're shipping a major upgrade to the Discord stamp. Key changes:

**Backend (`platforms/src/Discord/Providers/discord.ts`)**:
- Add 4 verification checks (account age, server count, role count, verified connections)
- Extract account creation from snowflake ID
- Iterate through guilds to check member roles
- Fetch and validate verified connections
- Return detailed error messages for failed checks

**Frontend (`platforms/src/Discord/App-Bindings.ts`)**:
- Update OAuth scopes: `['identify', 'guilds', 'guilds.members.read', 'connections']`
- Adjust OAuth URL generation

**Config (`platforms/src/Discord/Providers-config.ts`)**:
- Update platform description and timing
- Change category to "Account Activity & Engagement"

**Testing**:
- Add tests for each verification criterion
- Test multi-failure scenarios
- Test rate limiting and error handling

**Monitoring**:
- Track success/failure rates by criterion
- Monitor API call volume (4-20+ calls per verification)
- Alert on Discord API errors

**Deployment**:
- Stage first, validate end-to-end
- Update documentation
- Prepare support for user questions
- Coordinate with data science on scoring

