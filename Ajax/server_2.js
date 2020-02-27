// 모듈을 추출합니다.
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

// 데이터베이스와 연결합니다.
const client = mysql.createConnection({
    user: 'root',
    password: 'mysql',
    database: 'Company'
});

// 웹 서버를 생성합니다.
const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// 전체 데이터 조회
app.get('/products', (request, response) => {
    // 데이터베이스 요청을 수행합니다.
    client.query('SELECT * FROM products', (error, data) => {
        response.send(data);
    });
});

// 개별 데이터 조회
app.get('/products/:id', (request, response) => {
    // 변수를 선언합니다.
    const id = Number(request.params.id);

    // 데이터베이스 요청을 수행합니다.
    client.query('SELECT * FROM products WHERE id=?', [
        id
    ], (error, data) => {
        response.send(data);
    });
});

// 데이터 추가
app.post('/products', (request, response) => {
    // 변수를 선언합니다.
    const name = request.body.name;
    const modelnumber = request.body.modelnumber;
    const series = request.body.series;

    // 데이터베이스 요청을 수행합니다.
    client.query('INSERT INTO products (name, modelnumber, series) VALUES(?,?,?)', [
        name, modelnumber, series
    ], (error, data) => {
        response.send(data);
    });
});

// 데이터 수정
app.put('/products/:id', (request, response) => {
    // 변수를 선언합니다.
    const id = Number(request.params.id);
    const name = request.body.name;
    const modelnumber = request.body.modelnumber;
    const series = request.body.series;
    let query = 'UPDATE products SET '

    // 쿼리를 생성합니다.
    if (name) query += 'name="' + name + '" ';
    if (modelnumber) query += 'modelnumber="' + modelnumber + '" ';
    if (series) query += 'series="' + series + '" ';
    query += 'WHERE id=' + id;

    // 데이터베이스 요청을 수행합니다.
    client.query(query, (error, data) => {
        response.send(data);
    });
});

// 데이터 삭제
app.delete('/products/:id', (request, response) => {
    // 변수를 선언합니다.
    const id = Number(request.params.id);

    // 데이터베이스 요청을 수행합니다.
    client.query('DELETE FROM products WHERE id=?', [
        id
    ], (error, data) => {
        response.send(data);
    });
});

// 웹 서버를 실행합니다.
app.listen(52273, () => {
    console.log('Server Running at http://127.0.0.1:52273');
});