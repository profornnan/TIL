# axios 모듈을 통한 웹 서버와의 통신 (AJAX)

node.js와 브라우저를 위한 http통신 javascript 라이브러리



## 메뉴얼

https://github.com/axios/axios



## 특징

* 브라우저에서는 XMLHttpRequests 를 생성
* node.js에서는 http 요청 생성
* Promise API 지원
* 요청과 응답을 중단
* JSON 데이터 자동 변환
* 요청 취소
* XSRF로부터 보호하기 위한 클라이언트 측 지원



## 설치

npm

```bash
$ npm install axios
```



yarn

```bash
$ yarn add axios
```



cdn

```html
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
```



## 불러오기

```js
import axios from 'axios';
```



## GET 요청

```js
axios.get('/user?id=12345')
    .then( res => { console.log(res); } )
    .catch( res => { console.log(res); } );

axios.get('/user', {
        params: { id: '12345' }
    })
    .then( res => { console.log(res) } );
    .catch( res => { console.log(res) } );
```



## POST 요청

```js
axios.post('/msg', {
        user: 'Fred',
        message: 'hi'
    })
    .then( res => { console.log(res) } )
    .catch( res => { console.log(res) } );
```



