import { env } from "./deps.ts";
import { initStore } from "./store.ts";
import { fetchRSS } from "./flickr.ts";
import { sendToDiscord } from "./discord.ts";

const flickrRSSBaseUrl =
  "https://www.flickr.com/services/feeds/photos_public.gne?lang=en-us&format=rss_200&id=";

type Env = {
  flickrIDs: string[];
  discordWebhookUrl: string;
};

const loadEnv = (): Env => {
  const flickrIDs = env.require("FLICKR_IDS");
  const discord = env.require("DISCORD_WEBHOOK_URL");
  return {
    flickrIDs: flickrIDs.split(","),
    discordWebhookUrl: discord,
  };
};

const e = loadEnv();
const store = await initStore();

for (const id of e.flickrIDs) {
  const rss = flickrRSSBaseUrl + id;
  const lastHandledID = await store.get(id);
  const payload = await fetchRSS(rss, lastHandledID);
  store.set(id, payload.lastEntryID);
  await sendToDiscord(payload, e.discordWebhookUrl);
}

await store.save();
