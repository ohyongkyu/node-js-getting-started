const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const router = require('./routes/index');
const mongoose = require('./conn');
const PORT = process.env.PORT || 5000;

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

app.use(session({
    saveUninitialized:true,
    resave:true,
    secret:'sweetnight',
    store: new MongoStore({ 
        mongooseConnection: mongoose.connection,
        ttl: 60 * 10
    })
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use('/', router)
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
//app.engine('html', require('ejs').renderFile)
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))