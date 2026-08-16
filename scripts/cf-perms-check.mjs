import { readFileSync } from "fs";
const configPath = ".cf-auth/.wrangler/config/default.toml";
const content = readFileSync(configPath, "utf8");
const tokenMatch = content.match(/oauth_token = "([^"]+)"/);
const token = tokenMatch ? tokenMatch[1] : null;

const ACCOUNT_ID = "34bdd56a73c7dc40d4223f7fa255d419";
const ZONE_ID = "5349a54b58591b5faf9bfeebf51b3201";
const API = "https://api.cloudflare.com/client/v4";

// Check what scopes/permissions we have
const tokenInfoRes = await fetch(`${API}/user/tokens/verify`, {
  headers: { Authorization: `Bearer ${token}` }
});
const tokenInfo = await tokenInfoRes.json();
console.log("Token verify:", JSON.stringify(tokenInfo).slice(0, 300));

// Try to get WAF rules (Firewall rules)
const firewallRes = await fetch(`${API}/zones/${ZONE_ID}/firewall/rules`, {
  headers: { Authorization: `Bearer ${token}` }
});
const fw = await firewallRes.json();
console.log("Firewall rules access:", fw.success ? "YES" : fw.errors?.[0]?.message);

// Try Cache Rules
const cacheRes = await fetch(`${API}/zones/${ZONE_ID}/rulesets`, {
  headers: { Authorization: `Bearer ${token}` }
});
const cache = await cacheRes.json();
console.log("Rulesets access:", cache.success ? "YES - " + cache.result?.length + " rulesets" : cache.errors?.[0]?.message);

// Try Page Rules
const pageRulesRes = await fetch(`${API}/zones/${ZONE_ID}/pagerules?status=active`, {
  headers: { Authorization: `Bearer ${token}` }
});
const prs = await pageRulesRes.json();
console.log("Page rules:", prs.success ? "YES - " + prs.result?.length + " rules" : prs.errors?.[0]?.message);
