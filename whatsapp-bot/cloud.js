const nodemailer = require("nodemailer");
const getVolunteerShifts = require("./calendar");
const formatShifts = require("./formatShifts");

const CALENDAR_ID =
  "qjulvgq3h7jf3ma8pesf3fchns@group.calendar.google.com";

async function main() {
  const requiredVariables = [
    "EMAIL_ADDRESS",
    "EMAIL_APP_PASSWORD",
    "RECIPIENT_EMAILS",
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
}

main().catch((error) => {
  console.error("❌ Cloud job failed:", error);
  process.exit(1);
});