module.exports = function getVolunteerCount(event) {
  const summary = event.summary || "";
  const desc = event.description || "";

  // 1) Try parsing summary: "(2 of 3 spots filled)" (most accurate)
  const match = summary.match(/\((\d+)\s+of\s+\d+/i);
  if (match) {
    return parseInt(match[1], 10);
  }

  // 2) Try description: "Event Attendance: 2 of 3 spots filled"
  const fromDesc = desc.match(/Event Attendance:\s*(\d+)\s+of\s+\d+/i);
  if (fromDesc) {
    return parseInt(fromDesc[1], 10);
  }

  // 3) attendees array (less reliable)
  if (event.attendees && event.attendees.length > 0) {
    const confirmed = event.attendees.filter(
      (a) => a.responseStatus !== "declined"
    );
    console.log(`✅ From attendees: ${confirmed.length}`);
    return confirmed.length;
  }

  // 4) pattern like "YEP interns (2)"
  const fallback = summary.match(/\((\d+)\)/);
  if (fallback) {
    console.log(`🟣 Fallback number: ${fallback[1]}`);
    return parseInt(fallback[1], 10);
  }

  // 5) default
  console.log(`⚠️ Defaulting to 1 for event: "${summary}"`);
  return 1;
};
