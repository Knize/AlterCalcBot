const telegram_token = require('./telegram_token')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

function initButton (text) {
    return {
        text: text,
        callback_data: text
    }
}

function initButtons() {
    const acButton = initButton('AC');
    const plusButton = initButton('+');
    const minusButton = initButton('-');
    const zeroButton = initButton('0');
    const oneButton = initButton('1');
    const twoButton = initButton('2');
    const threeButton = initButton('3');
    const fourButton = initButton('4');
    const fiveButton = initButton('5');
    const sixButton = initButton('6');
    const sevenButton = initButton('7');
    const eightButton = initButton('8');
    const nineButton = initButton('9');
    const emptyButton = initButton(' ')
    console.log(zeroButton);
    return [
        [acButton, plusButton, minusButton],
        [sevenButton, eightButton, nineButton],
        [fourButton, fiveButton, sixButton],
        [oneButton, twoButton, threeButton],
        [emptyButton, zeroButton, emptyButton]
    ];
}

const keyboard = initButtons();

const reply_markup = {
    inline_keyboard: keyboard
};


app.post('/new-message', function (req, res) {
    console.log('Request processing start.');
    const {callback_query} = req.body;
    const {message} = req.body;
    console.log(req.body);
    if (message != null) {
        console.log('Message: ' + message.text);
        if (message.text === '/start') {
            console.log('Start');
            sendMessage(message.chat.id, '0', reply_markup, res);
        }
    } else if (callback_query != null) {
        const {callback_query} = req.body;
        console.log('Callback processing start.');
        console.log('Callback: ' + callback_query.id + '; Inline message id: ' + callback_query.inline_message_id);
        answerCallbackQuery(callback_query.id, '', false, res);
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
        callback_query_id: query_id
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

