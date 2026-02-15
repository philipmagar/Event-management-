const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const User = require("./models/User");

const cleanRoles = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully.");
    const users = await User.find({});
    console.log(`Found ${users.length} users. Checking for role issues...`);

    let updatedCount = 0;

    for (const user of users) {
      if (typeof user.role === "string" && user.role !== user.role.trim()) {
        const oldRole = user.role;
        user.role = user.role.trim();
        await User.findOneAndUpdate(
          { _id: user._id },
          { role: user.role.trim() },
          { runValidators: false },
        );

        console.log(
          `Updated user ${user.email}: "${oldRole.replace("\n", "\\n")}" -> "${user.role}"`,
        );
        updatedCount++;
      }
    }

    console.log(`Cleanup complete. Updated ${updatedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
};

cleanRoles();
