/* V1 cloud transport: optional, deliberately not loaded by production apps.
 * Publishable key is public; never put a service_role key here.
 * The profile secret is a bearer credential: never log it.
 */
(function (global) {
  "use strict";
  const API = "https://velspjtxenbvvwgptahh.supabase.co/rest/v1/rpc/";
  const KEY = "sb_publishable_PupDfjNg0FdAGU6yJsxeBg_kGYhgMAS";
  const SLUG = /^[a-z0-9][a-z0-9-]{2,63}$/;
  const SECRET = /^[0-9a-f]{64}$/;
  function credentials(search, hash, storage) {
    const params = new URLSearchParams(search || "");
    const slug = params.get("p");
    if (!slug || !SLUG.test(slug)) return null;
    const fragment = new URLSearchParams((hash || "").replace(/^#/, ""));
    const supplied = fragment.get("sync");
    const cached = storage && storage.getItem("hbg5-26-cloud-secret:" + slug);
    const secret = SECRET.test(supplied || "") ? supplied : cached;
    if (!SECRET.test(secret || "")) return null;
    if (supplied && SECRET.test(supplied) && storage) storage.setItem("hbg5-26-cloud-secret:" + slug, supplied);
    return { slug, secret };
  }
  function createClient(credential, fetcher) {
    if (!credential || !SLUG.test(credential.slug) || !SECRET.test(credential.secret)) throw Error("Cloud profile not activated");
    const request = fetcher || global.fetch.bind(global);
    async function rpc(name, payload) {
      if (!["read_learning_events", "append_learning_event"].includes(name)) throw Error("RPC not allowed");
      const response = await request(API + name, {
        method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ p_slug: credential.slug, p_secret: credential.secret, ...payload }),
        cache: "no-store"
      });
      if (!response.ok) throw Error("Cloud request failed (HTTP " + response.status + ")");
      return response.json();
    }
    return Object.freeze({
      read(appId) { return rpc("read_learning_events", { p_app_id: appId }); },
      append(event) {
        if (!event || !/^[0-9a-f-]{36}$/i.test(event.id || "")) throw Error("Invalid event id");
        return rpc("append_learning_event", {
          p_event_id: event.id, p_app_id: event.appId, p_card_id: event.cardId,
          p_event_data: event.data, p_occurred_at: event.at
        });
      }
    });
  }
  global.HBG_CLOUD_TRANSPORT = Object.freeze({ credentials, createClient });
})(typeof window !== "undefined" ? window : globalThis);
