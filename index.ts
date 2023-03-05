import { env, rss } from "./deps.ts";

const fetchInterval = 15 * 60 * 1000; // 15 minutes
const flickerRSSBaseUrl =
  "https://www.flickr.com/services/feeds/photos_public.gne?lang=en-us&format=rss_200&id=";

type Env = {
  flickerRSSUrls: string[];
  discordWebhookUrl: string;
};

type FlickrPayload = {
  id: string;
  userName: string;
  images: string[];
  iconUrl: string;
};

const loadEnv = (): Env => {
  const flickrIDs = env.require("FLICKR_IDS");
  const discord = env.require("DISCORD_WEBHOOK_URL");
  return {
    flickerRSSUrls: flickrIDs.split(",").map((id: string) =>
      flickerRSSBaseUrl + id
    ),
    discordWebhookUrl: discord,
  };
};

const fetchRSS = async (url: string): Promise<FlickrPayload> => {
  const response = await fetch(url);
  const xml = await response.text();
  const feed = await rss.parseFeed(xml);
  const targetEntries = feed.entries.filter((e) =>
    e.published!.getTime() > Date.now() - fetchInterval
  );
  const userName = feed.title.value?.match(/(from (?<user>.*))/)?.groups?.user!;
  const images = targetEntries.flatMap((e) =>
    e["media:content"]!.map((c) => c.url!)
  );
  return {
    id: feed.id,
    userName,
    images,
    iconUrl: feed.image!.url!,
  };
};

const sendToDiscord = async (payload: FlickrPayload, webhookUrl: string) => {
  if (payload.images.length === 0) {
    return;
  }

  const batchSize = 4; // four images per batch
  const batches = Math.ceil(payload.images.length / batchSize);

  for (let i = 0; i < batches; i++) {
    const batchStart = i * batchSize;
    const batchEnd = batchStart + batchSize;
    const batch = payload.images.slice(batchStart, batchEnd);

    const embeds = batch.map((url) => ({
      url: payload.id,
      image: {
        url,
      },
      author: i !== 0 ? undefined : {
        name: payload.userName,
        url: payload.id,
        icon_url: payload.iconUrl,
      },
    }));

    const json = {
      username: `Photos by ${payload.userName}`,
      avatar_url:
        "https://www.flickrhelp.com/hc/article_attachments/4419907666708/unnamed.png",
      embeds,
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });
  }
};

const e = loadEnv();
for (const url of e.flickerRSSUrls) {
  const payload = await fetchRSS(url);
  await sendToDiscord(payload, e.discordWebhookUrl);
}
