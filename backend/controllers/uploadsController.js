// backend/controllers/uploadsController.js

const uploadService = require("../services/uploadService");
const { updateBadgeProgressInternal } = require("./badgesController");

exports.upload = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user UID" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Determine badge progress key
    let progressKey;
    if (file.mimetype?.startsWith("audio/") || file.originalname?.includes("vocal")) {
      progressKey = "vocal_recordings";
    } else if (file.originalname?.includes("creative")) {
      progressKey = "creative_submissions";
    } else {
      progressKey = "performance_uploads";
    }

    // Update badge progress
    await updateBadgeProgressInternal(uid, progressKey, 1);

    // Save upload metadata
    const upload = await uploadService.createUpload(uid, progressKey, {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    res.json({ success: true, upload });
  } catch (err) {
    console.error("Unified upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

exports.getUploads = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user UID" });
    }

    const uploads = await uploadService.getUploads(uid);
    res.json({ uploads });
  } catch (err) {
    console.error("Get uploads error:", err);
    res.status(500).json({ error: "Failed to fetch uploads" });
  }
};
