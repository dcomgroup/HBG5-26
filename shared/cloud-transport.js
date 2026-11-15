/* V1 cloud transport: optional, deliberately not loaded by production apps.
 * Publishable key is public; never put a service_role key here.
 * The profile secret is a bearer credential: never log it.
 */
(function (global) {
  "use strict";
  const API = "https://velspjtxenbvvwgptahh.supabase.co/rest/v1/rpc/";
  const KEY = "sb_publishable_PupDfjNg0FdAGU6yJsxeBg_kGYhgMAS";
  const SLUG = /^[a-z0-9][a-z0-9-]{2,63}$/;
  function credentials(search, hash, storage) {
    const params = new URLSearchParams(search || "");
    const slug = params.get("p");
    if (!slug || !SLUG.test(slug)) return null;
    return { slug };
  }
  function createClient(credential, fetcher) {
    if (!credential || !SLUG.test(credential.slug)) throw Error("Cloud profile not activated");
    const request = fetcher || global.fetch.bind(global);
    async function rpc(name, payload) {
      if (!["hbg_read_events", "hbg_append_event"].includes(name)) throw Error("RPC not allowed");
      const response = await request(API + name, {
        method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ p_slug: credential.slug, ...payload }),
        cache: "no-store"
      });
      if (!response.ok) throw Error("Cloud request failed (HTTP " + response.status + ")");
      return response.json();
    }
    return Object.freeze({
      read(appId) { return rpc("hbg_read_events", { p_app_id: appId }); },
      append(event) {
        if (!event || !/^[0-9a-f-]{36}$/i.test(event.id || "")) throw Error("Invalid event id");
        return rpc("hbg_append_event", {
          p_event_id: event.id, p_app_id: event.appId, p_card_id: event.cardId,
          p_event_data: event.data, p_occurred_at: event.at
        });
      }
    });
  }
  global.HBG_CLOUD_TRANSPORT = Object.freeze({ credentials, createClient });
})(typeof window !== "undefined" ? window : globalThis);
