const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data.json');

// Ensure database file exists
function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ pendingSubmissions: {}, userSessions: {} }), 'utf8');
  }
}

// Read database
function readDb() {
  ensureDb();
  const data = fs.readFileSync(DB_PATH, 'utf8');
  try {
    return JSON.parse(data);
  } catch (e) {
    return { pendingSubmissions: {}, userSessions: {} };
  }
}

// Write to database
function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  // Session methods
  getSession(userId) {
    const db = readDb();
    return db.userSessions[userId] || null;
  },
  
  saveSession(userId, sessionData) {
    const db = readDb();
    db.userSessions[userId] = sessionData;
    writeDb(db);
  },
  
  clearSession(userId) {
    const db = readDb();
    delete db.userSessions[userId];
    writeDb(db);
  },

  // Submission methods
  saveSubmission(submissionId, data) {
    const db = readDb();
    db.pendingSubmissions[submissionId] = data;
    writeDb(db);
  },

  getSubmission(submissionId) {
    const db = readDb();
    return db.pendingSubmissions[submissionId] || null;
  },

  deleteSubmission(submissionId) {
    const db = readDb();
    delete db.pendingSubmissions[submissionId];
    writeDb(db);
  }
};
