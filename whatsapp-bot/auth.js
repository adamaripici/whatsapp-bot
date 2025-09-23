// auth.js
const fs = require("fs").promises;
const path = require("path");
const readline = require("readline");
const { google } = require("googleapis");

const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const TOKEN_PATH = path.join(__dirname, "token.json");

async function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.readonly"],
  });
  console.log("Authorize this app by visiting this URL:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) =>
    rl.question("Enter the code: ", resolve)
  );
  rl.close();

  const { tokens } = await oAuth2Client.getToken(code);
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
  console.log("Token saved to", TOKEN_PATH);
}

async function main() {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const { client_secret, client_id, redirect_uris } =
    JSON.parse(content).installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    "urn:ietf:wg:oauth:2.0:oob"
  );
  await getAccessToken(oAuth2Client);
}

main().catch(console.error);
