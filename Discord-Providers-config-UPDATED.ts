import { PlatformSpec, PlatformGroupSpec, Provider } from "../types.js";
import { DiscordProvider } from "./Providers/discord.js";

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
        "All four requirements must be met to successfully verify the Stamp",
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
