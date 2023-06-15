type FlickrUserID = string;
type FeedEntryID = string;

const filePath = "./rss-store.json";

type RSSHandled = {
  [key: FlickrUserID]: FeedEntryID;
};

class RSSStore {
  private value: RSSHandled;

  constructor(value: RSSHandled) {
    this.value = value;
  }

  async save() {
    await Deno.writeTextFile(filePath, JSON.stringify(this.value));
  }

  set(id: FlickrUserID, entryID: FeedEntryID) {
    this.value[id] = entryID;
  }

  get(id: FlickrUserID): FeedEntryID | undefined {
    return this.value[id];
  }
}

export const initStore = async (): Promise<RSSStore> => {
  const exists = await Deno.stat(filePath).then(() => true).catch(() => false);
  if (!exists) {
    await Deno.writeTextFile(filePath, "{}");
  }
  const text = exists ? await Deno.readTextFile(filePath) : "{}";
  const value = JSON.parse(text);
  const store = new RSSStore(value);
  return store;
};
