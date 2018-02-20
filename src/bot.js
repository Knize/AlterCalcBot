const telegram_token = require('./telegram_token')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const keyboard = [
    ['AC', '+', '-'],
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    [' ', '0', ' '],
];

const reply_markup = {
    keyboard: keyboard,
    resize_keyboard: true,
    one_time_keyboard: true
};



app.post('/new-message', function (req, res) {
    const {message} = req.body;
    console.log('Request processing start.');

    if (!message || message.text.toLowerCase().indexOf('marco') < 0) {
        console.log('Not match');
        return res.end()
    }

    if(message === '/start'){
        console.log('Start');
        axios.post('https://api.telegram.org/bot' + telegram_token + '/sendMessage', {
            chat_id: message.chat.id,
            text: 'Polo!!',
            reply_markup: reply_markup
        })
            .then(response => {
                console.log('Message posted');
            })
            .catch(err => {
                console.log('Error :', err);
            });
    }

    console.log('Sending response');
    axios.post('https://api.telegram.org/bot' + telegram_token + '/sendMessage', {
        chat_id: message.chat.id,
        text: 'Polo!!',
    })
        .then(response => {
            console.log('Message posted');
            res.end('ok');
        })
        .catch(err => {
            console.log('Error :', err);
            res.end('Error :' + err);
        })
});

app.listen(process.env.PORT, function () {
    console.log('We are up!');
});


