'use strict';

// Imports dependencies and set up http server
const 
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
	
	 let body = req.body;
 
	 // Checks this is an event from a page subscription
	 if (body.object === 'page') {
 
		 // Iterates over each entry - there may be multiple if batched
		 body.entry.forEach(function(entry) {
 
			 // Gets the message. entry.messaging is an array, but 
			 // will only ever contain one message, so we get index 0
			 let webhookEvent = entry.messaging[0];
			 console.log(webhookEvent);
		 });
 
		 // Returns a '200 OK' response to all requests
		 res.status(200).send('EVENT_RECEIVED');
	 } else {
		 // Returns a '404 Not Found' if event is not from a page subscription
		 res.sendStatus(404);
	 }
 
 });

 // Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
	
		// Your verify token. Should be a random string.
		let VERIFY_TOKEN = "3191"
			
		// Parse the query params
		let mode = req.query['hub.mode'];
		let token = req.query['hub.verify_token'];
		let challenge = req.query['hub.challenge'];
			
		// Checks if a token and mode is in the query string of the request
		if (mode && token) {
		
			// Checks the mode and token sent is correct
			if (mode === 'subscribe' && token === VERIFY_TOKEN) {
				
				// Responds with the challenge token from the request
				console.log('WEBHOOK_VERIFIED');
				res.status(200).send(challenge);
			
			} else {
				// Responds with '403 Forbidden' if verify tokens do not match
				res.sendStatus(403);      
			}
		}
});

// const { MessengerBot } = require('bottender');
// const { createServer } = require('bottender/express');

// const bot = new MessengerBot({
//   accessToken: 'EAAYzaWcruX0BAKZBVaNG6ipfAUO6iKZCBtyT9YXt0CBHUZCR3wKZBN8rBB5JHHrBhAy1q5QqRMSoVl71ZBzZCELa4tYMJgMgY7YP51KpgxxBZBKLcZBJQBYpIqMyVD2XZBn9kLzJTd6hLfBlZAGfvzSKgG2g6gDgYOLPZBS9TxBxCEFhHZAmaPsVVipY',
//   appSecret: 'bd48b3ead8fcaa9d4e08200ecca3b5cc',
// });

// bot.onEvent(async context => {
//   await context.sendText('Hello World');
// });

// const server = createServer(bot);

// server.listen(5000, () => {
//   console.log('server is running on 5000 port...');
// });

app.post('/webhook/', function (req, res) {
	let messaging_events = req.body.entry[0].messaging;
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i];
		let sender = event.sender.id;
		if (event.message && event.message.text) {
			let text = event.message.text;
			sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
		}
	}
	res.sendStatus(200);
})

const token = "EAAYzaWcruX0BACNZCdWoodwZAqLaNSJJPhYHhRTtuWVZCQJO8GkysO4QmEZAkX6SBN9ZC14MzK1cFPZBO3ztS5rd7NuqCutHwguZALXYMnwM6I2wvMsRh8djIZCIqxmiUNZArWNxkFon1hIvMGspzHPY8e257ApXo2FfW7mbGyZBdUBLCtHtsOeEfs"

function sendTextMessage(sender, text) {
	let messageData = { text:text }
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
	json: {
			recipient: {id:sender},
		message: messageData,
	}
}, function(error, response, body) {
	if (error) {
			console.log('Error sending messages: ', error)
	} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}