function formatShifts(bucketsArray) {
  const lines = ["📢 *Weekly Volunteer Support Update* 🐰\n"];
  let fullyCovered = true;

  // Sort by actual date
  const sorted = bucketsArray.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  for (const { date, volunteers } of sorted) {
    const [year, month, day] = date.split("-").map(Number);
    const dt = new Date(year, month - 1, day);
    const shortDay = dt.toLocaleDateString("en-US", { weekday: "short" });
    const mmdd = dt.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
    });

    const total = volunteers;

    if (total === 0) {
      lines.push(`🔴 *${shortDay} ${mmdd}* — ❌ No volunteers scheduled`);
      fullyCovered = false;
      continue;
    }

    if (total >= 2) {
      lines.push(
        `🟢 *${shortDay} ${mmdd}* — ✅ Minimum support covered (${total} volunteer${
          total !== 1 ? "s" : ""
        })`
      );
    } else {
      lines.push(
        `🟡 *${shortDay} ${mmdd}* — ⚠️ Additional support needed (${total} volunteer)`
      );
      fullyCovered = false;
    }
  }

  if (fullyCovered) {
    lines.push(
      "\n🎉 *Amazing!* Every day has minimum volunteer coverage!",
      "🐰 Feel free to still stop by for bunny & piggy playtime, enrichment, and socializing! 🥕"
    );
  }

  lines.push(
    "\n📅 *Sign up here:* https://calendly.com/rabbitearsrescue",
    "\n🥕 *Extra volunteers are always welcome!* 🐇💕",
    "\n📣 *Need to cancel?*",
    "1️⃣ Message this chat so we can help find coverage.",
    "2️⃣ Cancel your shift on Calendly.",
    "\n🙏 Thank you for supporting the buns & piggies! 💕🐰🐹"
  );

  return lines.join("\n");
}

module.exports = formatShifts;