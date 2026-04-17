const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

if (!config.BOT_TOKEN) {
  console.error("Error: BOT_TOKEN is missing in the environment variables.");
  process.exit(1);
}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(config.BOT_TOKEN, { polling: true });

console.log("Bot checking for updates...");

module.exports = bot;
