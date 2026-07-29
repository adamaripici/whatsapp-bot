// bot.js
// ──────
// Sends a single message to a WhatsApp group using Puppeteer.
// • Scan the QR code on first run; session is then reused (./wa-session).
// • Customize GROUP_NAME and MESSAGE as you like.

const puppeteer = require("puppeteer");

// === CONFIG ============================================================
const GROUP_NAME = "RabbitEARS volunteers 🐇"; // exact chat title
// const GROUP_NAME = "My Volunteering Group"; // exact chat title
const SEARCH_SELECTOR = 'div[aria-label="Search input textbox"]';
const MESSAGE_BOX_SELECTOR = 'div[aria-label="Type a message"]';
const CALENDAR_ID = process.env.CALENDAR_ID;
const getVolunteerShifts = require("./calendar");
const formatShifts = require("./formatShifts");
// =======================================================================

// Tiny helper to pause
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function sendWhatsAppMessage() {
  // 1. Build the message from Calendar
  const buckets = await getVolunteerShifts(CALENDAR_ID);
  const message = formatShifts(buckets);

  // 1 Launch (re-use session so QR is only scanned once)
  const browser = await puppeteer.launch({
    headless: false, // show browser (easier to debug)
    userDataDir: "./wa-session", // keeps cookies & login
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto("https://web.whatsapp.com", {
    timeout: 0,
    waitUntil: "load",
  });

  console.log("⏳  Waiting for WhatsApp Web…  (scan QR on first run)");
  await page.waitForSelector(SEARCH_SELECTOR);

  // 2 Search for the group
  console.log("🔍  Finding group:", GROUP_NAME);
  await page.click(SEARCH_SELECTOR);
  await page.type(SEARCH_SELECTOR, GROUP_NAME, { delay: 100 });
  await delay(1500);
  await page.keyboard.press("Enter");

  // 3 Wait for message box, type, and send
  await page.waitForSelector(MESSAGE_BOX_SELECTOR);
  // 🧹 Clear any pre-filled text in the message box
  await page.keyboard.down("Meta");
  await page.keyboard.press("A");
  await page.keyboard.up("Meta");

  const lines = message.split("\n"); // split your multi-line text
  for (let i = 0; i < lines.length; i++) {
    await page.type(MESSAGE_BOX_SELECTOR, lines[i], { delay: 80 });
    if (i !== lines.length - 1) {
      // if not last line → newline
      await page.keyboard.down("Shift");
      await page.keyboard.press("Enter"); // Shift+Enter = newline
      await page.keyboard.up("Shift");
    }
  }

  await page.keyboard.press("Enter"); // final Enter → send

  console.log("✅  Message sent!");
  // Keep the browser open for a few seconds, then close (optional)
  await delay(3000);
  await browser.close();
}

// Run immediately if this file is executed (node bot.js)
if (require.main === module) {
  sendWhatsAppMessage().catch((err) => {
    console.error("❌  Error sending message:", err);
    process.exit(1);
  });
}

// Export the function in case you ever want to import it elsewhere
module.exports = sendWhatsAppMessage;
