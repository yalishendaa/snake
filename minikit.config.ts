const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    "header": "eyJmaWQiOjQyMTU2MCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDRiOGU1MTdkMkY1NjIwRjU1NTE3REI0ODdDNDM0M0MwNjU4QjE5MEMifQ",
    "payload": "eyJkb21haW4iOiJzbmFrZS1uaW5lLXNpZ21hLnZlcmNlbC5hcHAifQ",
    "signature": "mBZUtqqCI74IEBFxAY6NSAYX2WSKbdWXXaBNXPgX2DUttVgWiagYdVu96GXvBIcj9eOQnIbXw7smO5UOK3hXpRs="
  },
  miniapp: {
    version: "1",
    name: "Cubey", 
    subtitle: "Snake Game", 
    description: "Snake Game",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["marketing", "ads", "quickstart", "waitlist"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`, 
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
} as const;

