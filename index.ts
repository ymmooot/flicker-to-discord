import { env, rss } from "./deps.ts";

const fetchInterval = 3000 * 60 * 1000; // 5 minutes

type Env = {
  flickerRSSUrls: string[];
  discordWebhookUrl: string;
};

const loadEnv = (): Env => {
  const flickr = env.require("FLICKR_RSS_URLS");
  const discord = env.require("DISCORD_WEBHOOK_URL");
  return {
    flickerRSSUrls: flickr.split(","),
    discordWebhookUrl: discord,
  };
};

const fetchRSS = async (url: string): Promise<[string, string[]]> => {
  const response = await fetch(url);
  const xml = await response.text();
  const feed = await rss.parseFeed(xml);
  const targetEntries = feed.entries.filter((e) =>
    e.published!.getTime() > Date.now() - fetchInterval
  );
  const images = targetEntries.flatMap((e) =>
    e["media:content"]!.map((c) => c.url!)
  );
  return [feed.id, images];
};

const sendToDiscord = async (id: string, url: string, imageUrls: string[]) => {
  const batchSize = 4; // four images per batch
  const batches = Math.ceil(imageUrls.length / batchSize);

  for (let i = 0; i < batches; i++) {
    const batchStart = i * batchSize;
    const batchEnd = batchStart + batchSize;
    const batch = imageUrls.slice(batchStart, batchEnd);

    const embeds = batch.map((url) => ({
      url: id,
      image: {
        url,
      },
    }));

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ embeds }),
    });
  }
};

const e = loadEnv();
for (const url of e.flickerRSSUrls) {
  const [id, images] = await fetchRSS(url);
  await sendToDiscord(id, e.discordWebhookUrl, images);
}
