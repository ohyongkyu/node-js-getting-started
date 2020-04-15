const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 5000
const router = require('./routes/index')

app.use('/', router)
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
//app.engine('html', require('ejs').renderFile)
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))