// backend/services/journalService.js
const { emit } = require("./badgeEventService");

async function submitJournal(uid, content) {
  await Journal.create({ uid, content });

  await emit(uid, "journal_submitted");

  return { success: true };
}
// backend/services/journalService.js
const JournalEntry = require("../models/JournalEntry");
const { emit } = require("./badgeEventService");

/**
 * Submit a healing or guided journal entry
 * kind examples: "healing", "general", "prompt"
 */
async function submitJournal(uid, content, kind = "healing") {
  if (!uid) throw new Error("UID is required");
  if (!content) throw new Error("Journal content is required");

  const entry = await JournalEntry.create({
    uid,
    kind,
    content,
    createdAt: new Date()
  });

  // Trigger badge progress
  await emit(uid, "journal_submitted");

  return entry;
}

/**
 * Get journal entries for a user
 */
async function getJournals(uid, filter = {}) {
  if (!uid) throw new Error("UID is required");

  return JournalEntry.findAll({
    where: { uid, ...filter },
    order: [["createdAt", "DESC"]]
  });
}

module.exports = {
  submitJournal,
  getJournals
};
