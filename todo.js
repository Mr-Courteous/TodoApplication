const express = require('express');
const connectDB = require('./connection');
const cron = require('node-cron');
require('dotenv').config();
const Get = require("./Routes/GetUser");
const Login = require("./Routes/Login");
const axios = require('axios');
const Task = require('./models/Task');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const scheduleTasks = require('./schedule'); // Replace with your file path (if different)
const User = require('./models/Users');








const app = express();



app.use(express.json());

// app.use(cors());

app.use(cors({
    origin: ' https://todo-frontend-ten-phi.vercel.app', // Replace with your frontend domain
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true, // Allow credentials (cookies)

}));

// app.use('/add-new-task', Add);

app.use('/tasks', Get);
app.use('/users', Login);
app.use(bodyParser.json());
app.set("trust proxy", 1);




app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        httpsOnly: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 48,
    }

}));




// app.use('/add-new-taskss', Routes);



const port = 5000;

// MongoDB Connection
connectDB();

// async function SendReq() {
//     try {
//         // Fetch data from the database
//         const tasks = await Task.find({}, 'task').limit(2);

//         // Construct the SMS message content
//         const smsData = tasks.map(task => task.task).join('\n');

//         const body = await axios.get("https://zenquotes.io/api/random");

//         const quote = body.data[0].q;


//         // Define the eBulk SMS API parameters
//         const baseURL = 'https://api.ebulksms.com/sendsms';
//         const username = 'inumiduncourteous@gmail.com';
//         const apiKey = process.env.EbulkSmsApi;
//         const sender = 'RCCG COAs';
//         const flash = '0'; // 0 for regular message, 1 for flash message
//         const recipients = '+2348138021900'; // Comma-separated recipient phone numbers

//         // Construct the URL for the eBulk SMS API
//         const Api = `${baseURL}?username=${username}&apikey=${apiKey}&sender=${sender}&messagetext=${body, smsData}&flash=${flash}&recipients=${recipients}`;

//         console.log(quote, smsData);

//         // Send the GET request to the eBulk SMS API
//         const response = await axios.get(Api);


//         // Handle the response from the eBulk SMS API
//         console.log('SMS sent successfully:', response.data);
//     } catch (error) {
//         console.error('Failed to send SMS:', error);
//     }
// }

// SendReq();

app.get('/numbb', async (req, res) => {
    const phoneNumbers = await User.find({}, { phoneNumber: 1 }); // Select only phone number field
    const phoneNumberList = phoneNumbers.map(user => user.phoneNumber); // Extract phone numbers

    console.log(phoneNumberList)

    res.send(phoneNumberList)

});



async function SendReq() {
    try {
        // Fetch data from the database (replace with your actual collection name)
        // const tasks = await Task.find({}, { task: 1 }).limit(2); // Select only task field

        // Construct the SMS message content (assuming you want quote + task list)
        // const smsData = tasks.map(task => task.task).join('\n');
        const smsData = 'check out your Todo list items at ***';
        const body = await axios.get("https://zenquotes.io/api/random");
        const quote = body.data[0].q;
        const messageText = `${quote}\n${smsData}`; // Combine quote and tasks

        // Retrieve phone numbers from the User collection (replace with your collection name)
        const phoneNumbers = await User.find({}, { phoneNumber: 1 });

        // Send SMS to each user (assuming comma-separated recipients supported by eBulk SMS API)
        const recipients = phoneNumbers.map(user => user.phoneNumber).join(',');
        const baseURL = 'https://api.ebulksms.com/sendsms';
        const username = 'inumiduncourteous@gmail.com';
        const apiKey = process.env.EbulkSmsApi;
        const sender = 'RCCG COAs';
        const flash = '0'; // 0 for regular message, 1 for flash message

        for (const recipient of recipients.split(',')) {
            const Api = `${baseURL}?username=${username}&apikey=${apiKey}&sender=${sender}&messagetext=${messageText}&flash=${flash}&recipients=${recipient}`;
            const response = await axios.get(Api);
            console.log(`SMS sent to ${recipient}:`, response.data);
        }
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
}

// Schedule the task to run daily at 5:00 AM (your time zone)

cron.schedule('0 7 * * *', SendReq, {
    timezone: 'Africa/Lagos'
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


// cron.schedule('0 5 * * *', () => {
//     // Call your function when the cron job triggers
//     SendReq();
// }, {
//     timezone: 'Africa/Lagos'
// });


// cron.schedule('* * * * * *', () => {
//     // Call your function when the cron job triggers
//     SendReq()
// });