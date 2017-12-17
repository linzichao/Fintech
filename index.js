//This is still work in progress
/*
Please report any bugs to nicomwaks@gmail.com
i have added console.log on line 48 
 */
'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

var state_sender = {}

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === '3191') {
		res.send(req.query['hub.challenge'])
	} else {
		res.send('Error, wrong token')
	}
})

// to post data
app.post('/webhook/', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			if (text === 'Generic'){ 
				console.log("welcome to chatbot")
				//sendGenericMessage(sender)
				continue
			
			
			//check if is lookup query
			if (state_sender[sender] !== undefined && state_sender[sender] !== 0){
				demo_started(sender, text);
			}else if (text.search("Get Started") != -1){
				state_sender[sender] = 1;
			}else if (text.search("開始計時") != -1){
				sendTextMessage(sender, "Started Timer!" + sender.toString())
				StartAutoSending();
			}else if (text.search("停止計時") != -1){
				sendTextMessage(sender, "Stopped Timer!" + sender.toString())
				StopAutoSending();
			}else if (text.search("PSID") != -1){
				sendTextMessage(sender, "ID: " + sender.toString())
			}else if (text.search("testBOX") != -1){
				sendBox(sender)	
			}else{
				sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
			}

		}
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: " + text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})


//automatically send messages to someone: 1971797792849533
var SendingTimer

function StartAutoSending(){
	SendingTimer = setInterval(sendTextMessage, 10000, 1971797792849533, "test message!");
}

function StopAutoSending(){
	clearInterval(SendingTimer);
}


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.FB_PAGE_ACCESS_TOKEN
const token = "EAACrNe07uLEBAGSCFpu8h9LC6MZBwMXqJhEMqNpavOj04IBe2EHGtrB7tm3HsQZBMv5smY7sDIirYWRHZAsWaboHFXrPWjldZCtUc0butbDJF7NY7q4BtW5vZAThTzilPYHFN51vTcDuGhSoZBckmN80eDWkM7ODkXD6SAgxngbDqQZAPXjz1hc"

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

function demo_started(sender, rev) {
	

}


function sendBox(sender){
	
	let messageData = {
		text: "Here's a quick reply!",
    	quick_replies:[
      	{
        	content_type:"text",
        	title:"testbox",
        	payload:"payload"
      	}
    	]
	}

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

function sendGenericMessage(sender) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "First card",
					"subtitle": "Element #1 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
					"buttons": [{
						"type": "web_url",
						"url": "https://www.messenger.com",
						"title": "web url"
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element in a generic bubble",
					}],
				}, {
					"title": "Second card",
					"subtitle": "Element #2 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
					"buttons": [{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second element in a generic bubble",
					}],
				}]
			}
		}
	}
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

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
