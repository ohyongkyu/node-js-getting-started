const mongoose = require('mongoose');
mongoose.connect(
    'mongodb+srv://appstore:cafe24@001@sweetnight-8xan9.mongodb.net/apps?retryWrites=true&w=majority', 
    {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    }
);
const db = mongoose.connection;
db.once('open', () => {
    console.log('Successfully connected to MongoDB using Mongoose!');
});
db.on('error', (err) => {
    console.log(`Error on DB Connection : ${err}`);
});