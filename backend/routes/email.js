router.post("/email/send", async (req, res) => {
  try {
    const { template, payload } = req.body;

    if (!template) return res.status(400).json({ error: "Missing template" });

    await sendEmail(template, payload); // your Nodemailer wrapper

    res.json({ success: true });
  } catch (err) {
    console.error("POST /email/send error:", err);
    res.status(500).json({ error: "Email send failed" });
  }
});
