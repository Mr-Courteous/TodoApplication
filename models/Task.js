// Define your Mongoose schema
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  task: String,
  description: String,
  IsDone: Boolean,
  dueDate: Date,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  usersname: String
});

// Create the Mongoose model
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;







// {
//   "task": "laugh everything out totally",
//   "description": "Milk, bread, eggs",
//   "dueDate": "2024-05-10"
//   }


// {
//   "email":"Oluwaseun@gmail.com",
//   "password":"Oluwaseun"
// }