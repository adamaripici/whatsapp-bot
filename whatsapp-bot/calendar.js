// calendar.js
const fs = require("fs").promises;
const { google } = require("googleapis");
const CALENDAR_ID = process.env.CALENDAR_ID;
const getCount = require("./volunteerCount");
const numDays = 8;
async function authorize() {
  const creds = JSON.parse(await fs.readFile("credentials.json"));
  const token = JSON.parse(await fs.readFile("token.json"));
  const { client_secret, client_id, redirect_uris } = creds.installed;
  const oAuth2 = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0],
  );
  oAuth2.setCredentials(token);
  return oAuth2;
}

function startOfDay(d) {
  const z = new Date(d);
  z.setHours(0, 0, 0, 0);
  return z;
}

function endOfDay(d) {
  const z = startOfDay(d);
  z.setDate(z.getDate() + 1);
  return z;
}

function weekdayStr(dateObj) {
  return dateObj.toLocaleDateString("en-US", { weekday: "long" }); // “Monday”
}

async function getVolunteerShifts(calendarId = calendar_id) {
  const auth = await authorize();
  const calendar = google.calendar({ version: "v3", auth });

  const now = new Date(); // use current time, don't reset to 00:00
  // Use today normally, but after 5 PM start from tomorrow
  const baseDate = new Date(now);
  if (now.getHours() >= 17) {
    baseDate.setDate(baseDate.getDate() + 1);
  }
  const rangeEnd = new Date(baseDate);
  rangeEnd.setDate(baseDate.getDate() + numDays);
  // const today = new Date(); // use current time, don't reset to 00:00
  // const oneWeek = new Date();
  // oneWeek.setDate(today.getDate() + numDays);
  // const timeMin = startOfDay(today).toISOString();
  // const timeMax = endOfDay(oneWeek).toISOString();
  const timeMin = startOfDay(baseDate).toISOString();
  const timeMax = endOfDay(rangeEnd).toISOString();

  const res = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = res.data.items ?? [];
  console.log(`📆 ${events.length} events pulled from calendar`);
  events.forEach((ev, i) => {
    const when = ev.start.dateTime || ev.start.date;
    console.log(`#${i + 1}: ${ev.summary}`);
    console.log(`#${i + 1}: ${when}`);
  });

  // Initialise buckets with zero
  let buckets = []; // Array of { date, day, count }
  const bucketsMap = new Map();
  for (let i = 0; i < numDays; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dateStr = d.toLocaleDateString("en-CA");
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });

    buckets.push({ date: dateStr, day: dayName, count: 0 });

    bucketsMap.set(dateStr, {
      date: dateStr,
      day: dayName,
      volunteers: 0,
      // interns: 0,
    });
  }

  events.forEach((ev) => {
    const s = ev.summary || "";

    // ignore canceled events
    if (/^canceled:/i.test(s) || ev.status === "cancelled") return;

    // only count actual volunteer shifts
    if (!/\bvolunteer\s+shift\b/i.test(s)) return;

    const when = new Date(ev.start.dateTime || ev.start.date);
    const dateStr = when.toLocaleDateString("en-CA");
    const dayName = when.toLocaleDateString("en-US", { weekday: "long" });

    if (!bucketsMap.has(dateStr)) {
      bucketsMap.set(dateStr, { date: dateStr, day: dayName, volunteers: 0 });
    }

    const count = getCount(ev); // parses "(X of Y spots filled)" etc.
    bucketsMap.get(dateStr).volunteers += count;
  });

  // ✅ Always add +1 volunteer for each Tuesday (Erik)
  for (const bucket of bucketsMap.values()) {
    if (bucket.day === "Tuesday") {
      bucket.volunteers = (bucket.volunteers || 0) + 1;
    }
  }

  return [...bucketsMap.values()].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
}

module.exports = getVolunteerShifts;
