const bot = require('./bot');
const setupUserSessionHandlers = require('./handlers/userSession');
const setupAdminActions = require('./handlers/adminActions');

// Initialize handlers
setupUserSessionHandlers(bot);
setupAdminActions(bot);

console.log("Handlers initialized successfully.");

// Ensure the bot survives minor errors
bot.on("polling_error", (error) => console.log("Polling Error:", error));
