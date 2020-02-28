// 모듈을 구성합니다.
const express = require('express');
const bodyParser = require('body-parser');

// 웹 서버를 생성합니다.
const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// 변수를 선언합니다.
let messages = [];

// 웹 서버를 라우트합니다.
app.get('/messages', (request, response) => {
    response.send(messages);
});

app.post('/messages', (request, response) => {
    // 변수를 선언합니다.
    const name = request.body.name;
    const content = request.body.content;
    const message = {
        name: name,
        content: content
    };

    // 데이터를 추가합니다.
    messages.push(message);

    // 응답합니다.
    response.send({
        message: '데이터를 추가했습니다.',
        data: message
    });
});

// 웹 서버를 실행합니다.
app.listen(52273, () => {
    console.log('Server Running at http://127.0.0.1:52273');
});