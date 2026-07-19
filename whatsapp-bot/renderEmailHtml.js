const fs = require("fs");
const path = require("path");

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatWeekRangeFromBuckets(buckets) {
  if (!Array.isArray(buckets) || buckets.length === 0) return "";

  const first = buckets[0]?.date;
  const last = buckets[buckets.length - 1]?.date;

  const fmt = (iso) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
  };

  return `${fmt(first)} – ${fmt(last)}`;
}

function statusFromCount(count, needed = 3) {
  const remaining = Math.max(needed - count, 0);
  if (remaining === 0) return "✅ Covered";
  if (remaining === 1) return "⚠️ Needs 1";
  return `❌ Needs ${remaining}`;
}

function buildCoverageHtmlFromBuckets(buckets, neededPerDay = 3) {
  const items = buckets ?? [];
  const midpoint = Math.ceil(items.length / 2);

  const leftColumn = items.slice(0, midpoint);
  const rightColumn = items.slice(midpoint);

  function buildCard(b, isLeft) {
    if (!b) {
      return `<td style="width:50%;${isLeft ? "padding-right:8px;" : "padding-left:8px;"}vertical-align:top;"></td>`;
    }

    const count = Number(b.volunteers || 0);
    const status = statusFromCount(count, neededPerDay);

    return `
      <td style="width:50%;${isLeft ? "padding-right:8px;" : "padding-left:8px;"}vertical-align:top;">
        <div style="background:#ffffff;border-radius:14px;padding:12px;border:1px solid #eef0f5;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1f2430;font-weight:700;">
            ${escapeHtml(b.day)} <span style="font-weight:400;color:#8a8f98;">(${escapeHtml(b.date)})</span>
          </div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#5a6270;margin-top:6px;">
            ${count}/${neededPerDay} • ${escapeHtml(status)}
          </div>
        </div>
      </td>
    `;
  }

  const rows = [];
  for (let i = 0; i < midpoint; i++) {
    rows.push(`
      <tr>
        ${buildCard(leftColumn[i], true)}
        ${buildCard(rightColumn[i], false)}
      </tr>
    `);
  }

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5a6270;margin-bottom:10px;">
      Minimum needed per day: <strong>${neededPerDay} volunteers</strong>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="border-collapse:separate;border-spacing:0 10px;">
      ${rows.join("\n")}
    </table>

    <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a8f98;margin-top:10px;">
      Quick legend: ✅ covered • ⚠️ needs 1 • ❌ needs 2+
    </div>
  `;
}

function buildListHtml(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#5a6270;margin-top:8px;">No updates this week.</div>`;
  }

  return `
    <ul style="margin:8px 0 0 18px;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#3a4250;">
      ${items.map((item) => `<li>${item}</li>`).join("\n")}
    </ul>
  `;
}

function buildIntroHtml(introHtml) {
  return introHtml || "";
}

function buildOpenHouseHtml(openHouse) {
  if (!openHouse) return "";

  const shiftsHtml =
    Array.isArray(openHouse.shifts) && openHouse.shifts.length
      ? `
      <ul style="margin:12px 0 0 18px;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#3a4250;">
        ${openHouse.shifts
          .map(
            (shift) => `
              <li>
                <strong>${escapeHtml(shift.time)}:</strong> ${escapeHtml(shift.description)}
              </li>
            `,
          )
          .join("\n")}
      </ul>
    `
      : "";

  const signupLinksHtml =
    Array.isArray(openHouse.signupLinks) && openHouse.signupLinks.length
      ? `
        <div style="margin-top:14px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.9;">
          ${openHouse.signupLinks
            .map(
              (link) => `
                <div>
                  👉 <a href="${escapeHtml(link.url)}" target="_blank" style="color:#2a5bd7;text-decoration:none;">
                    ${escapeHtml(link.label)}
                  </a>
                </div>
              `,
            )
            .join("\n")}
        </div>
      `
      : "";

  return `
    <div style="margin-top:24px;padding:20px;background:#fffaf4;border:1px solid #f1e3cd;border-radius:16px;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.3;color:#1f2430;font-weight:700;margin-bottom:10px;">
        🗓 ${escapeHtml(openHouse.title || "")}
      </div>

      <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#3a4250;font-weight:700;margin-bottom:12px;">
        📅 ${escapeHtml(openHouse.date || "")} | 🕐 ${escapeHtml(openHouse.time || "")}
      </div>

      <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#3a4250;">
        ${escapeHtml(openHouse.description || "")}
      </div>

      ${
        openHouse.volunteerHelpTitle
          ? `
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:1.4;color:#1f2430;font-weight:700;margin-top:18px;">
              🐇 ${escapeHtml(openHouse.volunteerHelpTitle)}
            </div>
          `
          : ""
      }

      ${
        openHouse.volunteerHelpText
          ? `
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#3a4250;margin-top:8px;">
              ${escapeHtml(openHouse.volunteerHelpText)}
            </div>
          `
          : ""
      }

      ${shiftsHtml}
      ${signupLinksHtml}
    </div>
  `;
}

function buildFooterHtml(footerHtml) {
  return footerHtml || "";
}

function renderTemplate(templateHtml, data) {
  return templateHtml.replace(/{{\s*([A-Z0-9_]+)\s*}}/g, (match, key) => {
    if (!(key in data)) return match;
    return String(data[key]);
  });
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function renderEmailHtmlToFile({
  buckets,
  outPath,
  heroImageUrl,
  rabbitUpdates = [],
  guineaPigUpdates = [],
  totalRabbits = "",
  totalGp = "",
  boardersHtml = "",
  reminders = [],
  introHtml = "",
  openHouse = null,
  footerHtml = "",
}) {
  const templatePath = path.join(__dirname, "newsletter_template.html");
  const templateHtml = fs.readFileSync(templatePath, "utf8");

  const WEEK_RANGE = formatWeekRangeFromBuckets(buckets);
  const COVERAGE_HTML = buildCoverageHtmlFromBuckets(buckets, 3);

  const data = {
    WEEK_RANGE,
    HERO_IMAGE_URL:
      heroImageUrl ||
      "https://via.placeholder.com/1200x500.png?text=RabbitEARS",
    INTRO_HTML: buildIntroHtml(introHtml),
    OPEN_HOUSE_HTML: buildOpenHouseHtml(openHouse),
    COVERAGE_HTML,
    RABBIT_UPDATES_HTML: buildListHtml(rabbitUpdates),
    GUINEA_PIG_UPDATES_HTML: buildListHtml(guineaPigUpdates),
    TOTAL_RABBITS: totalRabbits || "—",
    TOTAL_GP: totalGp || "—",
    BOARDERS_HTML:
      boardersHtml ||
      `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#3a4250;margin-top:10px;">No boarder updates this week.</div>`,
    REMINDERS_HTML: buildListHtml(reminders),
    FOOTER_HTML: buildFooterHtml(footerHtml),
  };

  const finalHtml = renderTemplate(templateHtml, data);
  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, finalHtml, "utf8");
  return outPath;
}

module.exports = {
  renderEmailHtmlToFile,
  buildCoverageHtmlFromBuckets,
  formatWeekRangeFromBuckets,
};
