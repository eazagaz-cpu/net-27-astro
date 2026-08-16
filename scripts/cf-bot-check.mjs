import { readFileSync } from "fs";
const configPath = ".cf-auth/.wrangler/config/default.toml";
const content = readFileSync(configPath, "utf8");
const tokenMatch = content.match(/oauth_token = "([^"]+)"/);
const token = tokenMatch ? tokenMatch[1] : null;
if (!token) { console.log("No token found"); process.exit(1); }

const ACCOUNT_ID = "34bdd56a73c7dc40d4223f7fa255d419";
const API = "https://api.cloudflare.com/client/v4";

// Get zones list
const zonesRes = await fetch(`${API}/zones?name=net-27.cc`, {
  headers: { Authorization: `Bearer ${token}` }
});
const zones = await zonesRes.json();
if (!zones.success) {
  console.log("Zones error:", JSON.stringify(zones.errors));
  process.exit(1);
}
const zone = zones.result?.[0];
if (!zone) { console.log("Zone net-27.cc not found"); process.exit(1); }
console.log("Zone ID:", zone.id, "| Name:", zone.name, "| Status:", zone.status);

// Check Bot Fight Mode
const bfmRes = await fetch(`${API}/zones/${zone.id}/settings/bot_fight_mode`, {
  headers: { Authorization: `Bearer ${token}` }
});
const bfm = await bfmRes.json();
console.log("Bot Fight Mode:", JSON.stringify(bfm));

// Check Super Bot Fight Mode
const sbfmRes = await fetch(`${API}/zones/${zone.id}/bot_management`, {
  headers: { Authorization: `Bearer ${token}` }
});
const sbfm = await sbfmRes.json();
console.log("Bot Management:", JSON.stringify(sbfm).slice(0, 500));
