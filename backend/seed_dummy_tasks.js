const mongoose = require("mongoose");

const MONGO_URI = "mongodb://127.0.0.1:27017/taskmanager";

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const users = await db.collection("users").find({}).toArray();
  if (users.length === 0) {
    console.log("No users found in database. Please register a user first!");
    process.exit(0);
  }

  // Find user by email or fallback to first user
  let targetUser = users.find(u => u.email === "baraiyakishanbhai783@gmail.com");comp
  if (!targetUser) {
    targetUser = users[0];
  }
  console.log(`Adding dummy completed tasks for user: ${targetUser.name} (${targetUser.email})`);

  const dummyTasks = [];
  const today = new Date();
  
  // Generate dummy tasks for the last 45 days
  for (let i = 0; i < 45; i++) {
    // 65% chance of completing tasks on a given day
    if (Math.random() < 0.65) {
      const taskDate = new Date();
      taskDate.setDate(today.getDate() - i);
      
      // Random number of completed tasks (1 to 4)
      const numTasks = Math.floor(Math.random() * 4) + 1;
      
      for (let j = 0; j < numTasks; j++) {
        dummyTasks.push({
          user: targetUser._id,
          title: `Completed Task ${j + 1} on Day -${i}`,
          description: `Automatically generated dummy task for testing the Streak Heatmap.`,
          priority: ["Low", "Medium", "High", "Critical"][Math.floor(Math.random() * 4)],
          status: "Completed",
          category: ["Personal", "Work", "College", "Study"][Math.floor(Math.random() * 4)],
          project: ["General", "Website Rebuild", "Marketing"][Math.floor(Math.random() * 3)],
          archived: false,
          recurrence: "None",
          estimatedTime: Math.floor(Math.random() * 4) + 1,
          actualTime: Math.floor(Math.random() * 4) + 1,
          createdAt: taskDate,
          updatedAt: taskDate
        });
      }
    }
  }

  if (dummyTasks.length > 0) {
    const result = await db.collection("tasks").insertMany(dummyTasks);
    console.log(`Successfully inserted ${result.insertedCount} dummy completed tasks!`);
  } else {
    console.log("No tasks generated.");
  }

  // Update user stats streak to show something interesting (e.g. 7 days)
  await db.collection("users").updateOne(
    { _id: targetUser._id },
    { $set: { dailyStreak: 7, xp: 450, level: 5 } }
  );
  console.log("Updated user dailyStreak, XP, and level!");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
