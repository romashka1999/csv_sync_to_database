const HttpStatus = require('http-status-codes');

const uploadFile = (file) => {

    const fn = file.name;
    const fileExtension = fn.slice((Math.max(0, fn.lastIndexOf(".")) || Infinity));
    if(fileExtension !== '.csv') {
        throw { error: 'only csv file is allwed', code: HttpStatus.UNSUPPORTED_MEDIA_TYPE };
    }
    const fileName = Date.now() + fileExtension;
    const filePath = `./uploads/${fileName}`;
    file.mv(filePath, function(err) {
        if (err){
          throw { error: err, code: HttpStatus.INTERNAL_SERVER_ERROR };
        }
        else{
            console.log('csv uploaded to the server');
        }
    });
    return filePath;
}

module.exports = {
  uploadFile
}

