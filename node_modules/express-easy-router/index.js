var express = require('express');
var easyRouter=new Array();

 
var mount_path=	//The first argument for route group,can be mount path or any other thing,for routeGroup.
	middle_wares=null;	//Deal with three arguments condition,middlewares for routeGroup.

var suffix=null //Enable or Disable add 'html'suffix to the end of request url,which is good for SEO.

var routerMethods={
	get:'get',
	post:'post',
}

var routerAction=function(args,method){
	
		var arglength=args.length; //Get the arguments length.
        var v1=args[0];		 //Get the first argument.
		var cmdstr='';		 //
        if(arglength===3)			
        { if(suffix!==null&v1!='/')
			{
				v1+='.'+suffix;
			}	
		    var str=args[2];//The third argument,could be path of view or callback function.			
			var v2=args[1];//we don't do anything here.
			if((typeof str!='string')||str.constructor!=String)
			{
				
				cmdstr='v1,v2,str'; 
			}
			else
			{
            var v3=args[2].split('@');
            var obj=require(v3[0]);
			var action=v3[1];			
            var cbkstr='obj.'+action;      
            cmdstr='v1,v2,eval(cbkstr)';
			}
        }else if(arglength===2)
        {   
			if(suffix!==null&v1!='/')
			{
				v1+='.'+suffix;
			}
			var str=args[1];//The second argument,could be path of view or callback function.
			if((typeof str!='string')||str.constructor!=String)
			{
				
				cmdstr='v1,str';
				
			}
			else
			{
			var v2=args[1].split('@');	
            var obj=require(v2[0]);
			var action=v2[1];			
            var cbkstr='obj.'+action;
			
			
            
			cmdstr='v1,eval(cbkstr)';
			}
			
        }
		else if(arglength===1)
        {
        
		cmdstr='v1';
        }
			//This is for route group
		var routeMounter={
			mountPath:mount_path===null?null:mount_path,
			middleWare:middle_wares===null?null:middle_wares,
			router:express.Router(),
		}
		
		var exestr="routeMounter.router."+method+"("+cmdstr+")";
		eval(exestr);
		easyRouter.push(routeMounter);
}

	//Router's get method

module.exports.get=function(){
	
	routerAction(arguments,routerMethods.get);
	
},

//Router's post method
module.exports.post=function(){
	routerAction(arguments,routerMethods.post);
}

//Router's group method
module.exports.group=function(){
	var args=arguments;//All arguments we got.
	var arglength=args.length;	
	var v1=args[0];
	
	
	if(arglength===1)//If only one argument,we can handle it here,it's got be app level middleware.
	{
		var routeMounter={
			mountPath:null,
			middleWare:v1,
			router:null
		};
		easyRouter.push(routeMounter);
	}
	else if(arglength===2)
	{	var routerLength=easyRouter.length;
		
		mount_path=args[0];
		var fn=args[1];		
		try{
			fn();
			mount_path=middle_wares=null;//We must put it back,or conflicts will made.
			
		}
		catch(err)
		{
			var routeMounter={
			mountPath:mount_path,
			middleWare:fn,
			router:null
		};
		easyRouter.push(routeMounter);
		
			//console.log(err.message)
		}
		
		//console.log('%d and %d',routerLength,easyRouter.length);
		
	}
	else if(arglength===3) //If we got three arguments,the second argument must be middleware.
	{	mount_path=v1;
		middle_wares=args[1];
		var fn=args[2];
		fn();
		mount_path=middle_wares=null;//We must put it back,or conflicts will made.
	}
	
}

//Bind routers to app
module.exports.bind=function(app){
	
	
		
		easyRouter.map(function(routeMounter){
			/* 
			  This is for easyRouter.get()/easyRouter.post()			  
			*/
			if(routeMounter.mountPath===null&routeMounter.middleWare===null&routeMounter.router!=null)	
			{	//console.log('1') 
				app.use(routeMounter.router)
			}
			 
			/*  
			This is for easyRouter.group()with one argument
				  eg. easyRouter.group(function(req,res){
				  	console.log('hi!');
				  	}	
			*/  
			else if(routeMounter.mountPath===null&routeMounter.router===null&routeMounter.middleWare!=null)
			{	//console.log('2') 
				app.use(routeMounter.middleWare)
			}
			/*
				This is for easyRoute.group()with two arguments
				mount path and middleware
				easyRoute.group('/888',function(req,res){
					 res.send('hi,there!');
				 })				
				 })
				 */

				   
			else if(routeMounter.router===null&routeMounter.mountPath!=null&routeMounter.middleWare!=null){
				//console.log('3') 
				app.use(routeMounter.mountPath,routeMounter.middleWare);
			}
				/*
				This is for easyRoute.group()with two arguments
				mount path and router
				 easyRoute.group('/888',function(){
					 easyRoute.get('/abc','./page@index');
					 easyRoute.get('/a',function(req,res){
						 res.send('you got it!');
					 });
				 })
				 */
			else if(routeMounter.router!=null&routeMounter.mountPath!=null&routeMounter.middleWare===null){
				//console.log('4') 
				app.use(routeMounter.mountPath,routeMounter.router);
			}
			/*
				This is for easyRoute.group()with two arguments
				mount path and router
				 easyRoute.group('/888',function(req,res,next){
				do something here...
					next();
				},
				function(){
					 easyRoute.get('/abc','./page@index');
					 easyRoute.get('/a',function(req,res){
						 res.send('you got it!');
					 });
				 })
			*/	 
			else if(routeMounter.mountPath!=null&routeMounter.middleWare!=null&routeMounter.router!=null)
			{
				//console.log('5') 
				app.use(routeMounter.mountPath,routeMounter.middleWare,routeMounter.router);	
			}
			
		})
}

/**
 * Import folder as object so you can easily import each controller or modles at once.
 */
module.exports.importer=function(rel_dir)
{
	var importer=require('./lib/importer')(rel_dir);
	
   return importer;
}

/**
 * Add .html at end of the request url.
 */
module.exports.enableseo=function(suf){
	suffix=suf;
};