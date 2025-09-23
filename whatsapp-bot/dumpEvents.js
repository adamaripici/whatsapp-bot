// dumpEvents.js
const { google } = require("googleapis");
const fs = require("fs").promises;

(async () => {
  // ---------- 1. Authorize exactly like in calendar.js ----------
  const creds = JSON.parse(await fs.readFile("credentials.json", "utf8"));
  const token = JSON.parse(await fs.readFile("token.json", "utf8"));
  const { client_secret, client_id, redirect_uris } = creds.installed;

  const auth = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  auth.setCredentials(token);

  // ---------- 2. Query events ----------
  const calendarId = "qjulvgq3h7jf3ma8pesf3fchns@group.calendar.google.com";
  const calendar = google.calendar({ version: "v3", auth });

  const now = new Date();
  const week = new Date(now);
  week.setDate(now.getDate() + 7);

  const res = await calendar.events.list({
    calendarId,
    timeMin: now.toISOString(),
    timeMax: week.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  // ---------- 3. Pretty-print ----------
  console.log(
    `\n=== Raw events for next 7 days (${res.data.items.length} total) ===`
  );
  res.data.items.forEach((ev, idx) => {
    const when = ev.start.dateTime || ev.start.date;

    console.log(`\n#${idx + 1}`);
    console.log(`  Summary   : ${ev.summary}`);
    console.log(`  When      : ${when}`);

    // Attendee details ──────────────────────────────
    if (ev.attendees && ev.attendees.length) {
      ev.attendees.forEach((a, i) => {
        const name = a.displayName || a.email;
        console.log(
          `    • Attendee[${i}] = ${name}  (response: ${a.responseStatus})`
        );
      });
    } else {
      console.log("  Attendees : (none listed)");
    }

    // Other handy fields ────────────────────────────
    console.log(`  Location  : ${ev.location || "(none)"}`);
    console.log(`  Creator   : ${ev.creator?.email || "(unknown)"}`);
    console.log(`  Desc      : ${ev.description?.slice(0, 80) || "(none)"}`);
    console.log(`  Hangout   : ${ev.hangoutLink || "(none)"}`);
    console.log(`  HTML link : ${ev.htmlLink}`);
    console.log(`  Event ID  : ${ev.id}`);
  });
})();
