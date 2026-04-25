/**
 * Formats a post for the channel or admin preview.
 * 
 * @param {Object} data The listing data collected from the user
 * @returns {String} The formatted text
 */
function formatPost(data) {
  return `🏠 **${data.title}**
**🏷 Type / አይነት:** ${data.listingType}
**🏢 Category / ምድብ:** ${data.category}
  
**📍 City / ከተማ:** ${data.city}
**📍 Sub city / ክፍለ ከተማ:** ${data.subCity}
**📍 Woreda / ወረዳ:** ${data.woreda}
**📍 Address / አድራሻ:** ${data.address}

**💰 Price / ዋጋ:** ${data.price}
**🛏 Bedroom / መኝታ ቤት:** ${data.bedroom}
**🛁 Bathroom / መታጠቢያ ቤት:** ${data.bathroom}
**📐 Area / ስፋት:** ${data.area} m²

${data.description}

**📞 Contact / ስልክ:** ${data.phone}`;
}

module.exports = {
  formatPost
};
