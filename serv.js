var express = require('express');
var path = require('path');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var controller = require('./controller/controller.js');
var adminController = new controller.AdminController();
var authController = new controller.AuthController();
var visitorController = new controller.VisitorController();
var attendenceController = new controller.AttendenceController();

var app = express();
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 
app.use(express.static('public'));
app.set('views', './view');
app.set('view engine', 'jade');
app.use(session({
    store : new FileStore({}),
    secret: process.env.COOKIE_SECRET || 'the best wedding ever',
    resave: false,
    saveUninitialized: true
}));
app.set('port', (process.env.PORT || 3000));

app.get('/', function(req, res) {
    if (authController.isAuthenticated(req))
        visitorController.view(req, res);
    else
        res.sendFile(path.join(__dirname, 'static', 'login.html'));
});

app.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname, 'static', 'login.html'));
});

app.post('/login', function(req, res) {
    var timeout = req.session.timeout || 1;
    setTimeout(function() {
        req.session.timeout = timeout * 1.15;
        authController.authenticate(req, res, function() {
            res.redirect('/');        
        })
    }, timeout);
});

app.get('/admin', function(req, res) {
    if (authController.isAuthenticated(req) && authController.isAdmin(req))
        adminController.all(req, res);
    else
        res.sendFile(path.join(__dirname, 'static', 'login.html'));
});

app.post('/admin/add', function(req, res) {
    if (authController.isAuthenticated(req) && authController.isAdmin(req))
        adminController.addInvitee(req, res);
    else
        res.sendFile(path.join(__dirname, 'static', 'login.html'));
});

app.post('/admin/edit', function(req, res) {
    if (authController.isAuthenticated(req) && authController.isAdmin(req))
        adminController.edit(req, res);
    else
        res.sendFile(path.join(__dirname, 'static', 'login.html'));
});

app.post('/attend', function(req, res) {
    attendenceController.attend(req, res);
});

app.post('/attend/custom', function(req, res) {
    attendenceController.attendCustom(req, res);
});

app.post('/nay', function(req, res) {
    attendenceController.nay(req, res);
});



app.listen(app.get('port'), function() {
    console.log('localhost:' + app.get('port'));
});
