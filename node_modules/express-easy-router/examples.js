var express = require('express');


var app = express();

var easyRoute= require('./index');
easyRoute.enableseo('html');

var page=require('./controller/page');

 easyRoute.get('/',function(req,res){
	 res.send('welcome!');
 })
 easyRoute.get('/abc','./controller/page@index');
 easyRoute.get('/666/:name',function(req,res){
	 res.send('hi,666'+req.params.name);
 });
 easyRoute.get('/page',page.about);
 
 easyRoute.get('/contact',function(req,res,next){
	 console.log('contact me')
	 next();
 },page.contact);
 
 easyRoute.get('/bbc',[function(req,res,next){
	 console.log(888);
	 next();
 },function(req,res,next){
	 console.log(8888);
	 next();
 }],'./controller/page@index');
 
 easyRoute.group(function(req,res,next){
		console.log('hi!');
		next();
		});	
easyRoute.group('/8888',function(req,res){
	 res.send('hi,there!');
 })
 easyRoute.group('/888',function(){
	 easyRoute.get('/abc','./controller/page@index');
	 easyRoute.get('/a',function(req,res){
		 res.send('you got it!');
	 });
 })
 easyRoute.group('/admin',function(req,res,next){
	 console.log('who r u?');
	 next();
 },function(){
	 easyRoute.get('/user',function(req,res){
		 res.send("I'm a user!");
	 })
 })


 var myControllers=easyRoute.importer('./controller');
 easyRoute.get('/importer',myControllers.page.about);
 easyRoute.get('/importerlist',myControllers.list.index);


 
  
 easyRoute.bind(app);
 

 
 
 
var server = app.listen(80, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log(" http://%s:%s", host, port)
 
})