import { rss } from "./deps.ts";

export type FlickrPayload = {
  id: string;
  userName: string;
  images: string[];
  iconUrl: string;
  lastEntryID: string;
};

const fetchFeed = async (url: string): Promise<rss.Feed> => {
  const response = await fetch(url);
  const xml = await response.text();
  const feed = await rss.parseFeed(xml);
  return feed;
};

export const fetchRSS = async (
  url: string,
  lastHandledID?: string,
): Promise<FlickrPayload> => {
  const feed = await fetchFeed(url);
  const lastHandledIndex = feed.entries.findIndex((e) =>
    e.id === lastHandledID
  );
  const targetEntries = lastHandledIndex > -1
    ? feed.entries.filter((_, i: number) => i < lastHandledIndex)
    : feed.entries;
  const userName = feed.title.value?.match(/(from (?<user>.*))/)?.groups?.user!;
  const images = targetEntries.flatMap((e) =>
    e["media:content"]!.map((c) => c.url!)
  );
  return {
    id: feed.id,
    userName,
    images,
    iconUrl: feed.image!.url!,
    lastEntryID: feed.entries[0].id,
  };
};
