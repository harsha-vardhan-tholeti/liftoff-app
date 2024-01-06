const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tasks = require("../models/taskModel");

dotenv.config({ path: "./.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("DB connection established");
});

const tasks = JSON.parse(fs.readFileSync(`${__dirname}/task.json`, "utf8"));

const importData = async () => {
  try {
    await Tasks.create(tasks);
    console.log("Data successfully loaded!");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

const deleteData = async () => {
  try {
    await Tasks.deleteMany();
    console.log("Data successfully deleted!");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
