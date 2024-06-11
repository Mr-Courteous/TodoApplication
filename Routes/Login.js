const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');
const Task = require('../models/Task');
const User = require('../models/Users');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');




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




// Express session Login route
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Check if the user with the provided email exists
//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(401).json({ message: 'Invalid email or password' });
//         }

//         // Compare the provided password with the hashed password stored in the database
//         const isPasswordValid = await bcrypt.compare(password, user.password);

//         if (!isPasswordValid) {
//             return res.status(401).json({ message: 'Invalid email or password' });
//         }



//         // Store user information in the session
//         req.session.user = {
//             userId: user._id,
//             email: user.email,
//             username:user.username,
//             // Add other user information to the session if needed
//         };

//         console.log(req.session.user);


//         // Return a success message
//         res.status(200).json({
//             message: 'Login successful',
//             user: {
//                 userId: user._id,
//                 email: user.email,
//                 // Add other user information you want to send to the client
//             }
//         });

//     } catch (error) {
//         console.error('Error logging in:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });




// jwt login route

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create JWT payload (replace with your user information)
        const payload = {
            userId: user._id, email: user.email,
            username: user.username,
        }; // Replace with relevant user data

        // Sign JWT token with secret
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send response with token
        res.json({ token, message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// sample logins

// Taiwo@gmail.com
// Taiwo


// Oluwaseun@gmail.com
// Oluwaseun

// Normall dashboard

router.get('/dashboard', (req, res) => {
    if (req.session.user) {
        // User is logged in
        return res.json({ valid: true, user: req.session.user });
    } else {
        // User is not logged in
        return res.json({ valid: false });
    }
});

// Express session dashboard

// router.get('/checkToken', (req, res) => {
//     const authHeader = req.headers.authorization;

//     // Check if authorization header is present and formatted correctly
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({ valid: false, message: 'not authorized' });
//     }

//     const token = authHeader.split(' ')[1]; // Extract token from Bearer header

//     // Verify the JWT token
//     try {
//         jwt.verify(token, process.env.JWT_SECRET);
//         // Token is valid, send success response
//         return res.json({ valid: true });
//     } catch (error) {
//         console.error('Error verifying JWT token:', error);
//         // Token is invalid, send error response with valid JSON structure
//         return res.status(401).json({ valid: false, message: 'Invalid token' });
//     }
// });


router.get('/check-Token', (req, res) => {
    const authHeader = req.headers.authorization;

    // Validate authorization header format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ valid: false, message: 'Invalid authorization header' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from Bearer header

    try {
        // Verify the token using JWT
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Check if token expiration is in the future (not expired)
        const now = Date.now() / 1000; // Convert milliseconds to seconds
        if (decodedToken.exp < now) {
            console.error('Token expired');
            console.log("this token is expired");
            return res.status(401).json({ valid: false, message: 'Token expired' }); // Return error for expired token
        }

        // Access user information from the decoded payload
        const userId = decodedToken.userId;
        const email = decodedToken.email;
        const username = decodedToken.username;

        // Optional: You can construct a new payload here if needed
        // const payload = { userId, email }; // Example of new payload

        // Send response with valid status (e.g., include user information)
        console.log(decodedToken.username);
        return res.json({ valid: true, user: { userId, email, username } }); // Example response
    } catch (error) {
        console.error('Error verifying JWT token:', error);
        // Token is invalid or other errors
        return res.status(401).json({ valid: false, message: 'Invalid token' }); // Return error for invalid token
    }
});




// function isAuthenticated(req, res, next) {
//     if (!req.session.user) {
//         return res.status(401).json({ message: 'fake' });
//     }
//     next();
// }

// JWT Authentication Middleware


// const isAuthenticated = (req, res, next) => {
//     const authHeader = req.headers.authorization;


//     // Check if authorization header is present and formatted correctly
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({ valid: false, message: 'Unauthorized' });
//     }


//     // Verify the JWT token
//     try {
//         const authHeader = req.headers.authorization;
//         const token = authHeader.split(' ')[1]; // Extract token from Bearer header

//         next();
//     } catch (error) {
//         console.error('Error verifying JWT token:', error);
//         return res.status(401).json({ message: 'Invalid token' });
//     }
// };

const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Validate authorization header format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ valid: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from Bearer header

    try {
        // Verify the token using JWT
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Check for token expiration
        const now = Date.now() / 1000; // Convert milliseconds to seconds
        if (decodedToken.exp < now) {
            return res.status(401).json({ valid: false, message: 'Token expired' });
        }

        // Attach decoded user information to the request object
        req.user = decodedToken;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Error verifying JWT token:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};







router.post('/api/todos', isAuthenticated, async (req, res) => {


    try {

        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1]; // Extract token from Bearer header

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Access user information from the decoded payload
        const userId = decodedToken.userId; // Assuming userId was included in the payload
        const username = decodedToken.username; // Assuming userId was included in the payload

        const newTask = new Task({
            task: req.body.task,  // Assuming task data is sent in the request body
            description: req.body.description || '', // Optional description (default empty string)
            IsDone: false,  // New task starts as not done
            dueDate: req.body.dueDate || null,  // Optional due date (default null)
            user: userId,
            usersname: username,
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
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1]; // Extract token from Bearer header

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId; // Assuming userId was included in the payload

        const tasks = await Task.find({ user: userId });
        console.log(tasks)
        return res.json({ valid: true, message: 'Retrieved user todos', Tasks: tasks });


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
        console.log(task)
        return res.json({ valid: true, task }); // Example response

        // res.json(valid: true, task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});


// Updating task

router.put('/:taskId', isAuthenticated, async (req, res) => {
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





        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1]; // Extract token from Bearer header

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId; // Assuming userId was included in the payload

        const tasks = await Task.find({ user: userId });













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
