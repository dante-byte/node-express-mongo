const express = require('express');
const app = express();
const layouts = require("express-ejs-layouts");
const homeController = require('./controllers/homeController');
const errorController = require('./controllers/errorController');
const http = require('http');
const fs = require('fs');
const path = require('path')
const mrs = require('multipart-read-stream');
const pump = require('pump');
const form = fs.readFileSync(path.join(__dirname, 'views', 'form.ejs'));


app.set("view engine", 'ejs');
app.set('port', process.env.PORT || 3000);

app.use(express.json());
app.use(layouts);
app.use(express.static('public'));
app.use(express.urlencoded({

    extended: false
}))

app.get('/home', (req,res) => {

    res.send("home");
});


http.createServer((req, res) => {

    if (req.method === 'GET') {

        get(res)
        return
    }

    if (req.method === 'POST') {

        post(req,res)
        return
    }

    reject(405, 'Method Not Allowed', res)

}).listen(3000)

get = (res) => {

    res.writeHead(200, {
        'Content-Type': 'text/html'
    })
    res.end(form);
};

reject = (code, msg, res) => {

    res.statusCode = code
    res.end(msg);
}

post = (req, res) => {

    if (!/multipart\/form-data/.test(req.headers['content-type'])) {

        reject(415, 'Unsupported Media Type', res)
        return
    }

    console.log('parsing multipart data');
    const parser = mrs(req.headers, part);
    var total = 0;
    pump(req, parser);
}

function part (field, file, name) {

    if (!name) {
        file.resume();
        return
    }
    

    total += 1
    const filename = `${field}-${Date.now()}-${name}`
    const dest = fs.createWriteStream(path.join(__dirname, 'uploads', filename))
    pump(file, dest, (err) => {

        total -= 1
        res.write(err? `Error saving ${name}!\n` : `${name} successfully saved!\n`);
    })
    
}






app.get('/home', homeController.vhome);
app.get('/form',homeController.vform);




// app.listen(app.get('port'), () => {

//     console.log(`server started on port ${app.get('port')}`);
    
// })

