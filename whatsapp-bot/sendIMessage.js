const { spawn } = require("child_process");

function sendIMessage(recipient, message) {
  return new Promise((resolve, reject) => {
    const appleScript = `
      on run argv
        set recipientHandle to item 1 of argv
        set messageText to item 2 of argv

        tell application "Messages"
          set targetService to first service whose service type is iMessage
          set targetBuddy to buddy recipientHandle of targetService
          send messageText to targetBuddy
        end tell
      end run
    `;

    const process = spawn("osascript", [
      "-e",
      appleScript,
      recipient,
      message,
    ]);

    let errorOutput = "";

    process.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    process.on("error", reject);

    process.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Message sent to your iPhone");
        resolve();
      } else {
        reject(
          new Error(
            errorOutput || `osascript exited with status ${code}`,
          ),
        );
      }
    });
  });
}

module.exports = sendIMessage;