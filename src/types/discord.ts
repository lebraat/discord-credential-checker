export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  verified?: boolean;
  email?: string;
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

export interface CredentialCheckResult {
  accountAge: {
    passed: boolean;
    days: number;
    createdAt: string;
  };
  serverCount: {
    passed: boolean;
    count: number;
  };
  roleAssignments: {
    passed: boolean;
    serversWithRoles: number;
    details: Array<{
      guildName: string;
      roleCount: number;
    }>;
  };
  verifiedConnections: {
    passed: boolean;
    count: number;
    connections: Array<{
      type: string;
      name: string;
    }>;
  };
  overallPassed: boolean;
}
