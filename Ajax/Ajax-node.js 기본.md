# Ajax

## node.js 기본



### Ajax 개요

Ajax는 구현하는 방식을 뜻하는 말이다.

Ajax를 사용하면 페이지를 전환하지 않고 서버에서 데이터를 받아와 사용자에게 보여줄 수 있다.

ex) 페이스북이나 트위터 같은 SNS



### 데이터 전송 형식

서버와 클라이언트가 데이터를 주고 받을 때는 특정한 형식을 맞춰야 한다.

CSV, XML, JSON



#### 1. CSV 형식

* CSV(Comma Seperated Values)는 각 항목을 쉼표로 구분해 데이터를 표현하는 방법이다.
* 다른 형식에 비해 굉장히 짧다. => 많은 양의 데이터를 전송할 때 활용하면 좋다.
* 가독성이 떨어진다.
* `split()` 메서드로 분해한다.



#### 2. XML 형식

* XML 형식은 HTML 형식처럼 태그로 데이터를 표현한다.
* 각각의 데이터가 어떠한 것을 의미하는지 알 수 있다.
* 대부분의 정보 제공 사이트에서 제공하는 RSS 형식도 XML 형식을 기반으로 만든 것이다.
* HTML 처럼 각각의 태그에 사용자 정의 속성을 넣어 데이터를 표현할 수 있으므로 복잡한 데이터를 전달할 수 있다.
* 닫는 태그와 여는 태그 등이 쓸데 없이 용량을 차지하는 문제가 있다.



#### 3. JSON 형식

* CSV 형식과 XML 형식의 단점을 모두 극복한 형식이다.
* JSON(JavaScript Object Notation)은 자바스크립트에서 사용하는 객체 형태로 데이터를 표현하는 방법이다.
* Ajax를 사용할 때 거의 표준으로 사용되는 데이터 표현 방식이다.
* JSON에는 객체, 배열, 문자열, 숫자, 불, null만 들어갈 수 있다.
* 문자열은 무조건 큰따옴표를 사용해야 한다.
* CSV 형식과 달리 데이터의 가독성이 좋다.
* XML 형식보다 적은 용량으로 데이터를 전달할 수 있다.



### node.js 개요와 설치

#### node.js 개요

* 2008년에 크롬 웹 브라우저가 출시되면서 자바스크립트의 속도가 점점 빨라지자 자바스크립트를 웹 브라우저가 아닌 곳에서 쓸 수 있게 만들자는 의견이 많아졌다. => CommonJS 표준이 작성된다.
* node.js는 CommonJS 표준에 따라 라이언 달이 크롬 V8 엔진을 기반으로 개발한 플랫폼이다.
* node.js를 사용하면 웹 브라우저가 아닌 곳에서 자바스크립트로 프로그램을 개발할 수 있다.



#### node.js 설치

https://nodejs.org/ko/

짝수 버전으로 설치

`Next` 버튼을 눌러 설치



### 기본 파일 실행

C:\node 디렉터리 생성

Visual Studio Code 실행 => C:\node 폴더 열기



JavaScript.js

```js
let output = '';
for (let i = 0; i < 10; i++) {
    console.log(output += '*');
}
```



터미널 => 새 터미널

```powershell
PS C:\node> node .\JavaScript.js
*   
**  
*** 
****
*****
******
*******
********
*********
**********
```



### 내부 모듈

* Node.js는 기능을 확장하고자 모듈이라는 개념을 사용한다.
* 모듈 중에서 Node.js에 기본적으로 있는 모듈을 내부 모듈이라고 한다.
* 내부 모듈은 http://nodejs.org/dist/latest-v6.x/docs/api/ 의 문서에서 확인할 수 있다. `-v6.x` 부분을 변경하면, 다른 버전의 최신 문서를 확인할 수 있다.



os 모듈을 선택해 os 모듈 페이지로 이동한다.

http://nodejs.org/dist/latest-v6.x/docs/api/os.html

os 모듈을 어떻게 사용해야 하는지 나온다.



JavaScript.js

```js
// 모듈을 추출합니다.
const os = require('os');

// 속성을 추출합니다.
console.log(os);
```



터미널

```powershell
PS C:\node> node .\JavaScript.js
{
  arch: [Function: arch] { [Symbol(Symbol.toPrimitive)]: [Function] },
  cpus: [Function: cpus],
  endianness: [Function: endianness] { [Symbol(Symbol.toPrimitive)]: [Function] },
  freemem: [Function: getFreeMem] { [Symbol(Symbol.toPrimitive)]: [Function] },
  getPriority: [Function: getPriority],
  ...
```



#### os 모듈의 메서드

* hostname()
  * 운영체제의 호스트 이름을 리턴한다.
* type()
  * 운영체제의 이름을 리턴한다.
* platform()
  * 운영체제의 플랫폼을 리턴한다.
* arch()
  * 운영체제의 아키텍처를 리턴한다.
* release()
  * 운영체제의 버전을 리턴한다.
* uptime()
  * 운영체제가 실행된 시간을 리턴한다.
* loadavg()
  * 로드 에버리지 정보를 담은 배열을 리턴한다.
* totalmem()
  * 시스템의 총 메모리를 리턴한다.
* cpus()
  * CPU의 정보를 담은 객체를 리턴한다.
* getNetworkInterfaces()
  * 네트워크 인터페이스의 정보를 담은 배열을 리턴한다.



JavaScript.js

```js
// 모듈을 추출합니다.
const os = require('os');

// 모듈을 사용합니다.
console.log(os.hostname());
console.log(os.type());
console.log(os.platform());
console.log(os.arch());
console.log(os.release());
console.log(os.uptime());
console.log(os.loadavg());
console.log(os.totalmem());
console.log(os.freemem());
console.log(os.cpus());
console.log(os.networkInterfaces());
```



터미널

```powershell
PS C:\node> node .\JavaScript.js
DESKTOP-U4D3D30
Windows_NT
win32
x64
10.0.18362
905698
[ 0, 0, 0 ]
...
```



### 외부 모듈

* node.js가 기본적으로 갖고 있지 않고 개인 또는 단체가 만들어 배포하는 모듈

* 외부 모듈은 https://www.npmjs.com/ 에서 확인할 수 있다.

* 일반적으로 구글에서 검색할 때 `node.js <기능>`으로 입력하면 찾아진다.

* 외부 모듈을 사용하려면 별도로 설치를 해야한다.

  ```powershell
  > npm install 모듈명
  ```

  자바스크립트 파일이 있는 폴더에서 명령어를 입력



request 모듈 설치

```powershell
PS C:\node> npm install request
```

모듈과 관련된 설명은 모듈의 공식 홈페이지에서 볼 수 있다.

request 모듈의 공식 홈페이지 : https://github.com/request/request

request 모듈은 특정한 웹 페이지를 긁을 때 사용한다.



JavaScript.js

```js
// 모듈을 추출합니다.
const request = require('request');

// 웹 페이지를 긁습니다.
request('http://www.google.com', (error, response, body) => {
    console.log(body);
});
```

코드를 실행하면 구글 메인 페이지의 소스 코드를 출력한다.



```powershell
PS C:\node> node .\JavaScript.js
<!doctype html><html itemscope="" itemtype="http://schema.org/WebPage" lang="ko"><head><meta content="text/html; charset=UTF-8" http-equiv="Content-Type"><meta content="/images/branding/googleg/1x/googleg_standard_color_128dp.png" itemprop="image"><title>Google</title><script nonce="FEIPvr1RJwYlnSsFYLrAWA==">...
```



### 서버 생성 및 실행

server.js 파일 생성

웹 서버를 만들 때에는 express라는 외부 모듈을 사용한다.

express 모듈 설치

```powershell
PS C:\node> npm install express@4.14
```

버전 명령 : npm 명령어를 입력할 때 모듈 이름 뒤에 @ 기호를 붙이고 버전을 입력하면 버전을 강제로 지정할 수 있다.



server.js

```js
// 모듈을 추출합니다.
const express = require('express');

// 웹 서버를 생성합니다.
let app = express();
app.use((request, response) => {
    response.send('<h1>안녕하세요</h1>');
});

// 웹 서버를 실행합니다.
app.listen(52273, () => {
    console.log('Server Running at http://127.0.0.1:52273');
});
```

포트 : 컴퓨터와 컴퓨터를 연결하는 정보의 출입구 역할을 하는 곳이다. 컴퓨터에는 0번부터 65535번까지 포트가 존재한다.

웹 서버에 기능을 부여할 때는 `app.use()` 메서드를 사용한다.



```powershell
PS C:\node> node .\server.js
Server Running at http://127.0.0.1:52273
```



http://127.0.0.1:52273

![image-20200226233537347](images/image-20200226233537347.png)

서버를 종료할 때는 `Ctrl` + `c` 를 누른다.

파일을 수정하면 반드시 서버를 종료하고 다시 실행해야 한다.



