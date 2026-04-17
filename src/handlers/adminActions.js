const storage = require('../storage');
const config = require('../config');
const { formatPost } = require('../utils/formatters');

function setupAdminActions(bot) {
  bot.on('callback_query', (query) => {
    // Only accept queries from the admin chat
    if (query.message.chat.id.toString() !== config.ADMIN_CHAT_ID.toString()) {
      return bot.answerCallbackQuery(query.id, { text: "Unauthorized." });
    }

    const data = query.data; // e.g., 'approve_123abc' or 'reject_123abc'
    const action = data.split('_')[0]; // 'approve' or 'reject'
    const submissionId = data.split('_')[1];

    const submission = storage.getSubmission(submissionId);

    if (!submission) {
      bot.answerCallbackQuery(query.id, { text: 'Submission not found or already processed.', show_alert: true });
      // Optionally update the admin message to show it was processed
      bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: query.message.chat.id, message_id: query.message.message_id });
      return;
    }

    const { userId, data: postData } = submission;
    const formattedPost = formatPost(postData);

    if (action === 'approve') {
      // Publish to Channel
      if (postData.photoIds && postData.photoIds.length > 0) {
        if (postData.photoIds.length === 1) {
          bot.sendPhoto(config.CHANNEL_ID, postData.photoIds[0], {
            caption: formattedPost,
          }).then(() => notifySuccess())
            .catch(err => notifyFailure(err));
        } else {
          const media = postData.photoIds.map((id, index) => ({
            type: 'photo',
            media: id,
            caption: index === 0 ? formattedPost : ''
          }));
          bot.sendMediaGroup(config.CHANNEL_ID, media)
            .then(() => notifySuccess())
            .catch(err => notifyFailure(err));
        }
      } else {
        bot.sendMessage(config.CHANNEL_ID, formattedPost)
          .then(() => notifySuccess())
          .catch(err => notifyFailure(err));
      }

      function notifySuccess() {
        // Answer query
        bot.answerCallbackQuery(query.id, { text: 'Approved and Published!' });
        
        // Notify original user
        bot.sendMessage(userId, "🎉 Your property listing has been approved and published to the channel!");
        
        // Update Admin UI
        bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: query.message.chat.id, message_id: query.message.message_id });
        bot.sendMessage(config.ADMIN_CHAT_ID, `✅ Submission ${submissionId} was Approved.`, { reply_to_message_id: query.message.message_id });
        
        // Cleanup
        storage.deleteSubmission(submissionId);
      }

      function notifyFailure(err) {
        console.error("Failed to post to channel:", err);
        bot.answerCallbackQuery(query.id, { text: 'Failed to post to channel. Check terminal logs.', show_alert: true });
      }

    } else if (action === 'reject') {
      // Answer query
      bot.answerCallbackQuery(query.id, { text: 'Rejected.' });

      // Notify original user
      bot.sendMessage(userId, "❌ Your property listing has been rejected by the admin.");

      // Update Admin UI
      bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: query.message.chat.id, message_id: query.message.message_id });
      bot.sendMessage(config.ADMIN_CHAT_ID, `❌ Submission ${submissionId} was Rejected.`, { reply_to_message_id: query.message.message_id });

      // Cleanup
      storage.deleteSubmission(submissionId);
    }
  });
}

module.exports = setupAdminActions;
