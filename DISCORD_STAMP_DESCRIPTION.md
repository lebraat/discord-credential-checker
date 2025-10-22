# Discord Stamp - Updated Description & Metadata

## Platform Details

### Display Name
**Discord**

### Category/Platform Group
**Account Activity & Engagement**
*(Previously: Account Verification)*

### Short Description (UI Display)
"Verify Discord account activity and engagement through account age, server participation, role assignments, and verified connections"

### Long Description (Support Docs)
"The Discord stamp validates meaningful participation in the Discord ecosystem. To earn this stamp, your account must demonstrate sustained engagement through account longevity, active server membership, community participation via roles, and verified cross-platform identity through external connections."

### Connect Message
"Connect Account"

### Icon
`./assets/discordStampIcon.svg` (no change)

### Website
https://discord.com/

### Time to Get
"2-3 minutes"
*(Previously: 1-2 minutes)*

### Price
"Free"

---

## Provider Configuration

### Provider Name
**Discord**

### Provider Title (UI)
"Verify Active Discord Participation"
*(Previously: "Verify Discord Account Ownership")*

### Provider Description (UI)
"Connect and verify Discord roles, memberships, and activity"

*(Previously: "Connect and verify ownership of your Discord account")*

---

## Requirements Breakdown (User-Facing)

### Requirement 1: Account Age
**Criterion**: Account must be older than 365 days
**Why**: Demonstrates long-term commitment to the Discord platform
**How to Check**: Discord accounts are timestamped - we calculate your account age from your Discord ID

### Requirement 2: Server Membership
**Criterion**: Member of 10 or more servers
**Why**: Shows active participation in Discord communities and engagement across multiple groups
**How to Achieve**: Join public Discord servers related to your interests, communities, or professional networks

### Requirement 3: Role Assignments
**Criterion**: Has role assignments in 3 or more servers
**Why**: Having roles indicates actual participation and contribution to communities
**How to Achieve**: Actively participate in servers - roles are often given for:
- Verified members
- Active contributors
- Event participants
- Community supporters
- Skill-based contributions (artists, developers, moderators)

### Requirement 4: Verified External Connections
**Criterion**: Has 2 or more verified external account connections
**Why**: Verified connections prove cross-platform identity consistency and reduce likelihood of fraudulent accounts
**How to Achieve**: Connect and verify accounts from:
- Spotify
- YouTube
- Twitter/X
- Twitch
- Steam
- Reddit
- GitHub
- Xbox
- PlayStation Network
- Battle.net
- Facebook

*Note: Connections must be verified (green checkmark in Discord settings)*

---

## Help Text & FAQs

### Why was I unable to verify?

**If verification fails, you'll see specific error messages**:

1. **"Account age is X days (requires > 365 days)"**
   - Your Discord account is too new
   - Solution: Wait until your account is at least 1 year old
   - No workaround available - this ensures account authenticity

2. **"Member of X servers (requires 10 or more)"**
   - You need to join more Discord servers
   - Solution: Search for and join public Discord communities
   - Tip: Look for communities related to your hobbies, work, or interests

3. **"Has roles in X servers (requires 3 or more)"**
   - You need roles in more servers
   - Solution: Actively participate in communities to receive roles
   - Tips:
     - Many servers give automatic roles for verification or membership length
     - Contribute to discussions to earn contributor roles
     - Participate in server events
     - Some servers have self-assignable roles

4. **"Has X verified connections (requires 2 or more)"**
   - You need more verified external account connections
   - Solution: Go to Discord Settings → Connections → Add more accounts
   - Important: Must click "Verify" after connecting each account
   - Tip: Spotify and YouTube are easy to verify

### How do I connect external accounts to Discord?

1. Open Discord (desktop or web)
2. Click the gear icon (User Settings)
3. Click "Connections" in the left sidebar
4. Click the platform you want to connect
5. Authorize the connection
6. Click the "Verify" button after connecting
7. Look for the green checkmark indicating verification

### Can I check my eligibility before attempting verification?

Yes! Before attempting to verify your Discord stamp:

1. **Check Account Age**:
   - Go to Discord Settings → My Account
   - Note when you created your account
   - Calculate if it's been more than 365 days

2. **Check Server Count**:
   - Look at your server list on the left sidebar
   - Count your servers (exclude DMs)
   - You need at least 10 servers

3. **Check Roles**:
   - Click on each server
   - Right-click your name → View Profile
   - Check "Roles" section
   - Count servers where you have at least 1 role (excluding @everyone)
   - You need roles in at least 3 servers

4. **Check Verified Connections**:
   - Go to Settings → Connections
   - Count connections with a green checkmark
   - You need at least 2 verified connections

### What data does Passport collect from Discord?

We collect:
- Discord user ID (anonymized in credential)
- Account creation date (stored as "days old")
- Server count (stored as a number)
- Count of servers with roles (stored as a number)
- Count of verified connections (stored as a number)

We DO NOT collect:
- Server names or IDs
- Specific role names or IDs
- Message content or history
- Friend lists
- Voice chat data
- Direct message data
- Specific connection account details

### Why does Discord stamp require these specific criteria?

The Discord stamp is designed to validate:

1. **Authenticity**: Account age prevents newly-created fake accounts
2. **Engagement**: Server membership shows active platform use
3. **Participation**: Roles demonstrate community contribution (not just lurking)
4. **Identity Verification**: External connections prove consistent cross-platform identity

These criteria together provide a robust signal of genuine, engaged Discord participation.

### How is this different from the old Discord stamp?

**Old Discord Stamp**:
- Only verified you owned a Discord account
- Required minimal permissions
- Fast verification (1-2 seconds)
- Low barrier to entry

**New Discord Stamp**:
- Verifies active participation and engagement
- Requires additional permissions (guilds, roles, connections)
- Longer verification (5-10 seconds)
- Higher barrier, but more valuable credential

### What if I meet all requirements but verification still fails?

Possible issues:
- **Discord API Issues**: Try again in a few minutes
- **Privacy Settings**: Ensure your Discord privacy settings allow apps to access your data
- **Server Privacy**: Some servers restrict API access to member data
- **Temporary Errors**: Clear browser cache and try again

If problems persist:
- Check Discord's API status
- Contact Passport support
- Wait 24 hours and retry

---

## Marketing Copy

### Short Tagline
"Prove Your Discord Presence"

### Medium Description (Landing Page)
"Validate your Discord engagement with a stamp that verifies account longevity, active server participation, community roles, and verified cross-platform identity."

### Long Description (Blog/Announcement)
"The enhanced Discord stamp goes beyond simple account ownership to validate meaningful participation in the Discord ecosystem. By verifying account age, server membership, role assignments, and verified external connections, this stamp provides a robust signal of authentic, engaged Discord community participation. Perfect for DAOs, communities, and projects looking for users with demonstrated Discord experience and commitment."

### Value Proposition
"A Discord stamp that proves you're not just present - you're participating."

---

## Technical Metadata

### OAuth Scopes Required
- `identify` - Basic user information
- `guilds` - Server membership list
- `guilds.members.read` - Member details and roles in each server
- `connections` - External account connections

### Verification Criteria (Technical Spec)

```typescript
interface DiscordVerificationCriteria {
  accountAge: {
    minimum: 365,
    unit: "days"
  },
  serverMembership: {
    minimum: 10,
    unit: "servers"
  },
  roleAssignments: {
    minimum: 3,
    unit: "servers_with_roles"
  },
  verifiedConnections: {
    minimum: 2,
    unit: "verified_external_accounts"
  }
}
```

### Success Criteria
All four requirements must be met for successful verification.

### Failure Handling
Returns specific error messages for each failed criterion to guide users.

---

## Recommended Weight/Score

**Current Discord Stamp Weight**: [To be provided by data services team]

**Recommended New Weight**: 2-3x current weight

**Rationale for Increased Weight**:
1. **Higher Barrier to Entry**: Requires 365+ day account (vs. instant)
2. **Proof of Engagement**: Not just account ownership, but active participation
3. **Multi-Factor Validation**: Four separate criteria vs. one
4. **Harder to Fake**: Requires sustained Discord use, not just account creation
5. **Cross-Platform Identity**: Verified connections add identity consistency layer

**Comparable Stamps**:
- Similar weight to other "engagement-based" stamps
- Higher weight than basic identity stamps (Twitter, GitHub)
- Lower weight than financial/staking stamps
- Similar to NFT holder stamps (demonstrates commitment)

---

## Support Article Outline

### Title
"How to Earn the Discord Stamp"

### Sections

1. **Overview**
   - What the Discord stamp verifies
   - Why it's valuable
   - Requirements summary

2. **Before You Start**
   - Eligibility checklist
   - How to check your account age
   - How to count your servers and roles
   - How to verify connections

3. **Step-by-Step Verification**
   - Click "Connect" on Discord stamp
   - Authorize Passport app
   - Wait for verification (5-10 seconds)
   - View results

4. **Understanding Requirements**
   - Account Age explained
   - Server Membership explained
   - Role Assignments explained
   - Verified Connections explained

5. **Troubleshooting**
   - Common error messages
   - How to fix each issue
   - Tips for meeting requirements

6. **Privacy & Security**
   - What data we access
   - What we don't access
   - How data is stored
   - How to revoke access

7. **FAQ**
   - All common questions

---

## Sample UI Copy

### Stamp Card (Not Yet Earned)
**Title**: Discord
**Description**: Verify account age (>365d), server membership (10+), roles (3+), and verified connections (2+)
**Status**: Not Connected
**Button**: Connect Discord

### Stamp Card (Verification Failed)
**Title**: Discord
**Description**: Verification failed. Your account doesn't meet all requirements yet.
**Details**:
- ✗ Account age: 287 days (needs >365)
- ✓ Server membership: 12 servers
- ✗ Role assignments: 2 servers with roles (needs 3+)
- ✓ Verified connections: 3 connections

**Suggestion**: Your account needs to be 78 more days old and you need roles in 1 more server. Try again after participating more in Discord communities!

### Stamp Card (Verified)
**Title**: Discord
**Description**: Active Discord participation verified
**Verified On**: [Date]
**Details**:
- ✓ Account age: 892 days
- ✓ Server membership: 15 servers
- ✓ Role assignments: 8 servers with roles
- ✓ Verified connections: 4 connections

**Status**: Verified ✓

---

## Implementation Notes for Product Team

### UX Considerations
1. **Show Progress**: During verification, show which checks are running
2. **Clear Errors**: When verification fails, clearly explain why and how to fix
3. **Helpful Guidance**: Link to resources on joining servers, getting roles, adding connections
4. **Set Expectations**: Communicate this is a higher-bar stamp upfront
5. **Retry Logic**: Allow users to retry after attempting to meet requirements

### Messaging Tone
- **Encouraging**: "You're almost there! Just need roles in 1 more server."
- **Educational**: "Roles show you're an active participant in communities."
- **Helpful**: "Here's how to connect and verify external accounts."
- **Not Punitive**: Avoid "You failed" - instead "Not quite ready yet"

### A/B Testing Opportunities
- Test different requirement thresholds (365 vs 180 days, 10 vs 5 servers)
- Test messaging variations for failed verifications
- Test displaying requirements before vs. after connection attempt

---

This updated Discord stamp transforms a basic identity verification into a meaningful engagement credential that better serves communities looking for active, committed Discord users.
