require('dotenv').config();
const axios = require('axios');
const Task = require('./models/Task');




async function SendReq() {
    try {
        // Fetch data from the database
        const tasks = await Task.find({}, 'task').limit(2);

        // Construct the SMS message content
        const smsData = tasks.map(task => task.task).join('\n');

        const body = await axios.get("https://zenquotes.io/api/random");

        const quote = body.data[0].q;

        // Define the eBulk SMS API parameters
        const baseURL = 'https://api.ebulksms.com:8080/sendsms';
        const username = 'inumiduncourteous@gmail.com';
        const apiKey = process.env.EbulkSmsApi;
        const sender = 'RCCG COAs';
        const flash = '0'; // 0 for regular message, 1 for flash message
        const recipients = '+2348138021900'; // Comma-separated recipient phone numbers

        // Construct the URL for the eBulk SMS API
        const Api = `${baseURL}?username=${username}&apikey=${apiKey}&sender=${sender}&messagetext=${body, smsData}&flash=${flash}&recipients=${recipients}`;

        console.log(quote, smsData);

        // Send the GET request to the eBulk SMS API
        const response = await axios.get(Api);


        // Handle the response from the eBulk SMS API
        console.log('SMS sent successfully:', response.data);
    } catch (error) {
        console.error('Failed to send SMS:', error);
    }
}


// module.exports = SendReq();
