function formatShifts(bucketsArray) {
  const lines = ["📢 *Weekly Support Update* 📢\n"];
  let fullyCovered = true;

  // Sort by actual date
  const sorted = bucketsArray.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  for (const { date, volunteers } of sorted) {
    const [year, month, day] = date.split("-").map(Number);
    const dt = new Date(year, month - 1, day);
    const shortDay = dt.toLocaleDateString("en-US", { weekday: "short" }); // Tue
    const mmdd = dt.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
    }); // 07/15
    const total = volunteers;

    if (total === 0) {
      lines.push(`*${shortDay} ${mmdd}* – no volunteers scheduled‼️`);
      fullyCovered = false;
      continue;
    }
    const statusText =
      total >= 2 ? "minimum support covered" : "additional support needed";
    if (total < 2) fullyCovered = false;

    const volunteerText = `${volunteers} volunteer${
      volunteers !== 1 ? "s" : ""
    }`;
    // const internText =
    //   interns > 0 ? `, ${interns} intern${interns !== 1 ? "s" : ""}` : "";

    lines.push(`*${shortDay} ${mmdd}* – ${statusText} (${volunteerText})`);
  }

  if (fullyCovered) {
    lines.push(
      "\n✅ minimum coverage is fully covered every day this week! 🙌",
      "🐇 But please still come in for bunny + piggy playtime and socializing!"
    );
  }

  lines.push(
    "\n📌 Sign up here: https://calendly.com/rabbitearsrescue",
    "\n🥕 *Extra volunteers always welcome!* Come by for bunny play + socializing! 🐇",
    "\n‼️ *If you need to cancel:*",
    "1️⃣  Message this chat asking for fill-in support",
    "2️⃣  Cancel your slot on Calendly",
    "\n🙏 THANK YOU for supporting the buns and piggies 💕🤗"
  );

  return lines.join("\n");
}

module.exports = formatShifts;
