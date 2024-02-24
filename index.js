const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cron = require('node-cron');
const connectDB = require('./connection');
const mongoose = require('mongoose');
const Task = require('./models/Task'); 
const cors = require('cors');



const app = express();

connectDB();



// Middleware to parse JSON request body
app.use(cors());

app.use(bodyParser.json());



// Middleware to parse JSON request body
app.use(express.json());

// const baseURL = 'https://api.ebulksms.com:8080/sendsms';
// const username = 'inumiduncourteous@gmail.com';
// const apiKey = '50a900819d9107cf411a84da24105422fb43a6d0';
// const sender = 'RCCG COA';
// const messageText = 'This is my text messag for testing';
// const flash = '0'; // 0 for regular message, 1 for flash message
// const recipients = '+2348138021900';
// const APIURL = `${baseURL}?username=${username}&apikey=${apiKey}&sender=${sender}&messagetext=${messageText}&flash=${flash}&recipients=${recipients}`;



async function fetchDataAndStoreInVariable() {
  try {
    // Use Mongoose queries to retrieve data
    const tasks = await Task.find({}); // Retrieve all tasks
    
    // Store the data in a variable
    const taskData = tasks.map(task => task.task); // Extracting the 'task' field as an example

    // console.log(taskData);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the Mongoose connection
    mongoose.connection.close();
  }
}

// fetchDataAndStoreInVariable(); 

const apiUrl = 'https://api.ebulksms.com:8080/sendsms';

// Define your eBulkSMS API credentials
const username = 'inumiduncourteous@gmail.com';
const apiKey = '50a900819d9107cf411a84da24105422fb43a6d0';

// Define the message details
const sender = 'RCCG COAs';
const messageText = taskData;
const flash = '0'; // 0 for regular message, 1 for flash message
const recipients = '+2348138021900'; // Comma-separated recipient phone numbers



cron.schedule('* * * * *', () => {
    // Define the request parameters
    const params = {
      username: username,
      apikey: apiKey,
      sender: sender,
      messagetext: messageText,
      flash: flash,
      recipients: recipients
    };
// API endpoint to send SMS
    // Extract data from the request body



 
    // Define the request body



    // Make the POST request to the eBulkSMS API
    axios.get(apiUrl, { params })

    

    


    .then(response => {
      console.log('SMS sent successfully:', response.data);
    })
    .catch(error => {
      console.error('Failed to send SMS:', error.message);
    });
}, {
  scheduled: true,
  timezone: 'Africa/Lagos' // Adjust the timezone as per your requirement
});




fetchDataAndStoreInVariable(); 

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
