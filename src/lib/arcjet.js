import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { ENV } from "./env.js";

const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: ENV.ARCJET_KEY,
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "DRY_RUN", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
      refillRate: 10, // Refill 5 tokens per interval
      interval: 60, // Refill every 10 seconds
      capacity: 60, // Bucket capacity of 10 tokens
    }),
  ],
});

export async function arjectProtect(req, res, next) {
  try {
    const decision = await aj.protect(req, { requested: 1 });
    if (decision.isDenied()) {
      return res.status(429).json({ error: "Too many requests" });
    }
    return next();
  } catch (err) {
    return next(err);
  }
}