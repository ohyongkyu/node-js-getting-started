const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const router = require('./routes/index');
const PORT = process.env.PORT || 5000;

process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use('/', router)
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
//app.engine('html', require('ejs').renderFile)
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))