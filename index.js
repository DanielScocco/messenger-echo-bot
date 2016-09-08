var app = require('express').createServer();

app.get('/',function(req,res) {
	if(req.query['hub_verify_token']==='hatuna_matata')
		res.send(req.query['hub_challenge']);
	else
		res.send('Error');
});

app.listen(process.env.PORT || 3000,function(){
	console.log("listening on 3000");
});
