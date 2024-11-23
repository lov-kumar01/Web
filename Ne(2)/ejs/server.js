import express from 'express';
import bodyParser from 'body-parser';
import mongoose from "mongoose";
const app = express ();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/db', { 
    useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.error('MongoDB connection error:',
    err));
    
let data = [
     { username: 'user1', courses: 'Math, Science', year: 2021, fee: 5000 },
     { username: 'user2', courses: 'History, Arts', year: 2022, fee: 4500 },
    { username: 'user3', courses: 'Physics, Chemistry', year: 2023, fee: 6000 }
];

app.get('/', (req, res) => {
    res.render('index', { data: data });
});

app.post('/add', (req, res) => {
    const newData = {
        username: req.body.username,
        courses: req.body.courses,
        year: parseInt(req.body.year),
        fee: parseInt(req.body.fee)
        session:parseInt(req,body.session)
    };
    data.push(newData);
    res.redirect('/');
});

app.post('/update', (req, res) => {
    const index = req.body.index;
    const updatedData = {
        username: req.body.username,
        courses: req.body.courses,
        year: parseInt(req.body.year),
        fee: parseInt(req.body.fee)
        session:parseInt(req,body.session)
    };
    data[index] = updatedData;
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
