const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');
const Task = require('../models/Task');
const User = require('../models/Users');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');



const app = express();


router.use(cookieParser());
app.use(bodyParser.json());


router.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }

}));





// regiater route
router.post('/register', async (req, res) => {
    try {
        const { email, password, username, phoneNumber } = req.body;

        // Check if the email is already registered
        const existingEmail = await User.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({ message: 'User already exists. Try another username or email.' });
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the hashed password
        const newUser = new User({
            email,
            password: hashedPassword,
            username,
            phoneNumber,
        });

        // Save the user to the database
        await newUser.save();

        // Redirect to the login page after successful user registration
        // res.redirect('/login');
        res.status(200).json({ redirectUrl: '/login' });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user with the provided email exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }



        // Store user information in the session
        req.session.user = {
            userId: user._id,
            email: user.email,
            // Add other user information to the session if needed
        };

        console.log(req.session.user);


        // Return a success message
        res.status(200).json({
            message: 'Login successful',
            user: {
                userId: user._id,
                email: user.email,
                // Add other user information you want to send to the client
            }
        });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// sample logins

// Taiwo@gmail.com
// Taiwo


// Oluwaseun@gmail.com
// Oluwaseun


router.get('/dashboard', (req, res) => {
    if (req.session.user) {
        // User is logged in
        return res.json({ valid: true, user: req.session.user });
    } else {
        // User is not logged in
        return res.json({ valid: false });
    }
});



function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'fake' });
    }
    next();
}





router.post('/api/todos', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.userId; // Get user ID from session

        const newTask = new Task({
            task: req.body.task,  // Assuming task data is sent in the request body
            description: req.body.description || '', // Optional description (default empty string)
            IsDone: false,  // New task starts as not done
            dueDate: req.body.dueDate || null,  // Optional due date (default null)
            user: userId
        });



        await newTask.save();

        res.json({ message: 'Task created successfully', task: newTask });

    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});





router.get('/api/todos', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.userId; // Get user ID from session

        const tasks = await Task.find({ user: userId });
        res.json({ message: 'Retrieved user todos', todos: tasks });

    } catch (error) {
        console.error('Error retrieving tasks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Fetching individual task

router.get('/:taskId', isAuthenticated, async (req, res) => {
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


// Updating task

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

        res.status(200).json({ message: 'Task updated successfully' });

        // Check if the task was found and updated successfully
        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Respond with the updated task
    } catch (error) {
        // Handle any errors that occur during task update
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});




// Deleting task


router.delete('/todos/:taskId', isAuthenticated, async (req, res) => {
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
