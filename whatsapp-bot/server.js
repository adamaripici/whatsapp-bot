// server.js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", async (req, res) => {
  try {
    await require("./bot.js"); // run your bot logic
    res.status(200).send("Bot executed successfully.");
  } catch (err) {
    console.error("Error running bot:", err);
    res.status(500).send("Bot execution failed.");
  }
});

app.listen(PORT, () => {
  console.log(`Bot listening on port ${PORT}`);
});
