const telegram_token = require('./telegram_token')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const NOTHING_CHANGED = 'nothing_changed';
const PADDING_WIDTH = 45;

function initButton(text) {
    return {
        text: text,
        callback_data: text
    }
}

class CalcSession {
    constructor(message_id) {
        this.message_id = message_id;
        this.isResult = false;
        this.lastAction = null;
        this.lastOperand = null;
    }
}

String.prototype.leftPad = function (size) {
    let s = String(this);
    while (s.length < (size || 2)) {
        s = ' ' + s;
    }
    return '|' + s;
};

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
    const equalsButton = initButton('=');
    const multiplyButton = initButton('*');
    return [
        [multiplyButton, plusButton, minusButton],
        [sevenButton, eightButton, nineButton],
        [fourButton, fiveButton, sixButton],
        [oneButton, twoButton, threeButton],
        [acButton, zeroButton, equalsButton]
    ];
}

const keyboard = initButtons();

const reply_markup = {
    inline_keyboard: keyboard
};

const sessionCache = new Map();


app.post('/new-message', function (req, res) {
    console.log('Request processing start.');
    const {callback_query} = req.body;
    const {message} = req.body;
    console.log(req.body);
    if (message != null) {
        console.log('Message: ' + message.text);
        if (message.text === '/start') {
            console.log('Start');
            // TODO get sent message id properly
            sessionCache.set(message.chat.id, new CalcSession(message.message_id + 1));
            sendMessage(message.chat.id, '0'.leftPad(PADDING_WIDTH), reply_markup, res);
        }
    } else if (callback_query != null) {
        const {callback_query} = req.body;
        console.log('Callback processing start.');
        console.log('Callback: ' + callback_query.id + '; Data: ' + callback_query.data);
        if (callback_query.data !== ' ') {
            const oldText = strip(callback_query.message.text);
            const data = callback_query.data;
            const chat_id = callback_query.message.chat.id;
            const result = newProcessAction(oldText, data, chat_id);
            const paddedResult = result.leftPad(PADDING_WIDTH);
            if (result !== NOTHING_CHANGED) {
                editMessageText(callback_query, paddedResult, res);
            }
        }
        answerCallbackQuery(callback_query.id, '', false, res);
    }
    res.end('ok');
});

app.listen(process.env.PORT, function () {
    console.log('We are up!');
});


function sendMessage(chatId, text, reply_markup = null, res) {
    return axios.post('https://api.telegram.org/bot' + telegram_token + '/sendMessage', {
        chat_id: chatId,
        text: text,
        reply_markup: reply_markup
    })
        .then(response => {
            console.log('Message ' + ' posted');
            res.end('ok');
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
            res.end('ok');
        })
        .catch(err => {
            console.log('Error :', err);
            res.end('Error: ' + err);
        });
}

function editMessageText(callback_query, text, res) {
    const query_id = callback_query.id;
    const chat_id = callback_query.message.chat.id;
    axios.post('https://api.telegram.org/bot' + telegram_token + '/editMessageText', {
        chat_id: chat_id,
        message_id: sessionCache.get(chat_id).message_id,
        text: text,
        reply_markup: reply_markup
    })
        .then(response => {
            console.log('Edit ' + sessionCache.get(chat_id) + ' to text ' + text + ' processed');
            answerCallbackQuery(query_id, '', false, res);
            res.end('ok');
        })
        .catch(err => {
            console.log('Error :', err);
            res.end('Error: ' + err);
        });
}

function newProcessAction(expression, action, chat_id) {
    console.log("Process action");
    switch (true) {
        case action === '=':
            console.log("case: =");
            const lastAction = sessionCache.get(chat_id).lastAction;
            const lastOperand = sessionCache.get(chat_id).lastOperand;
            if (lastAction != null && lastOperand != null) {
                return evaluate(expression)
            }
            return eval(expression).toString();
        case action === 'AC':
            console.log("case: AC");
            return '0';
        case isOperator(action):
            console.log("case: isOperator");
            if (expression === '0') {
                if (action === '+') return NOTHING_CHANGED;
                if (action === '-') return substituteLastOperand(expression, action);
            }
            if (expression === '-' && action === '+') return '0';
            if (isNumber(expression)) return expression + action;
            if (lastIsOperator(expression)) return expression.slice(0, expression.length - 1) + action;
            return eval(expression).toString() + action;
        default:
            console.log("case: default");
            if (expression === '0' && action === '0') return NOTHING_CHANGED;
            if (expression === '0') return action;
            if (sessionCache.get(chat_id).isResult) {
                sessionCache.get(chat_id).isResult = false;
                return action;
            }
            return expression + action;
    }
}

function processAction(expression, action, chat_id) {
    console.log("Process action");
    switch (true) {
        case action === '=':
            console.log("case: =");
            sessionCache.get(chat_id).isResult = true;
            return eval(expression).toString();
        case action === 'AC':
            console.log("case: AC");
            sessionCache.get(chat_id).isResult = false;
            return '0';
        case isOperator(action):
            console.log("case: isOperator");
            sessionCache.get(chat_id).isResult = true;
            if (expression === '0') {
                if (action === '+') return NOTHING_CHANGED;
                if (action === '-') return substituteLastOperand(expression, action);
            }
            if (expression === '-' && action === '+') return '0';
            if (lastIsOperator(expression)) return expression.slice(0, expression.length - 1) + action;
            return expression + action;
        default:
            console.log("case: default");
            if (expression === '0' && action === '0') return NOTHING_CHANGED;
            if (expression === '0') return action;
            if (sessionCache.get(chat_id).isResult) {
                sessionCache.get(chat_id).isResult = false;
                return action;
            }
            if (lastIsZero(expression)) return substituteLastOperand(expression, action);
            return expression + action;
    }
}

function isOperator(action) {
    return action === '+' || action === '-' || action === '*';
}

function lastIsOperator(expression) {
    return isOperator(expression.slice(-1));
}

function lastIsZero(expression) {
    return expression.slice(-1) === '0';
}

function substituteLastOperand(expression, action) {
    return expression.slice(0, expression.length - 1) + action;
}

function isNumber(expression) {
    return !(expression.includes('+') || expression.includes('-') || expression.includes('*'));

}

function strip(str) {
    const noLine = str.slice(1);
    const result = noLine.trim();
    console.log('Stripped expression: ' + result)
    return result;
}

function evaluate(leftOperand, rightOperand, operator) {
    switch (operator) {
        case '+':
            return leftOperand + rightOperand;
        case '-':
            return leftOperand - rightOperand;
        case '*':
            return leftOperand * rightOperand;
        default:
            return 'NaN'
    }
}