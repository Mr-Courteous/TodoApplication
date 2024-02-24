const express = require('express');
const router = express.Router();
const Task = require('../models/Task')


// Define your other routes

router.get('/', async (req, res) => {
    try {
        // Query the database to find all tasks
        const tasks = await Task.find();

        // Respond with the fetched tasks
        res.json(tasks);
    } catch (error) {
        // Handle any errors that occur during task fetching
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});



router.get('/:taskId', async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});




router.post('/', async (req, res) => {
    try {
        // Extract task details from the request body
        const { task, description, IsDone, dueDate } = req.body;

        // Create a new task object
        const newTask = new Task({
            task: task,
            description: description,
            IsDone: IsDone,
            dueDate: dueDate
        });

        // Save the new task to the database
        await newTask.save();

        // Respond with a success message
        res.status(200).json({ redirectUrl: '/tasks' });

    } catch (error) {
        // Handle any errors that occur during task creation
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});



router.put('/:taskId', async (req, res) => {
    try {
        // Extract task details from the request body
        const { task, description, IsDone, dueDate } = req.body;

        // Get the task ID from the request parameters
        const taskId = req.params.taskId;

        // Find the task by its ID and update its fields
        const updatedTask = await Task.findByIdAndUpdate(taskId, {
            task: task,
            description: description,
            IsDone: IsDone,
            dueDate: dueDate
        }, { new: true }); // Set { new: true } to return the updated document

        // Check if the task was found and updated successfully
        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Respond with the updated task
        res.status(200).json({ redirectUrl: '/tasks' });
    } catch (error) {
        // Handle any errors that occur during task update
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});


router.delete('/:taskId', async (req, res) => {
    try {
        // Extract the task ID from the request parameters
        const taskId = req.params.taskId;

        // Use Mongoose to find the task by its ID and delete it
        const deletedTask = await Task.findByIdAndDelete(taskId);

        // Check if the task was found and deleted successfully
        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Respond with a success message
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        // Handle any errors that occur during task deletion
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

 



module.exports = router;
