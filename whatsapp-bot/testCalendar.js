// testCalendar.js
const getVolunteerShifts = require("./calendar");

(async () => {
  const bucketsArray = await getVolunteerShifts();
  console.log("\n📅 Weekly Volunteer Counts:\n");
  bucketsArray.sort((a, b) => new Date(a.date) - new Date(b.date));
  bucketsArray.forEach(({ day, volunteers, interns }) => {
    console.log(
      `${day}: ${volunteers} volunteer${
        volunteers !== 1 ? "s" : ""
      } : ${interns} interns${interns !== 1 ? "s" : ""}`
    );
  });
})();
