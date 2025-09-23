// listCalendars.js
const fs = require("fs").promises;
const path = require("path");
const { google } = require("googleapis");

// Load credentials and token
async function authorize() {
  const credentials = JSON.parse(await fs.readFile("credentials.json", "utf8"));
  const token = JSON.parse(await fs.readFile("token.json", "utf8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

async function listCalendars(auth) {
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.calendarList.list();
  const calendars = res.data.items;

  calendars.forEach((cal) => {
    console.log(`🗓️ ${cal.summary} (ID: ${cal.id})`);
  });
}

// Run it
authorize().then(listCalendars).catch(console.error);
