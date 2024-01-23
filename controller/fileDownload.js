const fs = require('fs');


const DownloadFile=async(req,res,next)=>{
    
    var file = fs.readFileSync(__dirname + '/uploads/1699761077208Elon.png', 'binary');

    // res.setHeader('Content-Length', file.length);
    res.write(file, 'binary');
    res.end();
}
module.exports={DownloadFile}