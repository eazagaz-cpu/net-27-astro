import { readFileSync } from "fs";
const envLocal = readFileSync('.env.local', 'utf8');
const tokenMatch = envLocal.match(/CLOUDFLARE_API_TOKEN\s*=\s*["']?([^"'\r\n]+)/);
const token = tokenMatch ? tokenMatch[1] : null;
if (!token) { console.log("No token found"); process.exit(1); }

const ACCOUNT_ID = "34bdd56a73c7dc40d4223f7fa255d419";
const API = "https://api.cloudflare.com/client/v4";

// Get zones list
const zonesRes = await fetch(`${API}/zones?name=net27.watch`, {
  headers: { Authorization: `Bearer ${token}` }
});
const zones = await zonesRes.json();
if (!zones.success) {
  console.log("Zones error:", JSON.stringify(zones.errors));
  process.exit(1);
}
const zone = zones.result?.[0];
if (!zone) { console.log("Zone net27.watch not found"); process.exit(1); }
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
