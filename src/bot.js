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
        text: '2',
        callback_data: '2'
    };
    const threeButton = {
        text: '3',
        callback_data: '3'
    };
    const fourButton = {
        text: '4',
        callback_data: '4'
    };
    const fiveButton = {
        text: '5',
        callback_data: '5'
    };
    const sixButton = {
        text: '6',
        callback_data: '6'
    };
    const sevenButton = {
        text: '7',
        callback_data: '7'
    };
    const eightButton = {
        text: '8',
        callback_data: '8'
    };
    const nineButton = {
        text: '9',
        callback_data: '9'
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
    resize_keyboard: true
};


app.post('/new-message', function (req, res) {
    console.log('Request processing start.');
    const {callback_query} = req.body;
    const {message} = req.body;
    console.log(req.body);
    if (callback_query != null) {
        const {callback_query} = req.body;
        console.log('Callback processing start.');
        console.log('Callback: ' + callback_query.id + '; Inline message id: ' + callback_query.inline_message_id);
        answerCallbackQuery(callback_query, '', false, res);
    }
    if (message != null) {
        console.log('Message: ' + message.text);
        if (message.text === '/start') {
            console.log('Start');
            sendMessage(message.chat.id, '0', reply_markup, res);
        }
    }
    res.end('ok');
});

app.listen(process.env.PORT, function () {
    console.log('We are up!');
});


function sendMessage(chatId, text, reply_markup = null, res) {
    axios.post('https://api.telegram.org/bot' + telegram_token + '/sendMessage', {
        chat_id: chatId,
        text: text,
        reply_markup: reply_markup
    })
        .then(response => {
            console.log('Message posted');
            res.end('ok')
        })
        .catch(err => {
            console.log('Error :', err);
            res.end('Error: ' + err);
        });
}

function answerCallbackQuery(query_id, text, show_alert, res) {
    axios.post('https://api.telegram.org/bot' + telegram_token + '/answerCallbackQuery', {
        query_id: query_id
    })
        .then(response => {
            console.log('Query ' + query_id + ' processed');
            res.end('ok')
        })
        .catch(err => {
            console.log('Error :', err);
            res.end('Error: ' + err);
        });

}

function editMessageText(chat_id, text, message_id) {

}

