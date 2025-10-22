# Discord Credential Checker

A Next.js web application that verifies Discord account credentials through OAuth2 authentication. This tool checks if a Discord user meets specific requirements based on their account age, server membership, role assignments, and verified external connections.

## Features

The application checks for the following credentials:

- **Account Age**: Account must be older than 365 days
- **Server Membership**: User must be a member of 10+ servers
- **Role Assignments**: User must have role assignments in 3+ servers (shows actual participation)
- **Verified External Connections**: User must have 2+ verified external connections (Spotify, YouTube, Twitter, etc.)

## Screenshots

The app provides:
- Clean, modern UI with Discord branding
- Real-time credential checking
- Detailed breakdown of each requirement
- Clear pass/fail indicators for each check

## Prerequisites

- Node.js 18+ installed
- A Discord application with OAuth2 credentials

## Setup Instructions

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Navigate to the "OAuth2" section in the sidebar
4. Copy your **Client ID** and **Client Secret**
5. Add a redirect URL: `http://localhost:3000/api/auth/callback`

### 2. Configure Environment Variables

1. The `.env` file has already been created in the project root
2. Fill in your Discord OAuth2 credentials:

```env
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## How It Works

### OAuth2 Flow

1. User clicks "Login with Discord"
2. User is redirected to Discord's OAuth2 authorization page
3. User authorizes the application with the required scopes:
   - `identify` - Access to user's basic information
   - `guilds` - Access to user's server list
   - `guilds.members.read` - Access to user's member information in servers
   - `connections` - Access to user's connected external accounts
4. Discord redirects back to the app with an authorization code
5. App exchanges the code for an access token
6. App uses the access token to fetch user data and check credentials

### Credential Checks

#### Account Age
- Extracts the account creation timestamp from the Discord user ID (snowflake)
- Calculates the number of days since account creation
- Passes if account is older than 365 days

#### Server Membership
- Fetches all guilds (servers) the user is a member of
- Counts the total number of servers
- Passes if user is in 10 or more servers

#### Role Assignments
- For each server, fetches the user's member information
- Counts servers where the user has at least one role assigned
- Passes if user has roles in 3 or more servers

#### Verified External Connections
- Fetches all connected external accounts (Spotify, YouTube, etc.)
- Filters for verified connections only
- Passes if user has 2 or more verified connections

## Project Structure

```
discord-credential-checker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── discord/route.ts      # Initiates OAuth2 flow
│   │   │   │   └── callback/route.ts     # Handles OAuth2 callback
│   │   │   └── check-credentials/route.ts # Checks user credentials
│   │   ├── page.tsx                       # Main UI component
│   │   └── ...
│   └── types/
│       └── discord.ts                     # TypeScript type definitions
├── .env                                   # Environment variables
└── package.json
```

## API Endpoints

### `GET /api/auth/discord`
Initiates the Discord OAuth2 flow by redirecting to Discord's authorization page.

### `GET /api/auth/callback`
Handles the OAuth2 callback, exchanges the authorization code for an access token, and redirects to the home page.

### `POST /api/check-credentials`
Checks the user's Discord credentials.

**Request Body:**
```json
{
  "accessToken": "user_access_token"
}
```

**Response:**
```json
{
  "accountAge": {
    "passed": true,
    "days": 1234,
    "createdAt": "2021-01-01T00:00:00.000Z"
  },
  "serverCount": {
    "passed": true,
    "count": 15
  },
  "roleAssignments": {
    "passed": true,
    "serversWithRoles": 5,
    "details": [
      {
        "guildName": "Server Name",
        "roleCount": 3
      }
    ]
  },
  "verifiedConnections": {
    "passed": true,
    "count": 3,
    "connections": [
      {
        "type": "spotify",
        "name": "username"
      }
    ]
  },
  "overallPassed": true
}
```

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client for API requests
- **Discord OAuth2** - User authentication and authorization

## Security Considerations

- Access tokens are only stored in memory (not in localStorage or cookies)
- Tokens are passed via URL parameters and immediately removed from browser history
- The app only requests the minimum required OAuth2 scopes
- Environment variables keep sensitive credentials secure
- All API requests use HTTPS in production

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel project settings
4. Update the Discord redirect URI to your production URL
5. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

Remember to update environment variables and Discord OAuth2 redirect URLs for your production domain.

## Troubleshooting

### "Authentication error" message
- Verify your Discord Client ID and Client Secret are correct
- Ensure the redirect URI matches exactly in both Discord app settings and your `.env` file

### "Failed to check credentials" error
- Check that all required OAuth2 scopes are included in the authorization URL
- Verify your access token is valid and not expired

### Missing server or role data
- Some Discord servers may restrict API access to member information
- The app gracefully handles these cases by skipping servers it cannot access

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
