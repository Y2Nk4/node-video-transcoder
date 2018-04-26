/**
 * This file is for you to import controllers,modles,or any another folder based files.
 */
var fs = require('fs');
var path = require('path');

module.exports=function(from){

		
		var imported = {};
		
		fs.readdirSync(from).forEach(function (name) {			
				// only import files that we can `require`
				var ext = path.extname(name);
				var base = path.basename(name, ext);
				if (require.extensions[ext]) {
                    imFile=path.join(process.cwd(),from,'//', name);
                    imported[base] = require(imFile);
				} else {
					
				}
                
			}
		);

		return imported;
	
}