import { FlickrPayload } from "./flickr.ts";

export const sendToDiscord = async (
  payload: FlickrPayload,
  webhookUrl: string,
) => {
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
    await new Promise((res) => setTimeout(res, 500));
  }
};
