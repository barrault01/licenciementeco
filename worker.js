// Worker moncsp.fr : sert les fichiers statiques + compteur de visiteurs
// (adapté de https://korben.info/compteur-visiteurs-cloudflare-gratuit.html,
// en version serverless : pas de cron, le calcul se fait à la demande et le
// résultat vit 60 s dans le cache Cloudflare)

var CANONICAL_HOST = "moncsp.fr";
var PRIVACY_FLOOR = 10; // en dessous, on n'affiche rien (impossible d'isoler quelqu'un)
var WINDOW_MINUTES = 60;
var API_ROW_CAP = 10000; // plafond de lignes de l'API GraphQL : au-delà, on affiche "10 000+"

export default {
  async fetch(request, env, ctx) {
    var url = new URL(request.url);

    // www -> apex
    if (url.hostname === "www." + CANONICAL_HOST) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === "/live.json") {
      return liveCount(env, ctx);
    }

    var res = await env.ASSETS.fetch(request);

    // Hors domaine canonique (workers.dev, préversions) : ne pas indexer
    if (url.hostname !== CANONICAL_HOST) {
      res = new Response(res.body, res);
      res.headers.set("X-Robots-Tag", "noindex");
    }
    return res;
  }
};

async function liveCount(env, ctx) {
  var cache = caches.default;
  var cacheKey = new Request("https://" + CANONICAL_HOST + "/live.json");
  var cached = await cache.match(cacheKey);
  if (cached) return cached;

  var body = { visitors: null };

  if (env.ANALYTICS_TOKEN && env.ZONE_TAG) {
    try {
      var until = new Date();
      var since = new Date(until.getTime() - WINDOW_MINUTES * 60 * 1000);
      var query = {
        query:
          "query($zone: String!, $since: Time!, $until: Time!) {" +
          " viewer { zones(filter: {zoneTag: $zone}) {" +
          "  httpRequestsAdaptiveGroups(limit: " + API_ROW_CAP + "," +
          "   filter: {datetime_geq: $since, datetime_lt: $until, requestSource: \"eyeball\"}) {" +
          "   dimensions { clientIP }" +
          "  }" +
          " } } }",
        variables: { zone: env.ZONE_TAG, since: since.toISOString(), until: until.toISOString() }
      };
      var apiRes = await fetch("https://api.cloudflare.com/client/v4/graphql", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer " + env.ANALYTICS_TOKEN
        },
        body: JSON.stringify(query)
      });
      var data = await apiRes.json();
      var rows = (((data.data || {}).viewer || {}).zones || [])[0];
      rows = (rows && rows.httpRequestsAdaptiveGroups) || [];
      // On compte les IP distinctes puis la liste part aussitôt au garbage
      // collector : aucune IP n'est stockée ni journalisée, seul l'entier reste.
      var uniques = new Set(rows.map(function (r) { return r.dimensions.clientIP; })).size;
      body = {
        visitors: uniques >= PRIVACY_FLOOR ? uniques : null,
        capped: rows.length >= API_ROW_CAP,
        windowMinutes: WINDOW_MINUTES,
        updatedAt: until.toISOString()
      };
    } catch (e) {
      // échec silencieux : le site ne doit jamais dépendre du compteur
    }
  }

  var res = new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=60",
      "access-control-allow-origin": "*"
    }
  });
  ctx.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
