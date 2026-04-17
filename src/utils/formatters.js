/**
 * Formats a post for the channel or admin preview.
 * 
 * @param {Object} data The listing data collected from the user
 * @returns {String} The formatted text
 */
function formatPost(data) {
  return `🏠 House for Rent/Sale
📍 Location: ${data.location}
💰 Price: ${data.price}

${data.description}

📞 Contact: ${data.phone}`;
}

module.exports = {
  formatPost
};
