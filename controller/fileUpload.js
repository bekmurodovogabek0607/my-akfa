const tolov = require("../model/tolov");



const UploadFileFunc = async (req, res,next) => {
    let sampleFile;
    let uploadPath;
    
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.sampleFile;
    
    uploadPath ='uploads/' + Date.now()+ sampleFile.name ;
   console.log(uploadPath);
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, function (err) {
        if (err)
            return res.status(500).send(err);
      
        res.send(uploadPath);
    });
   
    console.log(req.files);
}

module.exports={UploadFileFunc}