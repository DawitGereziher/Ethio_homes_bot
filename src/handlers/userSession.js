const storage = require('../storage');
const config = require('../config');
const { formatPost } = require('../utils/formatters');
const crypto = require('crypto'); // Built-in for unique ID

const STEPS_ORDER = [
  'LISTING_TYPE', 'CATEGORY', 'TITLE', 'CITY', 'SUB_CITY', 
  'WOREDA', 'ADDRESS', 'PRICE', 'BEDROOM', 'BATHROOM', 
  'AREA', 'DESCRIPTION', 'PHONE', 'IMAGE', 'CONFIRMATION'
];

const STEPS = STEPS_ORDER.reduce((acc, step) => {
  acc[step] = step;
  return acc;
}, {});

// Keyboards
const listingTypeKeyboard = {
  reply_markup: {
    keyboard: [[{ text: 'For Sale' }, { text: 'For Rent' }], [{ text: '❌ Cancel' }]],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};

const categoryKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: 'Condominium' }, { text: 'Villa' }],
      [{ text: 'Apartment' }, { text: 'Guest house' }],
      [{ text: 'Office' }, { text: 'Commercial' }],
      [{ text: '🔙 Back' }, { text: '❌ Cancel' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};

const subCityKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: 'Bole' }, { text: 'Yeka' }, { text: 'Nifas Silk-Lafto' }],
      [{ text: 'Kirkos' }, { text: 'Lideta' }, { text: 'Arada' }],
      [{ text: 'Addis Ketema' }, { text: 'Akaky Kaliti' }, { text: 'Kolfe Keranio' }],
      [{ text: 'Gulele' }, { text: 'Lemi Kura' }],
      [{ text: '🔙 Back' }, { text: '❌ Cancel' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};

const numericKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: '0 (Studio)' }, { text: '1' }, { text: '2' }],
      [{ text: '3' }, { text: '4' }, { text: '5+' }],
      [{ text: '🔙 Back' }, { text: '❌ Cancel' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};

const defaultBackCancelKeyboard = {
  reply_markup: {
    keyboard: [[{ text: '🔙 Back' }, { text: '❌ Cancel' }]],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};

const skipKeyboard = {
  reply_markup: {
    keyboard: [[{ text: 'Skip / NA' }], [{ text: '🔙 Back' }, { text: '❌ Cancel' }]],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};

const imageKeyboard = {
  reply_markup: {
    keyboard: [[{ text: 'Done' }, { text: 'Skip Image' }], [{ text: '🔙 Back' }, { text: '❌ Cancel' }]],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};

const confirmationKeyboard = {
  reply_markup: {
    keyboard: [[{ text: 'Submit to Admin ✅' }], [{ text: 'Edit ✏️' }, { text: '❌ Cancel' }]],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};

function getProgress(stepName) {
  const currentIndex = STEPS_ORDER.indexOf(stepName);
  const total = STEPS_ORDER.length - 1; // Exclude confirmation from total
  if (currentIndex === -1 || currentIndex >= total) return '';
  return `[Step ${currentIndex + 1} of ${total}]`;
}

function sendPromptForStep(bot, chatId, step, errorMessage = null) {
  const prefix = errorMessage ? `⚠️ ${errorMessage}\n\n` : '';
  const progress = getProgress(step);
  
  switch(step) {
    case STEPS.LISTING_TYPE:
      bot.sendMessage(chatId, `${prefix}${progress} Are you listing this property **For Sale** or **For Rent**?`, { ...listingTypeKeyboard, parse_mode: 'Markdown' });
      break;
    case STEPS.CATEGORY:
      bot.sendMessage(chatId, `${prefix}${progress} What is the **Category** of the property?`, { ...categoryKeyboard, parse_mode: 'Markdown' });
      break;
    case STEPS.TITLE:
      bot.sendMessage(chatId, `${prefix}${progress} Please send me the **Title** of your property (e.g., '2BHK Apartment in Downtown').`, { ...defaultBackCancelKeyboard, parse_mode: 'Markdown' });
      break;
    case STEPS.CITY:
      bot.sendMessage(chatId, `${prefix}${progress} Please send the **City**.`, { ...defaultBackCancelKeyboard, parse_mode: 'Markdown' });
      break;
    case STEPS.SUB_CITY:
      bot.sendMessage(chatId, `${prefix}${progress} What is the **Sub city**?`, { ...subCityKeyboard, parse_mode: 'Markdown' });
      break;
    case STEPS.WOREDA:
      bot.sendMessage(chatId, `${prefix}${progress} What is the **Woreda**? (e.g., 01)`, { ...defaultBackCancelKeyboard, parse_mode: 'Markdown' });
      break;
    case STEPS.ADDRESS:
      bot.sendMessage(chatId, `${prefix}${progress} Please specify the **Address** (e.g., Near Lachi Meneharya).`, { ...defaultBackCancelKeyboard, parse_mode: 'Markdown' });
      break;
    case STEPS.PRICE:
      bot.sendMessage(chatId, `${prefix}${progress} What is the **Price**? (e.g., '$1500/month', '250,000 ETB')`, { ...defaultBackCancelKeyboard, parse_mode: 'Markdown' });
      break;
    case STEPS.BEDROOM:
      bot.sendMessage(chatId, `${prefix}${progress} How many **Bedrooms**?`, { ...numericKeyboard, parse_mode: 'Markdown' });
      break;
    case STEPS.BATHROOM:
      bot.sendMessage(chatId, `${prefix}${progress} How many **Bathrooms**?`, { ...numericKeyboard, parse_mode: 'Markdown' });
      break;
    case STEPS.AREA:
      bot.sendMessage(chatId, `${prefix}${progress} What is the **Area(m²)**?`, { ...skipKeyboard, parse_mode: 'Markdown' });
      break;
    case STEPS.DESCRIPTION:
      bot.sendMessage(chatId, `${prefix}${progress} Please provide a **Description** with all the necessary details.`, { ...defaultBackCancelKeyboard, parse_mode: 'Markdown' });
      break;
    case STEPS.PHONE:
      bot.sendMessage(chatId, `${prefix}${progress} Please provide your **Phone number** for contact.`, { ...defaultBackCancelKeyboard, parse_mode: 'Markdown' });
      break;
    case STEPS.IMAGE:
      bot.sendMessage(chatId, `${prefix}${progress} Almost done! Please send **Image(s)** of the property.\n\nWhen finished, press **Done**.`, { ...imageKeyboard, parse_mode: 'Markdown' });
      break;
  }
}

function handleBack(bot, chatId, session) {
  const currentIndex = STEPS_ORDER.indexOf(session.step);
  if (currentIndex > 0) {
    session.step = STEPS_ORDER[currentIndex - 1];
    storage.saveSession(chatId, session);
    sendPromptForStep(bot, chatId, session.step);
  } else {
    sendPromptForStep(bot, chatId, session.step);
  }
}

function handleCancel(bot, chatId, session) {
  storage.clearSession(chatId);
  bot.sendMessage(chatId, "Submission cancelled ❌. Send /start whenever you are ready to try again.", {
    reply_markup: { remove_keyboard: true }
  });
}

function setupUserSessionHandlers(bot) {
  bot.onText(/^\/start$/, (msg) => {
    const chatId = msg.chat.id;
    storage.saveSession(chatId, { step: STEPS.LISTING_TYPE, data: {} });
    bot.sendMessage(chatId, "Welcome to the Property Listing Bot! 🏡\nLet's get your property listed.", { reply_markup: { remove_keyboard: true } });
    sendPromptForStep(bot, chatId, STEPS.LISTING_TYPE);
  });

  bot.onText(/^\/cancel$/, (msg) => {
    const chatId = msg.chat.id;
    const session = storage.getSession(chatId);
    if (session) {
      handleCancel(bot, chatId, session);
    } else {
      bot.sendMessage(chatId, "You don't have any active submission to cancel.", { reply_markup: { remove_keyboard: true } });
    }
  });

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Ignore commands
    if (text && text.startsWith('/')) return;

    const session = storage.getSession(chatId);
    if (!session) return;

    if (text === '❌ Cancel') {
      return handleCancel(bot, chatId, session);
    }
    
    if (text === '🔙 Back') {
      return handleBack(bot, chatId, session);
    }

    switch (session.step) {
      case STEPS.LISTING_TYPE:
        if (!text || (text !== 'For Sale' && text !== 'For Rent')) {
          return sendPromptForStep(bot, chatId, session.step, "Please choose a valid option from the keyboard.");
        }
        session.data.listingType = text;
        session.step = STEPS.CATEGORY;
        storage.saveSession(chatId, session);
        sendPromptForStep(bot, chatId, session.step);
        break;

      case STEPS.CATEGORY:
        if (!text) return sendPromptForStep(bot, chatId, session.step, "Invalid input.");
        session.data.category = text;
        session.step = STEPS.TITLE;
        storage.saveSession(chatId, session);
        sendPromptForStep(bot, chatId, session.step);
        break;

      case STEPS.TITLE:
        if (!text) return sendPromptForStep(bot, chatId, session.step, "Invalid text.");
        session.data.title = text;
        session.step = STEPS.CITY;
        storage.saveSession(chatId, session);
        sendPromptForStep(bot, chatId, session.step);
        break;

      case STEPS.CITY:
        if (!text) return sendPromptForStep(bot, chatId, session.step, "Invalid text.");
        session.data.city = text;
        session.step = STEPS.SUB_CITY;
        storage.saveSession(chatId, session);
        sendPromptForStep(bot, chatId, session.step);
        break;

      case STEPS.SUB_CITY:
        if (!text) return sendPromptForStep(bot, chatId, session.step, "Invalid text.");
        session.data.subCity = text;
        session.step = STEPS.WOREDA;
        storage.saveSession(chatId, session);
        sendPromptForStep(bot, chatId, session.step);
        break;

      case STEPS.WOREDA:
        if (!text) return sendPromptForStep(bot, chatId, session.step, "Invalid text.");
        session.data.woreda = text;
        session.step = STEPS.ADDRESS;
        storage.saveSession(chatId, session);
        sendPromptForStep(bot, chatId, session.step);
        break;

      case STEPS.ADDRESS:
        if (!text) return sendPromptForStep(bot, chatId, session.step, "Invalid text.");
        session.data.address = text;
        session.step = STEPS.PRICE;
        storage.saveSession(chatId, session);
        sendPromptForStep(bot, chatId, session.step);
        break;

      case STEPS.PRICE:
        if (!text) return sendPromptForStep(bot, chatId, session.step, "Invalid text.");
        session.data.price = text;
        session.step = STEPS.BEDROOM;
        storage.saveSession(chatId, session);
        sendPromptForStep(bot, chatId, session.step);
        break;

      case STEPS.BEDROOM:
        if (!text) return sendPromptForStep(bot, chatId, session.step, "Invalid text.");
        session.data.bedroom = text;
        session.step = STEPS.BATHROOM;
        storage.saveSession(chatId, session);
        sendPromptForStep(bot, chatId, session.step);
        break;

      case STEPS.BATHROOM:
        if (!text) return sendPromptForStep(bot, chatId, session.step, "Invalid text.");
        session.data.bathroom = text;
        session.step = STEPS.AREA;
        storage.saveSession(chatId, session);
        sendPromptForStep(bot, chatId, session.step);
        break;

      case STEPS.AREA:
        if (!text) return sendPromptForStep(bot, chatId, session.step, "Invalid text.");
        session.data.area = text === 'Skip / NA' ? 'N/A' : text;
        session.step = STEPS.DESCRIPTION;
        storage.saveSession(chatId, session);
        sendPromptForStep(bot, chatId, session.step);
        break;

      case STEPS.DESCRIPTION:
        if (!text) return sendPromptForStep(bot, chatId, session.step, "Invalid text.");
        session.data.description = text;
        session.step = STEPS.PHONE;
        storage.saveSession(chatId, session);
        sendPromptForStep(bot, chatId, session.step);
        break;

      case STEPS.PHONE:
        if (!text) return sendPromptForStep(bot, chatId, session.step, "Invalid text.");
        session.data.phone = text;
        session.data.photoIds = []; // reset images if revisiting step
        session.step = STEPS.IMAGE;
        storage.saveSession(chatId, session);
        sendPromptForStep(bot, chatId, session.step);
        break;

      case STEPS.IMAGE:
        if (text) {
          const lower = text.toLowerCase().trim();
          if (lower === 'skip image' || lower === 'done') {
            if (lower === 'skip image') session.data.photoIds = [];
            
            // Move to confirmation step instead of finishing immediately
            session.step = STEPS.CONFIRMATION;
            storage.saveSession(chatId, session);
            
            const previewText = `*PREVIEW OF YOUR LISTING:*\n\n${formatPost(session.data)}`;
            bot.sendMessage(chatId, previewText, { parse_mode: 'Markdown' });
            bot.sendMessage(chatId, "Would you like to submit this to the admins, or edit it?", {
              ...confirmationKeyboard,
              parse_mode: 'Markdown'
            });
            return;
          }
        }

        if (msg.photo && msg.photo.length > 0) {
          const largestPhoto = msg.photo[msg.photo.length - 1];
          session.data.photoIds = session.data.photoIds || [];
          session.data.photoIds.push(largestPhoto.file_id);
          storage.saveSession(chatId, session);

          if (msg.media_group_id) {
            if (session.lastMediaGroupId !== msg.media_group_id) {
              session.lastMediaGroupId = msg.media_group_id;
              storage.saveSession(chatId, session);
              bot.sendMessage(chatId, "Photos received! You can send more, or press **Done**.", { parse_mode: 'Markdown', ...imageKeyboard });
            }
          } else {
            bot.sendMessage(chatId, "Photo received! You can send more, or press **Done**.", { parse_mode: 'Markdown', ...imageKeyboard });
          }
          return;
        }

        sendPromptForStep(bot, chatId, session.step, "Please send an image (photo), or press 'Done' or 'Skip Image'.");
        break;

      case STEPS.CONFIRMATION:
        if (text === 'Submit to Admin ✅') {
          // Finish and submit!
          bot.sendMessage(chatId, "Submitting...", { reply_markup: { remove_keyboard: true } });
          return finishSubmission(bot, chatId, session.data);
        } else if (text === 'Edit ✏️') {
          session.step = STEPS.LISTING_TYPE;
          storage.saveSession(chatId, session);
          bot.sendMessage(chatId, "Restarting submission. Let's make some edits.");
          sendPromptForStep(bot, chatId, STEPS.LISTING_TYPE);
        } else {
          bot.sendMessage(chatId, "Please choose to either Submit or Edit from the keyboard.", confirmationKeyboard);
        }
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
