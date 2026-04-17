# House Listing Telegram Bot

This Telegram bot allows users to submit real estate listings (for rent or sale) which wait for admin approval. Once approved, the listings are seamlessly posted to a designated public channel.

## Features
- **Interactive User Flow**: Users are guided step-by-step to provide details for their listings (Title, Location, Price, Description, Phone, Optional Picture).
- **Admin Review Queue**: All submissions are forwarded directly to the admin with inline 'Approve ✅' and 'Reject ❌' buttons.
- **Auto-Publish**: On approval, the bot automatically formats and broadcasts the post to a public Telegram channel.
- **Storage**: Uses a simple local JSON file for keeping track of pending submissions and sessions persistently (even between restarts).
- **Zero Third-party APIs**: Relies heavily on the Telegram infrastructure to natively host images (via `file_id`), keeping it completely free to run.

## Prerequisites
- Node.js installed

## Setup Instructions

1. **Install dependencies**:
   Run the following command in your terminal:
   ```bash
   npm install
   ```

2. **Configuration**:
   Copy the example environment file and rename it to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and populate the variables:
   - `BOT_TOKEN`: The token you received from [BotFather](https://t.me/botfather).
   - `ADMIN_CHAT_ID`: Your personal Telegram user ID (or the ID of the chat group for admins).
   - `CHANNEL_ID`: The `@username` (must start with `@`) or chat ID of the public channel. Note: The bot **must be an admin** in this channel with sending rights!

3. **Running the bot**:
   Start the application by running:
   ```bash
   npm start
   ```

## Folder Structure

- `src/app.js`: Main entry point configuring handlers.
- `src/bot.js`: Initialization of the `node-telegram-bot-api` client.
- `src/config.js`: Centralized config loader for variables in `.env`.
- `src/storage.js`: A simplistic disk-backed JSON engine mapping chat IDs and holding unreviewed posts.
- `src/handlers/userSession.js`: The state-machine listening to general chat messages to prompt users sequentially.
- `src/handlers/adminActions.js`: Callback listeners triggering the final approvals or rejections via inline keyboards.
- `src/utils/formatters.js`: Formatting templates.
