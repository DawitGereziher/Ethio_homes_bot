const storage = require('../storage');
const config = require('../config');
const { formatPost } = require('../utils/formatters');
const crypto = require('crypto'); // Built-in for unique ID

// Define steps in the collection process
const STEPS = {
  LISTING_TYPE: 'LISTING_TYPE',
  CATEGORY: 'CATEGORY',
  TITLE: 'TITLE',
  CITY: 'CITY',
  SUB_CITY: 'SUB_CITY',
  WOREDA: 'WOREDA',
  ADDRESS: 'ADDRESS',
  PRICE: 'PRICE',
  BEDROOM: 'BEDROOM',
  BATHROOM: 'BATHROOM',
  AREA: 'AREA',
  DESCRIPTION: 'DESCRIPTION',
  PHONE: 'PHONE',
  IMAGE: 'IMAGE'
};

const listingTypeKeyboard = {
  reply_markup: {
    keyboard: [[{ text: 'For Sale' }, { text: 'For Rent' }]],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};

const categoryKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: 'Condominium' }, { text: 'Villa' }],
      [{ text: 'Apartment' }, { text: 'Guest house' }],
      [{ text: 'Office' }, { text: 'Commercial' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};

function setupUserSessionHandlers(bot) {
  // Handle /start command
  bot.onText(/^\/start$/, (msg) => {
    const chatId = msg.chat.id;
    
    // Reset or create session for the user
    storage.saveSession(chatId, { step: STEPS.LISTING_TYPE, data: {} });
    
    bot.sendMessage(chatId, "Welcome to the Property Listing Bot! 🏡\n\nAre you listing this property **For Sale** or **For Rent**?", {
      ...listingTypeKeyboard,
      parse_mode: 'Markdown' 
    });
  });

  // Handle /cancel command to abort process
  bot.onText(/^\/cancel$/, (msg) => {
    const chatId = msg.chat.id;
    const session = storage.getSession(chatId);
    if (session) {
      storage.clearSession(chatId);
      bot.sendMessage(chatId, "Submission cancelled. Send /start whenever you are ready to try again.");
    } else {
      bot.sendMessage(chatId, "You don't have any active submission to cancel.");
    }
  });

  // Handle all other messages for state machine
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Ignore commands
    if (text && text.startsWith('/')) return;

    const session = storage.getSession(chatId);
    
    // If no active session, ignore or prompt to start
    if (!session) {
      return; 
    }

    switch (session.step) {
      case STEPS.LISTING_TYPE:
        if (!text || (text !== 'For Sale' && text !== 'For Rent')) {
          return bot.sendMessage(chatId, "Please choose 'For Sale' or 'For Rent' from the keyboard.", listingTypeKeyboard);
        }
        session.data.listingType = text;
        session.step = STEPS.CATEGORY;
        storage.saveSession(chatId, session);
        bot.sendMessage(chatId, "Great! Now, what is the **Category** of the property?", {
          ...categoryKeyboard,
          parse_mode: 'Markdown'
        });
        break;

      case STEPS.CATEGORY:
        session.data.category = text;
        session.step = STEPS.TITLE;
        storage.saveSession(chatId, session);
        bot.sendMessage(chatId, "Got it. Please send me the **Title** of your property (e.g., '2BHK Apartment in Downtown').", {
          reply_markup: { remove_keyboard: true },
          parse_mode: 'Markdown'
        });
        break;

      case STEPS.TITLE:
        if (!text) return bot.sendMessage(chatId, "Please send a valid text Title.");
        session.data.title = text;
        session.step = STEPS.CITY;
        storage.saveSession(chatId, session);
        bot.sendMessage(chatId, "Great! Now, please send the **City**.", { parse_mode: 'Markdown' });
        break;

      case STEPS.CITY:
        if (!text) return bot.sendMessage(chatId, "Please send a valid text City.");
        session.data.city = text;
        session.step = STEPS.SUB_CITY;
        storage.saveSession(chatId, session);
        bot.sendMessage(chatId, "What is the **Sub city**?", { parse_mode: 'Markdown' });
        break;

      case STEPS.SUB_CITY:
        if (!text) return bot.sendMessage(chatId, "Please send a valid text Sub city.");
        session.data.subCity = text;
        session.step = STEPS.WOREDA;
        storage.saveSession(chatId, session);
        bot.sendMessage(chatId, "Got it. What is the **Woreda**? (e.g., 01)", { parse_mode: 'Markdown' });
        break;

      case STEPS.WOREDA:
        if (!text) return bot.sendMessage(chatId, "Please send a valid text Woreda.");
        session.data.woreda = text;
        session.step = STEPS.ADDRESS;
        storage.saveSession(chatId, session);
        bot.sendMessage(chatId, "Thanks. Please specify the **Address** (e.g., Near Lachi Meneharya).", { parse_mode: 'Markdown' });
        break;

      case STEPS.ADDRESS:
        if (!text) return bot.sendMessage(chatId, "Please send a valid text Address.");
        session.data.address = text;
        session.step = STEPS.PRICE;
        storage.saveSession(chatId, session);
        bot.sendMessage(chatId, "Got it. What is the **Price**? (e.g., '$1500/month', '250,000 ETB')", { parse_mode: 'Markdown' });
        break;

      case STEPS.PRICE:
        if (!text) return bot.sendMessage(chatId, "Please send a valid text Price.");
        session.data.price = text;
        session.step = STEPS.BEDROOM;
        storage.saveSession(chatId, session);
        bot.sendMessage(chatId, "How many **Bedrooms**? (Send 0 if not applicable)", { parse_mode: 'Markdown' });
        break;

      case STEPS.BEDROOM:
        if (!text) return bot.sendMessage(chatId, "Please send a valid text value for Bedrooms.");
        session.data.bedroom = text;
        session.step = STEPS.BATHROOM;
        storage.saveSession(chatId, session);
        bot.sendMessage(chatId, "How many **Bathrooms**? (Send 0 if not applicable)", { parse_mode: 'Markdown' });
        break;

      case STEPS.BATHROOM:
        if (!text) return bot.sendMessage(chatId, "Please send a valid text value for Bathrooms.");
        session.data.bathroom = text;
        session.step = STEPS.AREA;
        storage.saveSession(chatId, session);
        bot.sendMessage(chatId, "What is the **Area(m²)**?", { parse_mode: 'Markdown' });
        break;

      case STEPS.AREA:
        if (!text) return bot.sendMessage(chatId, "Please send a valid text Area.");
        session.data.area = text;
        session.step = STEPS.DESCRIPTION;
        storage.saveSession(chatId, session);
        bot.sendMessage(chatId, "Nice. Please provide a **Description** with all the necessary details.", { parse_mode: 'Markdown' });
        break;

      case STEPS.DESCRIPTION:
        if (!text) return bot.sendMessage(chatId, "Please send a valid text Description.");
        session.data.description = text;
        session.step = STEPS.PHONE;
        storage.saveSession(chatId, session);
        bot.sendMessage(chatId, "Perfect. Please provide your **Phone number** for contact.", { parse_mode: 'Markdown' });
        break;

      case STEPS.PHONE:
        if (!text) return bot.sendMessage(chatId, "Please send a valid text Phone number.");
        session.data.phone = text;
        session.data.photoIds = []; // initialize
        session.step = STEPS.IMAGE;
        storage.saveSession(chatId, session);
        bot.sendMessage(chatId, "Almost done! Please send **Image(s)** of the property. You can send a single photo, or multiple as an album.\n\nWhen you are completely finished attaching images, type **'done'**.\n\nIf you don't want to include any images, just reply with **'skip'**.", { parse_mode: 'Markdown' });
        break;

      case STEPS.IMAGE:
        // Handle done or skip
        if (text) {
          const lower = text.toLowerCase().trim();
          if (lower === 'skip' || lower === 'done') {
            if (lower === 'skip') session.data.photoIds = [];
            return finishSubmission(bot, chatId, session.data);
          }
        }

        if (msg.photo && msg.photo.length > 0) {
          const largestPhoto = msg.photo[msg.photo.length - 1];
          session.data.photoIds = session.data.photoIds || [];
          session.data.photoIds.push(largestPhoto.file_id);
          storage.saveSession(chatId, session);

          // Prevent spamming users on media group uploads
          if (msg.media_group_id) {
            if (session.lastMediaGroupId !== msg.media_group_id) {
              session.lastMediaGroupId = msg.media_group_id;
              storage.saveSession(chatId, session);
              bot.sendMessage(chatId, "Photos received! You can send more, or type **'done'** to finish.", { parse_mode: 'Markdown' });
            }
          } else {
            bot.sendMessage(chatId, "Photo received! You can send more, or type **'done'** to finish.", { parse_mode: 'Markdown' });
          }
          return;
        }

        bot.sendMessage(chatId, "Please send an image (photo), or type 'done' to finish, or 'skip' to skip.");
        break;
    }
  });
}

function finishSubmission(bot, userId, data) {
  // Clear the user's session
  storage.clearSession(userId);

  // Generate unique submission ID
  const submissionId = crypto.randomBytes(8).toString('hex');

  // Save to pending submissions storage
  storage.saveSubmission(submissionId, {
    userId,
    data
  });

  // Notify user
  bot.sendMessage(userId, "Thank you! Your property listing has been submitted and is pending admin approval. You will be notified once it is approved or rejected.");

  // Prepare and send message to admin
  const formattedPost = formatPost(data);
  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: 'Approve ✅', callback_data: `approve_${submissionId}` },
        { text: 'Reject ❌', callback_data: `reject_${submissionId}` }
      ]
    ]
  };

  const adminMsg = `📥 **New Property Submission**\nFrom User ID: ${userId}\nSubmission ID: ${submissionId}\n\n${formattedPost}`;

  if (data.photoIds && data.photoIds.length > 0) {
    if (data.photoIds.length === 1) {
      bot.sendPhoto(config.ADMIN_CHAT_ID, data.photoIds[0], {
        caption: adminMsg,
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard
      }).catch(err => console.error("Failed to send photo to admin", err));
    } else {
      const media = data.photoIds.map((id, index) => ({
        type: 'photo',
        media: id,
        caption: index === 0 ? adminMsg : '',
        parse_mode: 'Markdown'
      }));
      bot.sendMediaGroup(config.ADMIN_CHAT_ID, media).then(() => {
        // Send keyboard separately since media groups don't support inline keyboards natively
        bot.sendMessage(config.ADMIN_CHAT_ID, `👆 Approval options for Submission ${submissionId}:`, {
          reply_markup: inlineKeyboard
        });
      }).catch(err => console.error("Failed to send media group to admin", err));
    }
  } else {
    bot.sendMessage(config.ADMIN_CHAT_ID, adminMsg, {
      parse_mode: 'Markdown',
      reply_markup: inlineKeyboard
    }).catch(err => console.error("Failed to send message to admin", err));
  }
}

module.exports = setupUserSessionHandlers;
