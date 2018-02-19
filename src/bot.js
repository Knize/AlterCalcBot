const telegram_token = require('./telegram_token')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

axios.post('https://api.telegram.org/bot' + telegram_token +
    '/setWebhook?https://frozen-atoll-64089.herokuapp.com/')
    .then(response => {
        console.log("Webhook been set.")
    })
    .catch(err => {
        console.log('Error :', err);
    });

app.post('/new-message', function (req, res) {
    const {message} = req.body;
    console.log('Request processing start.');

    if (!message || message.text.toLowerCase().indexOf('marco') < 0) {
        console.log('Not match');
        return res.end()
    }

    console.log('Sending response');
    axios.post('https://api.telegram.org/bot' + telegram_token + ' /sendMessage', {
        chat_id: message.chat.id,
        text: 'Polo!!'
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