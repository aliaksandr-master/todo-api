Server = function(){

    this.http      = require('http');
    this.path      = require('path');
    this.fs        = require('fs');
    this.port      = 80;
    this.server    = null;
    this.directory = __dirname;

};


Server.prototype = {

    /*
     *
     * Starts web server
     *
     * */

    start: function(){

        var me = this;

        console.log('Node.js Web Server');

        this.server = this.http.createServer(function (request, response) {

            var filePath = me.path.join(
                me.directory, (
                    /^([^.]+)$/.test(request.url)
                        ? 'index.html'
                        : request.url
                )
            );
            filePath = filePath.replace(/\?.+/,"");
            me.fs.exists(filePath, function(exists) {
                if (exists) {
                    me.fs.readFile(filePath, function(error, content) {
                        if (error) {
                            throw error;
                            response.writeHead(200, {'Content-Type': 'text/plain'});
                            response.end("Error!");
                        } else {
                            var contentType = me.detectMIME(filePath);
                            response.writeHead(200, { 'Content-Type': contentType });
                            response.end(content, 'utf-8');
                        }
                    });
                } else {
                    console.log(filePath, "is not exists!");
                    response.writeHead(404);
                    response.end();
                }
            });

        }).listen(this.port);

        console.log('Server running at http://127.0.0.1:' + this.port.toString() + '/');


    },
    detectMIME: function (file) {
        var mime = 'application/octet-stream';
        switch (file.split('.').pop()) {
            case 'html' :
                mime = 'text/html';
                break;
            case 'hbs' :
                mime = 'text/html';
                break;
            case 'js'   :
                mime = 'text/javascript';
                break;
            case 'css'  :
                mime = 'text/css';
                break;
            case 'png'  :
                mime = 'image/png';
                break;
            case 'gif'  :
                mime = 'image/gif';
                break;
            case 'jpg'  :
            case 'jpeg' :
                mime = 'image/jpeg';
                break;
        }
        return mime;
    }

};

(new Server()).start();
