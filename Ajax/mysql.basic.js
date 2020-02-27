// 모듈을 추출합니다.
const mysql = require('mysql');

// 데이터베이스와 연결합니다.
const client = mysql.createConnection({
    user: 'root',
    password: 'mysql',
    database: 'Company'
});

// 데이터베이스 쿼리를 사용합니다.
client.connect();
client.query('SELECT * FROM products', (error, result, fields) => {
    if (error) {
        console.log('쿼리 문장에 오류가 있습니다.');
        console.log(error);
    } else {
        console.log(result);
    }
});
client.end();