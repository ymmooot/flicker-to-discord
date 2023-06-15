import { Env } from "https://deno.land/x/env@v2.2.0/env.js";
import * as rss from "https://deno.land/x/rss@0.5.8/mod.ts";
import { Redis } from "https://deno.land/x/upstash_redis@v1.21.0/mod.ts";

const env = new Env();
export { env, Redis, rss };
