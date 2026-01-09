const db = require("./db");

async function makeAdmin() {
  try {
    const email = "nickrebbean@gmail.com";

    const [updated] = await db.students.update(
      { role: "admin" },
      { where: { email } }
    );

    if (updated === 0) {
      console.log("No user found with that email");
    } else {
      console.log("Admin role assigned successfully");
    }

    process.exit();
  } catch (err) {
    console.error("Error updating admin:", err);
    process.exit(1);
  }
}

makeAdmin();
