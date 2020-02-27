// 모듈을 추출합니다.
const express = require('express');
const bodyParser = require('body-parser');

// 변수를 선언합니다.
let items = [{
    name: '우유',
    price: '2000'
}, {
    name: '홍차',
    price: '5000'
}, {
    name: '커피',
    price: '5000'
}];

// 웹 서버를 생성합니다.
const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.all('/data.html', (request, response) => {
    let output = '';
    output += '<!DOCTYPE html>';
    output += '<html>';
    output += '<head>';
    output += ' <title>Data HTML</title>';
    output += '</head>';
    output += '<body>';
    items.forEach((item) => {
        output += '<div>';
        output += ' <h1>' + item.name + '</h1>';
        output += ' <h2>' + item.price + '</h2>';
        output += '</div>';
    });
    output += '</body>';
    output += '</html>';
    response.send(output);
});

app.all('/data.json', (request, response) => {
    response.send(items);
});

app.all('/data.xml', (request, response) => {
    let output = '';
    output += '<?xml version="1.0" encoding="UTF-8"?>';
    output += '<products>';
    items.forEach((item) => {
        output += '<product>';
        output += ' <name>' + item.name + '</name>';
        output += ' <price>' + item.price + '</price>';
        output += '</product>';
    });
    output += '</products>';
    response.type('text/xml');
    response.send(output);
});

app.all('/parameter', (request, response) => {
    const name = request.param('name');
    const region = request.param('region');

    // 응답합니다.
    response.send('<h1>' + name + ':' + region + '</h1>');
});

app.all('/parameter/:id', (request, response) => {
    // 변수를 선언합니다.
    const id = request.params.id;

    // 응답합니다.
    response.send('<h1>' + id + '</h1>');
});

app.get('/products', (request, response) => {
    response.send(items);
});

app.get('/products/:id', (request, response) => {
    // 변수를 선언합니다.
    const id = Number(request.params.id);

    if (isNaN(id)) {
        // 오류: 잘못된 경로
        response.send({
            error: '숫자를 입력하세요!'
        });
    } else if (items[id]) {
        // 정상
        response.send(items[id]);
    } else {
        // 오류: 요소가 없을 경우
        response.send({
            error: '존재하지 않는 데이터입니다!'
        });
    }
});

app.post('/products', (request, response) => {
    // 변수를 선언합니다.
    const name = request.body.name;
    const price = request.body.price;
    const item = {
        name: name,
        price: price
    };

    // 데이터를 추가합니다.
    items.push(item);

    // 응답합니다.
    response.send({
        message: '데이터를 추가했습니다.',
        data: item
    });
});

app.put('/products/:id', (request, response) => {
    // 변수를 선언합니다.
    const id = Number(request.params.id);
    const name = request.body.name;
    const price = request.body.price;

    if (items[id]) {
        // 데이터를 수정합니다.
        if (name) { items[id].name = name; }
        if (price) { items[id].price = price; }

        // 응답합니다.
        response.send({
            message: '데이터를 수정했습니다.',
            data: items[id]
        });
    } else {
        // 오류: 요소가 없을 경우
        response.send({
            error: '존재하지 않는 데이터입니다!'
        });
    }
});

app.delete('/products/:id', (request, response) => {
    // 변수를 선언합니다.
    const id = Number(request.params.id);

    if (isNaN(id)) {
        // 오류: 잘못된 경로
        response.send({
            error: '숫자를 입력하세요!'
        });
    } else if (items[id]) {
        // 정상: 데이터 삭제
        items.splice(id, 1);
        response.send({
            message: '데이터를 삭제했습니다.'
        });
    } else {
        // 오류: 요소가 없을 경우
        response.send({
            error: '존재하지 않는 데이터입니다!'
        });
    }
});

// 웹 서버를 실행합니다.
app.listen(52273, () => {
    console.log('Server Running at http://127.0.0.1:52273');
});