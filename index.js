var app = require('express').createServer();

app.get('/',function(req,res) {
	if(req.query['hub.verify_token']==='haha')
		res.send(req.query['hub.challenge']);
	else
		res.send('Error');
});

app.listen(process.env.PORT || 3000,function(){
	console.log("listening on 3000");
});
