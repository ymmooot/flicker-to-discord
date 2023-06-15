import { Redis } from "./deps.ts";

type FlickrUserID = string;
type FeedEntryID = string;
type RSSHandled = {
  [key: FlickrUserID]: FeedEntryID;
};

const key = "rss-handled";

class RSSStore {
  private value: RSSHandled;
  private redis: Redis;

  constructor(url: string, token: string) {
    this.redis = new Redis({
      url,
      token,
    });
    this.value = {};
  }

  async save() {
    await this.redis.set(key, this.value);
  }

  async load() {
    const obj = await this.redis.get<RSSHandled>(key);
    if (obj) {
      this.value = obj;
    }
  }

  set(id: FlickrUserID, entryID: FeedEntryID) {
    this.value[id] = entryID;
  }

  get(id: FlickrUserID): FeedEntryID | undefined {
    return this.value[id];
  }
}

export const initStore = async (
  url: string,
  token: string,
): Promise<RSSStore> => {
  const store = new RSSStore(url, token);
  await store.load();
  return store;
};
