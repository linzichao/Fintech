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
			}	
			
			//check if is lookup query
			if (state_sender[sender] !== undefined && state_sender[sender] != 0){
				state_sender[sender] += 1;
				demo_started(sender, text);
			}else if (text.search("Get Started") != -1){
				sendTextMessage(sender, "你好，林建甫。歡迎使用投資助理。");	
				sendTextMessage(sender, "接下來開始進行偏好設定:");
				state_sender[sender] = 0;
				demo_started(sender, text);
			}else if (text.search("開始計時") != -1){
				sendTextMessage(sender, "Started Timer!" + sender.toString());
				StartAutoSending();
			}else if (text.search("停止計時") != -1){
				sendTextMessage(sender, "Stopped Timer!" + sender.toString());
				StopAutoSending();
			}else if (text.search("PSID") != -1){
				sendTextMessage(sender, "ID: " + sender.toString());
			}else if (text.search("testBOX") != -1){
				sendBox(sender);
			}else{
				sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
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
	messageData = {}
	if(state_sender[sender] == 0){
		messageData = {
			text: "請問您的性別",
    		quick_replies:[
      		{
       		 	content_type: "text",
        		title: "男性",
				image_url: "https://vignette.wikia.nocookie.net/thewwc/images/5/57/Male_Sign.jpg/revision/latest?cb=20130730202434",
				payload: "payload"
      		},
      		{
       		 	content_type: "text",
        		title: "女性",
				image_url: "https://s-media-cache-ak0.pinimg.com/originals/67/5f/05/675f05d9e12c74d05566bdf150a722e6.jpg",
				payload: "payload"
      		}

    		]
		}
	}else if( state_sender[sender] == 1){
		messageData = {
			text: "請選擇最有興趣類股",
    		quick_replies:[
    	  		{content_type: "text", title: "水泥", payload: "payload"},
	      		{content_type: "text", title: "食品", payload: "payload"},
	      		{content_type: "text", title: "塑膠", payload: "payload"},
	      		{content_type: "text", title: "紡織", payload: "payload"},
	      		{content_type: "text", title: "光電", payload: "payload"},
	      		{content_type: "text", title: "半導體", payload: "payload"},
	      		{content_type: "text", title: "汽車", payload: "payload"},
	      		{content_type: "text", title: "其他", payload: "payload"}
    		]
		}
	}else if(state_sender[sender] == 2){
		messageData = {
			text: "已選擇: 半導體，請選擇最有興趣個股",
    		quick_replies:[
      			{content_type: "text", title: "1437 勤益控", payload: "payload"},
	      		{content_type: "text", title: "2302 麗正", payload: "payload"},
	      		{content_type: "text", title: "2303 聯電", payload: "payload"},
	      		{content_type: "text", title: "2311 日月光", payload: "payload"},
	      		{content_type: "text", title: "2330 台積電", payload: "payload"},
	      		{content_type: "text", title: "2337 旺宏", payload: "payload"},
	      		{content_type: "text", title: "2388 威盛", payload: "payload"},
	      		{content_type: "text", title: "其他", payload: "payload"}
    		]
		}
	}else if(state_sender[sender] == 3){
		messageData = {
			text: "已完成初始偏好設定。"
		}
		state_sender[sender] = 0;
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
