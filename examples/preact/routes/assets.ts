import {
  Route, 
  staticHandler,
  cacher,
  ResponseCache
} from "../../../mod.ts" // <- https://deno.land/x/peko/mod.ts

import { lookup } from "https://deno.land/x/media_types@v3.0.3/mod.ts"
import { recursiveReaddir } from "https://deno.land/x/recursive_readdir@v2.0.0/mod.ts"
import { fromFileUrl } from "https://deno.land/std@0.150.0/path/mod.ts"

const cache = new ResponseCache()
const env = Deno.env.toObject()
const filenames = await recursiveReaddir(fromFileUrl(new URL(`../src`, import.meta.url)))

const assets: Route[] = filenames.map(file => {
  const fileRoute: `/${string}` = `/${file.slice(file.lastIndexOf("/src" ) + 5)}`

  return {
    route: fileRoute,
    middleware: env.ENVIRONMENT === "production" ? cacher(cache) : [],
    handler: staticHandler({
      fileURL: new URL(`../src/${fileRoute}`, import.meta.url),
      headers: new Headers({
        "Cache-Control": env.ENVIRONMENT === "production"
          ? "max-age=86400, stale-while-revalidate=604800"
          : "no-store"
      }),
      contentType: lookup(file)
    })
  }
})

export default assets