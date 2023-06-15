# flickr-to-discord

This is a Deno script that fetches the latest photos from Flickr and posts them to Discord.  

* Supports multiple Flickr users.
* Remembers items that have been processed to prevent the same image from being posted twice.

```sh
deno run --allow-net --allow-env ./src/index.ts
```

# env

| env                      | note                                |
| ------------------------ | ----------------------------------- |
| FLICKR_IDS               | Flickr User IDs separated by commas |
| DISCORD_WEBHOOK_URL      | Discord webhook URL                 |
| UPSTASH_REDIS_REST_URL   | Upstash REST API URL                |
| UPSTASH_REDIS_REST_TOKEN | Upstash REST API Token              |
