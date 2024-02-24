// Define your Mongoose schema
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  task: String,
  description: String,
  IsDone: Boolean,
  dueDate: Date
});

// Create the Mongoose model
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
