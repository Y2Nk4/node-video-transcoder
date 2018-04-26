var exec = require('child_process').exec;
var crypto = require('crypto');
var fs = require('fs');
var async = require('async');
var ffmpeg = require('ffmpeg');
var easyRoute= require('express-easy-router');
var express = require('express');
var app = express();
var socket_io = require('socket.io');

easyRoute.get('/assets/:filename', function (req, res) {
	res.sendFile(__dirname + '/assets/' + req.params.filename);
});
easyRoute.get('/*', function (req, res) {
	res.sendFile(__dirname + '/assets/index.html');
});

easyRoute.bind(app);

var server = app.listen(2080);
var io = socket_io.listen(server);

var EncodingQueue = {
	'QueueStatus': "",
	'Queue': [],
};

io.on('connection', function (socket) {
	socket.emit('handshake', { hello: 'world' });
	socket.on('startEncode', function (data) {
		var filename = data.filename;
		var full_filepath = __dirname + '/pre_video/' + filename;
		if(!fs.existsSync(full_filepath)){
			return socket.emit('encodeTaskCallback', {status: "error", error: '文件不存在', filepath: full_filepath, filename: filename });
		}
		async.waterfall([
			function(cb){
				/* 计算文件哈希值 - Sha1 */
				var hash = crypto.createHash('sha1');
				var rs = fs.createReadStream(full_filepath);
				socket.emit('encodeTaskCallback', { status: "startEncode"});
				rs.on('data', hash.update.bind(hash));

				rs.on('end', function () {
					var hashResult = hash.digest('hex');
					console.log(hashResult);
					return cb(null,hashResult);
				});
				
			},
			function(result,cb){
				var hashResult = result;
				/*
				cmdCommand = __dirname + '/ffmpeg/bin/ffmpeg.exe -i ./pre_video/input.mp4 -b:v 2000k ./processed_video/' + hashResult + '.mp4 -y';
				//cmdCommand = "ping baidu.com";
				var cmd = exec(cmdCommand,{encode: "utf-8"});
				cmd.stdout.on("data", function(message){
					console.log(message);
				});
				cmd.on("exit",function(code){
					cb(null,code);
				});
				*/
				try {
					var process = new ffmpeg(full_filepath);
					process.then(function (video) {
						video.addCommand('-y', '');
						video
						.setVideoBitRate(2000)
						.save(__dirname + '/processed_video/' + hashResult + ".mp4", function (error, file) {
							if (!error){
								console.log('Video file: ' + file);
								return cb(null,file);
							}else{
								return cb(error);
							}
						});

					}, function (err) {
						console.log('Error: ' + err);
					});
				} catch (e) {
					console.log(e.code);
					console.log(e.msg);
					return cb(e.msg)
				}
			}
		],function(Err,Result){
			if(Err){
				return socket.emit('encodeTaskCallback', { status: "error", error: '转码中遇到错误：' + Err, filepath: full_filepath, filename: filename });
			}else{
				return socket.emit('encodeTaskCallback', { status: "finish", finish: true, filepath: full_filepath, filename: filename });
			}
			console.log(Err);
			console.log(Result);
		});
	});
});




