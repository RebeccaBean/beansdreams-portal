// backend/services/journalService.js

const JournalEntry = require("../model/JournalEntry");
const { emit } = require("./badgeEventService");

// ===============================
// Submit a healing or guided journal entry
// ===============================
async function submitJournal(uid, content, kind = "healing") {
  try {
    if (!uid) {
      throw new Error("UID is required");
    }

    if (!content) {
      throw new Error("Journal content is required");
    }

    const normalizedKind = String(kind).trim().toLowerCase();

    const entry = await JournalEntry.create({
      uid,
      kind: normalizedKind,
      content,
      createdAt: new Date()
    });

    // Trigger badge progress
    await emit(uid, "journal_submitted");

    return entry;
  } catch (err) {
    console.error("submitJournal error:", err);
    throw err;
  }
}

// ===============================
// Get journal entries for a user
// ===============================
async function getJournals(uid, filter = {}) {
  try {
    if (!uid) {
      throw new Error("UID is required");
    }

    return await JournalEntry.findAll({
      where: { uid, ...filter },
      order: [["createdAt", "DESC"]]
    });
  } catch (err) {
    console.error("getJournals error:", err);
    throw err;
  }
}

module.exports = {
  submitJournal,
  getJournals
};
