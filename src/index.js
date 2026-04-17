const bot = require('./bot');
const setupUserSessionHandlers = require('./handlers/userSession');
const setupAdminActions = require('./handlers/adminActions');

// Initialize handlers
setupUserSessionHandlers(bot);
setupAdminActions(bot);

console.log("Handlers initialized successfully.");

// Ensure the bot survives minor errors
bot.on("polling_error", (error) => console.log("Polling Error:", error));

// --- DUMMY WEB SERVER FOR RENDER ---
// Render Web Services require a server to bind to process.env.PORT.
// This dummy server keeps the deployment alive.
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Telegram Bot is running.');
});

app.listen(port, () => {
  console.log(`Dummy Express web server listening on port ${port}`);
});
