const nodemailer = require("nodemailer");
const getVolunteerShifts = require("./calendar");
const formatShifts = require("./formatShifts");
const fs = require("fs");
const path = require("path");

const CALENDAR_ID = process.env.CALENDAR_ID;

async function main() {
  const requiredVariables = [
    "EMAIL_ADDRESS",
    "EMAIL_APP_PASSWORD",
    "RECIPIENT_EMAILS",
    "CALENDAR_ID",
  ];

  for (const variable of requiredVariables) {
    if (!process.env[variable]) {
      throw new Error(`Missing environment variable: ${variable}`);
    }
  }

  // Read volunteer information and format the update
  const buckets = await getVolunteerShifts(CALENDAR_ID);
  const message = formatShifts(buckets);

  const recipients = process.env.RECIPIENT_EMAILS
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"RabbitEARS Volunteer Bot" <${process.env.EMAIL_ADDRESS}>`,
    to: recipients,
    subject: "🐰 RabbitEARS Volunteer Update",
    text: message,
  });

  console.log(`✅ Volunteer update emailed to ${recipients.length} recipient(s).`);

  const siteDirectory = path.join(__dirname, "site");
  fs.mkdirSync(siteDirectory, { recursive: true });

  fs.writeFileSync(
    path.join(siteDirectory, "latest.txt"),
    message,
    "utf8"
  );

console.log("✅ Created site/latest.txt");

}

main().catch((error) => {
  console.error("❌ Cloud job failed:", error);
  process.exit(1);
});