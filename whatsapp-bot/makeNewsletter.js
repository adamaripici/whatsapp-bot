// makeNewsletter.js
const path = require("path");
const getVolunteerShifts = require("./calendar");
const { renderEmailHtmlToFile } = require("./renderEmailHtml");
const fs = require("fs");

const CALENDAR_ID = "qjulvgq3h7jf3ma8pesf3fchns@group.calendar.google.com";

async function main() {
  const dataPath = path.join(__dirname, "newsletter_data.json");
  const newsletterData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const buckets = await getVolunteerShifts(CALENDAR_ID);

  const outPath = path.join(__dirname, "dist", "newsletter.html");

  await renderEmailHtmlToFile({
    buckets,
    outPath,
    heroImageUrl: "https://your-hosted-image-url-here.jpg", // optional
    heroImageUrl: newsletterData.heroImageUrl,
    rabbitUpdates: newsletterData.rabbitUpdates,
    guineaPigUpdates: newsletterData.guineaPigUpdates,
    totalRabbits: newsletterData.totalRabbits,
    totalGp: newsletterData.totalGp,
    boardersHtml: newsletterData.boardersHtml,
    reminders: newsletterData.reminders,
    // new
    introHtml: newsletterData.introHtml,
    openHouse: newsletterData.openHouse,
    footerHtml: newsletterData.footerHtml,
  });

  console.log("✅ Generated:", outPath);
  console.log("Open it in a browser to preview.");
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
