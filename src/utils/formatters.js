/**
 * Formats a post for the channel or admin preview.
 * 
 * @param {Object} data The listing data collected from the user
 * @returns {String} The formatted text
 */
function formatPost(data) {
  return `🏠 **${data.title}**
🏷 Type: ${data.listingType}
🏢 Category: ${data.category}
  
📍 City: ${data.city}
📍 Sub city: ${data.subCity}
📍 Woreda: ${data.woreda}
📍 Address: ${data.address}

💰 Price: ${data.price}
🛏 Bedroom: ${data.bedroom}
🛁 Bathroom: ${data.bathroom}
📐 Area: ${data.area} m²

${data.description}

📞 Contact: ${data.phone}`;
}

module.exports = {
  formatPost
};
