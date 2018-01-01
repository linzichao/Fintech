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

var mysql = require('mysql')

var con = mysql.createConnection({
	host: process.env.SQL_HOST,
	user: process.env.SQL_USER,
	password: process.env.SQL_PWD,
	database: process.env.SQL_DB
});

var sqlstr = "";
con.connect(function(err){
	if(err) throw err;
	con.query("SELECT BestFiveSellPrice FROM ImeStockPrice WHERE CompanyID=2330 LIMIT 1",function(err,result,fields){
		if(err) throw err;
		sqlstr = result[0].BestFiveSellPrice;
	});
});

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
			
			if(text === 'SQL'){
				sendTextMessage(sender, sqlstr);
			}

			if(text === 'reset'){
				state_sender[sender] = 0;
			}
			
			//check if is lookup query
			if (state_sender[sender] !== undefined && state_sender[sender] != 0){
				//sendTextMessage(sender, "step now:" + state_sender[sender]);	
				demo_questionnaire(sender, text);
			}else if (text.search("Get Started") != -1){
				//sendTextMessage(sender, "您好，林建甫。為了提供個人化投資助理服務，開始進行以下問卷:");	
				state_sender[sender] = 0;
				demo_questionnaire(sender, text);
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
		if (event.postback && false) {
			sendTextMessage(sender, "您好，林建甫。為了提供個人化投資助理服務，開始進行以下問卷:");	
			state_sender[sender] = 0;
			demo_questionnaire(sender, text);
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
const token = process.env.PAGE_ACCESS_TOKEN

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
	let messageData = {}
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
		state_sender[sender] = 1;
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
		state_sender[sender] = 2;
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
		state_sender[sender] = 3;
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

function demo_questionnaire(sender, rev) {
	let messageData = {}
	if(state_sender[sender] == 0){
		messageData = {
			text: "您好，林建甫。為了提供個人化投資助理服務，開始進行以下問卷:\n個人年收入(萬)?",
    		quick_replies:[
    	  		{content_type: "text", title: "0   ~ 50", payload: "payload"},
	      		{content_type: "text", title: "51  ~ 100", payload: "payload"},
	      		{content_type: "text", title: "101 ~ 300", payload: "payload"},
	      		{content_type: "text", title: "301 ~ 800", payload: "payload"},
	      		{content_type: "text", title: "> 801", payload: "payload"}
    		]
		}
		state_sender[sender] += 1;
	}else if( state_sender[sender] == 1){
		messageData = {
			text: "可以用作除儲蓄或投資的款項平均佔收入的百分比為?",
    		quick_replies:[
    	  		{content_type: "text", title: "< 5%", payload: "payload"},
	      		{content_type: "text", title: "5% ~ 10%", payload: "payload"},
	      		{content_type: "text", title: "11%~ 20%", payload: "payload"},
	      		{content_type: "text", title: "21%~ 30%", payload: "payload"},
	      		{content_type: "text", title: "> 31%", payload: "payload"}
    		]
		}
		state_sender[sender] += 1;
	}else if( state_sender[sender] == 2){
		messageData = {
			text: "打算用作為投資用途的款項平均佔您的總資產淨值中的百分比為（物業除外）?",
    		quick_replies:[
    	  		{content_type: "text", title: "< 5%", payload: "payload"},
	      		{content_type: "text", title: "5% ~ 10%", payload: "payload"},
	      		{content_type: "text", title: "11%~ 20%", payload: "payload"},
	      		{content_type: "text", title: "21%~ 30%", payload: "payload"},
	      		{content_type: "text", title: "> 31%", payload: "payload"}
    		]
		}
		state_sender[sender] += 1;	
	}else if( state_sender[sender] == 3){
		messageData = {
			text: "報酬通常伴隨著風險，若單由報酬區間來看，您會選擇哪一種投資組合?",
    		quick_replies:[
    	  		{content_type: "text", title: "± 3%", payload: "payload"},
	      		{content_type: "text", title: "±10%", payload: "payload"},
	      		{content_type: "text", title: "±15%", payload: "payload"},
	      		{content_type: "text", title: "±25%", payload: "payload"},
	      		{content_type: "text", title: "±40%", payload: "payload"}
    		]
		}
		state_sender[sender] += 1;
	}else if( state_sender[sender] == 4){
		messageData = {
			text: "投資收益的現金流量期望為何?",
    		quick_replies:[
    	  		{content_type: "text", title: "月配息", payload: "payload"},
	      		{content_type: "text", title: "季配息", payload: "payload"},
	      		{content_type: "text", title: "半年配息", payload: "payload"},
	      		{content_type: "text", title: "年配息", payload: "payload"},
	      		{content_type: "text", title: "無特殊固定配息", payload: "payload"}
    		]
		}
		state_sender[sender] += 1;
	}else if( state_sender[sender] == 5){
		messageData = {
			text: "投資經驗為何?",
    		quick_replies:[
    	  		{content_type: "text", title: "沒有經驗", payload: "payload"},
	      		{content_type: "text", title: "1~3年", payload: "payload"},
	      		{content_type: "text", title: "4~6年", payload: "payload"},
	      		{content_type: "text", title: "7~9年", payload: "payload"},
	      		{content_type: "text", title: "10年以上", payload: "payload"}
    		]
		}
		state_sender[sender] += 1;
	}else if( state_sender[sender] == 6){
		messageData = {
			text: "投資過的金融商品?",
    		quick_replies:[
    	  		{content_type: "text", title: "台外幣存款、貨幣型基金、儲蓄型保險", payload: "payload"},
	      		{content_type: "text", title: "債券、債券型基金", payload: "payload"},
	      		{content_type: "text", title: "股票、股票型基金、etf", payload: "payload"},
	      		{content_type: "text", title: "結構型商品、投資型保單", payload: "payload"},
	      		{content_type: "text", title: "期貨、選擇權或其他衍生性金融商品", payload: "payload"},
	      		{content_type: "text", title: "無", payload: "payload"}
    		]
		}
		state_sender[sender] += 1;
	}else if( state_sender[sender] == 7){
		messageData = {
			text: "整體投資資產下跌超過15%，對您生活的影響程度為何?",
    		quick_replies:[
    	  		{content_type: "text", title: "無法承受", payload: "payload"},
	      		{content_type: "text", title: "嚴重影響", payload: "payload"},
	      		{content_type: "text", title: "影響大", payload: "payload"},
	      		{content_type: "text", title: "影響小", payload: "payload"},
	      		{content_type: "text", title: "沒有影響", payload: "payload"}
    		]
		}
		state_sender[sender] += 1;
	}else if( state_sender[sender] == 8){
		messageData = {
			text: "預計的投資年限?",
    		quick_replies:[
    	  		{content_type: "text", title: "< 1年", payload: "payload"},
	      		{content_type: "text", title: "1 ~ 3年", payload: "payload"},
	      		{content_type: "text", title: "3 ~ 6年", payload: "payload"},
	      		{content_type: "text", title: "6 ~ 10年", payload: "payload"},
	      		{content_type: "text", title: "10年以上", payload: "payload"}
    		]
		}
		state_sender[sender] += 1;
	}else{
		messageData = {
			text: "已完成問卷填寫。"
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
		attachment:{
      		type:"template",
      		payload:{
        		template_type: "list",
  				top_element_style: "LARGE",
  				elements: [{
      				title: "Title Here",
      				subtitle: "Subtitle Here",
      				image_url: "https://s-media-cache-ak0.pinimg.com/originals/5a/04/4e/5a044eb1329ae9d8916131b92b44799b.jpg",          
      				buttons: [{
  						type:"element_share"
					}],
      				default_action: {
        				type: "web_url",
        				url: "https://www.google.com.tw/",
        				messenger_extensions: "FALSE",
        				webview_height_ratio: "TALL"
      				}
    			}],
   				buttons: [{type: "element_share"}]
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




