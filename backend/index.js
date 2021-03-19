const express = require('express')
const session = require('express-session')
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

let users_path = path.join(__dirname + '/../data/users.json');
let rawdata = fs.readFileSync(users_path);
let users = JSON.parse(rawdata);

app.use(
    session({
        secret: 'secret_key',
        saveUninitialized: true,
    })
)

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use(express.static(__dirname + '/../frontend'));

app.get('/', (req, res) => {
    if(req.session.user_id){
        for(let i = 0; i < users.length; i++){
            let user = users[i];
            if(user.login == req.session.user_id){
                res.redirect('/account');
                break;
            }
        }
    } else {
        res.redirect('/login')
    }
})

app.get('/login', (req, res) => {
    console.log(req.session.user_id, users)
    if(req.session.user_id){
        for(let i = 0; i < users.length; i++){
            let user = users[i];
            console.log(user);
            if(user.login == req.session.user_id){
                res.redirect('/account');
                break;
            }
        }
    }
    res.sendFile(path.join(__dirname + '/../frontend/login.html'))
})

app.post('/login', (req, res) => {
    let body = req.body;
    let message = '';
    let status = 0;
    if(body.login == ''){
        message += 'Login is required<br>';
    }
    if(body.pwd == ''){
        message += 'Password is required<br>';
    }
    for(let i = 0; i < users.length; i++){
        let user = users[i];
        if(user.login == body.login && user.password == body.pwd){
            status = 1;
        }
    }

    if(message == '' && status == 0){
        message += 'Login or password not valid'
    }

    if(status == 1 && message == ''){
        req.session.user_id = body.login;
    }
    res.json({status, message});
})

app.get('/reg', (req, res) => {
    res.sendFile(path.join(__dirname + '/../frontend/registration.html'))
})

app.post('/reg', (req, res) => {
    let body = req.body;
    let message = '';
    let status = 0;
    if(body.email == ''){
        message += 'Email is required<br>';
    }
    if(body.login == ''){
        message += 'Login is required<br>';
    }
    if(body.pwd == ''){
        message += 'Password is required<br>';
    }
    if(body.pwd_confirm == ''){
        message += 'Confirm password is required<br>';
    }
    if(body.pwd != body.pwd_confirm){
        message += 'Passwords are not equal<br>'
    }
    console.log(users);
    for(let i = 0; i < users.length; i++){
        let user = users[i];
        if(user.login == body.login){
            message += 'Login already exists';
        }
    }

    if(message == ''){
        status = 1;
    }

    if(status == 1){
        users.push({
            email: body.email,
            login: body.login,
            password: body.pwd
        });
        fs.writeFile(users_path, JSON.stringify(users), 'utf8', (err) => {
            if(err){
                console.log(err);
            } else {
                req.session.user_id = body.login;
            }
        });
    }
    res.json({status, message});
})

app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname + '/../frontend/account.html'))
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})