var express = require('express');
var app = express(); 

var request = require('request');
var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/',function(req,res) {
	if(req.query['hub.verify_token']==='haha')
		res.send(req.query['hub.challenge']);
	else
		res.send('Error');
});

app.post('/',function(req,res){
	var data = req.body;

	//make sure it's a page subscription
	if(data.object == 'page'){
		//iterate over each entry
		data.entry.forEach(function(pageEntry){
			var pageID = pageEntry.id;
			var timeOfEvent = pageEntry.time;

			//iterate over each mesaging event
			pageEntry.messaging.forEach(function(messagingEvent){
				if(messagingEvent.optin)
					receivedAuthentication(messagingEvent);
				else if(messagingEvent.message)
					receivedMessage(messagingEvent);
				else if(messagingEvent.delivery)
					receivedDeliveryConfirmation(messagingEvent);
				else if(messagingEvent.postback)
					receivedPostback(messagingEvent);
				else
					console.log("Unknown messagingEvent");
			});
		});

		res.sendStatus(200);
	}

});

function receivedMessage(event){
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	console.log("-->receivedMessage");

	var messageText = message.text;

	sendTextMessage(senderID,messageText);
}

function receivedDeliveryConfirmation(event){
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var delivery = event.delivery;
	var messageIDs = delivery.mids;
	var watermark = delivery.watermark;
	var sequenceNumber = delivery.seq;

	if(messageIDs){
		messageIDs.forEach(function(messageID){
			console.log("Delivery confirmation for message ID: %s",messageID);
		});
	}

	console.log("All messages before %d were delivered.",watermark);
}

//format the data in the request
function sendTextMessage(recipientID, messageText){
	var messageData = {
		recipient:{
			id:recipientID
		},
		message:{
			text: messageText
		}
	};
	callSendAPI(messageData);
}

//call the Send API
function callSendAPI(messageData){
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:'your-page-access-token'},
		method: 'POST',
		json: messageData
	}, function(error,response,body){
		if(!error && response.statusCode == 200)
			console.log("-->Sent message!");
		else
			console.log("Unable to send message");
	});
}

app.listen(process.env.PORT || 3000,function(){
	console.log("listening on 3000");
});
