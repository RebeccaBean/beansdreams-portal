const axios = require("axios");

exports.uploadFile = async (req, res) => {
  try {
    const uid = req.user.uid; // however you get the logged-in user

    // 1. Handle the actual upload
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Save file metadata to DB if needed...

    // 2. Determine which badge progress key this upload affects
    let progressKey = null;

    if (file.mimetype.startsWith("audio/") || file.originalname.includes("vocal")) {
      progressKey = "vocal_recordings";
    } else if (file.originalname.includes("creative")) {
      progressKey = "creative_submissions";
    } else {
      progressKey = "performance_uploads";
    }

    // 3. Call the badge update route
    await axios.post(
      `${process.env.PORTAL_API}/students/${uid}/badges/update`,
      { progressKey, increment: 1 },
      { headers: { Authorization: req.headers.authorization } }
    );

    res.json({ success: true, file });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

async function uploadPerformance(uid, fileData) {
  await PerformanceUpload.create({ uid, fileData });

  await emit(uid, "performance_uploaded");

  return { success: true };
}
// backend/controllers/uploadsController.js
const uploadService = require("../services/uploadService");

exports.createUpload = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { type, fileMeta } = req.body;

    const upload = await uploadService.createUpload(uid, type, fileMeta);
    res.json({ success: true, upload });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

exports.getUploads = async (req, res) => {
  try {
    const uid = req.user.uid;
    const uploads = await uploadService.getUploads(uid);
    res.json({ uploads });
  } catch (err) {
    console.error("Get uploads error:", err);
    res.status(500).json({ error: "Failed to fetch uploads" });
  }
};
