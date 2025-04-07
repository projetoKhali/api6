print("Starting Hydra client registration...")

local http = require("socket.http")
local ltn12 = require("ltn12")
local json = require("cjson")

print("All required modules loaded successfully")

local function getenv(key, default)
  local val = os.getenv(key)
  if val == nil or val == "" then
    return default
  end
  return val
end

local hydra_admin_url = getenv("HYDRA_ADMIN_URL", "http://hydra:4445")
local client_id = getenv("CLIENT_ID", "khali_api6_auth")
local client_secret = getenv("CLIENT_SECRET", "khali_api6_auth")
local redirect_uris = getenv("REDIRECT_URIS", "http://localhost:3000/callback")
local grant_types = getenv("GRANT_TYPES", "authorization_code,refresh_token")
local response_types = getenv("RESPONSE_TYPES", "code")
local scope = getenv("SCOPE", "openid offline")

print("Environment Variables loaded successfully")
print("HYDRA_ADMIN_URL: " .. hydra_admin_url)
print("CLIENT_ID: " .. client_id)
print("CLIENT_SECRET: " .. client_secret)
print("REDIRECT_URIS: " .. redirect_uris)
print("GRANT_TYPES: " .. grant_types)
print("RESPONSE_TYPES: " .. response_types)
print("SCOPE: " .. scope)

local client_data = {
  client_id = client_id,
  client_secret = client_secret,
  redirect_uris = { redirect_uris },
  grant_types = {},
  response_types = {},
  scope = scope,
}

for v in string.gmatch(grant_types, "([^,]+)") do
  table.insert(client_data.grant_types, v)
end
for v in string.gmatch(response_types, "([^,]+)") do
  table.insert(client_data.response_types, v)
end

local body = json.encode(client_data)
local response = {}

local _, code, _, _ = http.request({
  url = hydra_admin_url .. "/admin/clients",
  method = "POST",
  headers = {
    ["Content-Type"] = "application/json",
    ["Content-Length"] = tostring(#body),
  },
  source = ltn12.source.string(body),
  sink = ltn12.sink.table(response),
})

if code == 201 or code == 200 then
  print("✅ Client registered successfully.")
else
  print("❌ Failed to register client. HTTP " .. tostring(code))
  print("    Full response:\n" .. tostring(table.concat(response)))
end
