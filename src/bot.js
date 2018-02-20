const telegram_token = require('./telegram_token')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

function initButtons() {
    const acButton = {
        text: 'AC',
        callback_data: 'AC'
    };
    const plusButton = {
        text: '+',
        callback_data: '+'
    };
    const minusButton = {
        text: '-',
        callback_data: '-'
    };
    const zeroButton = {
        text: '0',
        callback_data: '0'
    };
    const oneButton = {
        text: '1',
        callback_data: '1'
    };
    const twoButton = {
        text: '1',
        callback_data: '1'
    };
    const threeButton = {
        text: '1',
        callback_data: '1'
    };
    const fourButton = {
        text: '1',
        callback_data: '1'
    };
    const fiveButton = {
        text: '1',
        callback_data: '1'
    };
    const sixButton = {
        text: '1',
        callback_data: '1'
    };
    const sevenButton = {
        text: '1',
        callback_data: '1'
    };
    const eightButton = {
        text: '1',
        callback_data: '1'
    };
    const nineButton = {
        text: '1',
        callback_data: '1'
    };
    return [
        [acButton, plusButton, minusButton],
        [sevenButton, eightButton, nineButton],
        [fourButton, fiveButton, sixButton],
        [oneButton, twoButton, threeButton],
        [' ', zeroButton, ' '],
    ];
}

const keyword = initButtons();

const reply_markup = {
    keyboard: keyword,
    resize_keyboard: true,
    one_time_keyboard: true
};


app.post('/new-message', function (req, res) {
    const {message} = req.body;
    console.log('Request processing start.');

    console.log('Message: ' + message.text);
    if (message.text === '/start') {
        console.log('Start');
        axios.post('https://api.telegram.org/bot' + telegram_token + '/sendMessage', {
            chat_id: message.chat.id,
            text: '0',
            reply_markup: reply_markup
        })
            .then(response => {
                console.log('Message posted');
            })
            .catch(err => {
                console.log('Error :', err);
            });
    }

});

app.listen(process.env.PORT, function () {
    console.log('We are up!');
});

