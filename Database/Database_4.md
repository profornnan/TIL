# Database_4

### 두 개 이상 테이블에서 SQL 질의

#### 조인

2개의 테이블 합체

---

Customer 테이블을 Orders 테이블과 조건 없이 연결해보자.

```mysql
SELECT *
FROM Customer, Orders;
```

Customer와 Orders 테이블의 합체 결과 튜플의 개수는 고객이 다섯 명이고 주문이 열 개이므로 5 × 10 해서 50이 된다.

---

```mysql
SELECT *
FROM Customer, Orders
WHERE Customer.custid = Orders.custid;
```

고객과 고객의 주문에 관한 데이터

---

```mysql
SELECT *
FROM Customer, Orders
WHERE Customer.custid = Orders.custid
ORDER BY Customer.custid;
```

고객과 고객의 주문에 관한 데이터를 고객번호 순으로 정렬

---

```mysql
SELECT name, saleprice
FROM Customer, Orders
WHERE Customer.custid = Orders.custid;
```

고객의 이름과 고객이 주문한 도서의 판매가격 검색

---

```mysql
SELECT name, SUM(saleprice)
FROM Customer, Orders
WHERE Customer.custid = Orders.custid
GROUP BY Customer.name
ORDER BY Customer.name;
```

고객별로 주문한 모든 도서의 총 판매액을 구하고, 고객별로 정렬

---

![img](images/4-1.png)

---

```mysql
SELECT Customer.name, Book.bookname
FROM Customer, Orders, Book
WHERE Customer.custid = Orders.custid
      AND Orders.bookid = Book.bookid;
```

고객의 이름과 고객이 주문한 도서의 이름

---

```mysql
SELECT Customer.name, Book.bookname
FROM Customer, Orders, Book
WHERE Customer.custid = Orders.custid AND Orders.bookid = Book.bookid
      AND Book.price = 20000;
```

가격이 20,000원인 도서를 주문한 고객의 이름과 도서의 이름

##### 외부조인

```mysql
SELECT Customer.name, saleprice
FROM Customer LEFT OUTER JOIN
     Orders ON Customer.custid = Orders.custid;
```

도서를 구매하지 않은 고객을 포함하여 고객의 이름과 고객이 주문한 도서의 판매가격 구하기

---

![img](images/4-2.png)

#### 부속질의

SQL 문 내에 또 다른 SQL 문 작성

---

```mysql
SELECT bookname
FROM Book
WHERE price = (SELECT MAX(price)
               FROM Book);
```

가장 비싼 도서의 이름

---

![img](images/4-3.png)

---

```mysql
SELECT name
FROM Customer
WHERE custid IN (SELECT custid
                 FROM Orders);
```

도서를 구매한 적이 있는 고객의 이름 검색

---

```mysql
SELECT name
FROM Customer
WHERE custid IN (SELECT custid
                 FROM Orders
                 WHERE bookid IN (SELECT bookid
                                  FROM Book
                                  WHERE publisher='대한미디어'));
```

대한미디어에서 출판한 도서를 구매한 고객의 이름

---

![img](images/4-4.png)

---

![img](images/4-5.png)

---

##### 상관 부속질의

상관 부속질의(correlated subquery)는 상위 부속질의의 튜플을 이용하여 하위 부속질의를 계산함.

즉, 상위 부속질의와 하위 부속질의가 독립적이지 않고 서로 관련을 맺고 있음

```mysql
SELECT b1.bookname
FROM Book b1
WHERE b1.price > (SELECT AVG(b2.price)
                  FROM Book b2
                  WHERE b2.publisher=b1.publisher);
```

출판사별로 출판사의 평균 도서 가격보다 비싼 도서 구하기

---

![img](images/4-6.png)

#### 집합연산

##### 합집합 UNION, 차집합 MINUS, 교집합 INTERSECT

{도서를 주문하지 않은 고객} = {모든 고객} - {도서를 주문한 고객}

---

```sql
SELECT name
FROM Customer
MINUS
SELECT name
FROM Customer
WHERE custid IN (SELECT custid
                 FROM Orders);
```

도서를 주문하지 않은 고객의 이름

---

Oracle은 차집합을 MINUS로 하지만 SQL 표준에서는 EXCEPT를 사용한다.

---

MySQL에서는 MINUS와 INTERSECT를 지원하지 않는다.

---

차집합

```mysql
SELECT name
FROM Customer LEFT JOIN Orders
ON Customer.custid=Orders.custid
WHERE Orders.custid IS NULL;
```

#### EXISTS

EXISTS는 원래 단어에서 의미하는 것과 같이 조건에 맞는 튜플이 존재하면 결과에 포함시킴

즉, 부속질의문의 어떤 행이 조건에 만족하면 참임

반면 NOT EXISTS는 부속질의문의 모든 행이 조건에 만족하지 않을 때만 참임

---

```mysql
SELECT name, address
FROM Customer cs
WHERE EXISTS (SELECT * 
              FROM Orders od
              WHERE cs.custid=od.custid);
```

주문이 있는 고객의 이름과 주소

---

![img](images/4-7.png)

## 데이터 정의어

### CREATE 문

- 테이블을 구성하고, 속성과 속성에 관한 제약을 정의하며, 기본키 및 외래키를 정의하는 명령
- PRIMARY KEY는 기본키를 정할 때 사용하고 FOREIGN KEY는 외래키를 지정할 때 사용하며, ON UPDATE와 ON DELETE는 외래키 속성의 수정과 튜플 삭제 시 동작을 나타냄

#### CREATE 문의 기본 문법

![img](images/4-8.png)

---

다음과 같은 속성을 가진 NewBook 테이블을 생성하시오. 정수형은 NUMBER를, 문자형은 가변형 문자타입인 VARCHAR2를 사용한다.

- bookid(도서번호) - NUMBER
- bookname(도서이름) - VARCHAR2(20)
- publisher(출판사) - VARCHAR2(20)
- price(가격) - NUMBER

```sql
CREATE TABLE NewBook (
    bookid NUMBER,
    bookname VARCHAR2(20),
    publisher VARCHAR2(20),
    price NUMBER);
```

기본키를 지정하고 싶다면 다음과 같이 생성한다.

```sql
CREATE TABLE NewBook (
    bookid NUMBER,
    bookname VARCHAR2(20),
    publisher VARCHAR2(20),
    price NUMBER,
    PRIMARY KEY (bookid));
```

=

```sql
CREATE TABLE NewBook (
    bookid NUMBER PRIMARY KEY,
    bookname VARCHAR2(20),
    publisher VARCHAR2(20),
    price NUMBER);
```

---

bookid 속성이 없어서 두 개의 속성 bookname, publisher가 기본키가 된다면 괄호를 사용하여 복합키를 지정한다.

```sql
CREATE TABLE NewBook (
    bookname VARCHAR2(20),
    publisher VARCHAR2(20),
    price NUMBER,
    PRIMARY KEY (bookname, publisher));
```

---

bookname은 NULL 값을 가질 수 없고, publisher는 같은 값이 있으면 안 된다.

price에 값이 입력되지 않을 경우 기본 값 10000을 저장한다. 또 가격은 최소 1,000원 이상으로 한다.

---

NewBook 테이블의 CREATE 문에 좀 더 복잡한 제약사항을 추가한다.

```sql
CREATE TABLE NewBook (
    bookname VARCHAR2(20) NOT NULL,
    publisher VARCHAR2(20) UNIQUE,
    price NUMBER DEFAULT 10000 CHECK(price > 1000),
    PRIMARY KEY (bookname, publisher));
```

---

다음과 같은 속성을 가진 NewCustomer 테이블을 생성하시오.

- custid(고객번호) - NUMBER, 기본키
- name(이름) - VARCHAR2(40)
- address(주소) - VARCHAR2(40)
- phone(전화번호) - VARCHAR2(30)

```sql
CREATE TABLE NewCustomer (
    custid NUMBER PRIMARY KEY,
    name VARCHAR2(40),
    address VARCHAR2(40),
    phone VARCHAR2(30));
```

---

다음과 같은 속성을 가진 NewOrders 테이블을 생성하시오.

- orderid(주문번호) - NUMBER, 기본키
- custid(고객번호) - NUMBER, NOT NULL 제약조건, 외래키(NewCustomer.custid, 연쇄삭제)
- bookid(도서번호) - NUMBER, NOT NULL 제약조건
- saleprice(판매가격) - NUMBER
- orderdate(판매일자) - DATE

```sql
CREATE TABLE NewOrders (
    orderid NUMBER,
    custid NUMBER NOT NULL,
    bookid NUMBER NOT NULL,
    saleprice NUMBER,
    orderdate DATE,
    PRIMARY KEY (orderid),
    FOREIGN KEY (custid) REFERENCES NewCustomer(custid) ON DELETE CASCADE);
```

---

외래키 제약조건을 명시할 때는 반드시 참조되는 테이블(부모 릴레이션)이 존재해야 하며 참조되는 테이블의 기본키여야 함.

외래키 지정 시 ON DELETE 또는 ON UPDATE 옵션은 참조되는 테이블의 튜플의 삭제되거나 수정될 때 취할 수 있는 동작을 지정함.

NO ACTION은 어떠한 동작도 취하지 않음.

---

![img](images/4-9.png)

### ALTER 문

- ALTER 문은 생성된 테이블의 속성과 속성에 관한 제약을 변경하며, 기본키 및 외래키를 변경함
- ADD, DROP은 속성을 추가하거나 제거할 때 사용함
- MODIFY는 속성의 기본값을 설정하거나 삭제할 때 사용함
- 그리고 AND <제약이름>, DROP <제약이름>은 제약사항을 추가하거나 삭제할 때 사용함

#### ALTER 문의 기본 문법

![img](images/4-10.png)

---

```sql
ALTER TABLE NewBook ADD isbn VARCHAR2(13);
```

NewBook 테이블에 VARCHAR2(13)의 자료형을 가진 isbn 속성 추가

---

```sql
ALTER TABLE NewBook MODIFY isbn NUMBER;
```

NewBook 테이블의 isbn 속성의 데이터 타입을 NUMBER 형으로 변경

---

```sql
ALTER TABLE NewBook DROP COLUMN isbn;
```

NewBook 테이블의 isbn 속성 삭제

---

```sql
ALTER TABLE NewBook MODIFY bookid NUMBER NOT NULL;
```

NewBook 테이블의 bookid 속성에 NOT NULL 제약조건 적용

---

```sql
ALTER TABLE NewBook ADD PRIMARY KEY(bookid);
```

NewBook 테이블의 bookid 속성을 기본키로 변경

### DROP 문

- DROP 문은 테이블을 삭제하는 명령
- DROP 문은 테이블의 구조와 데이터를 모두 삭제하므로 사용에 주의해야 함(데이터만 삭제하려면 DELETE 문을 사용함)

#### DROP 문의 기본 문법

```sql
DROP TABLE 테이블이름
```

---

```sql
DROP TABLE NewBook;
```

NewBook 테이블 삭제

---

```sql
DROP TABLE NewCustomer;
```

NewCustomer 테이블 삭제. 만약 삭제가 거절된다면 원인을 파악하고 관련된 테이블을 같이 삭제(NewOrders 테이블이 NewCustomer를 참조하고 있음)

## 데이터 조작어 - 삽입, 수정, 삭제

### INSERT 문

- INSERT 문은 테이블에 새로운 튜플을 삽입하는 명령

#### INSERT 문의 기본 문법

```sql
INSERT INTO 테이블이름[(속성리스트)]
       VALUES (값리스트);
```

---

```sql
INSERT INTO Book(bookid, bookname, publisher, price)
VALUES (11, '스포츠 의학', '한솔의학서적', 90000);
```

Book 테이블에 새로운 도서 '스포츠 의학' 삽입. 스포츠 의학은 한솔의학서적에서 출간. 가격은 90,000원

---

```sql
INSERT INTO Book(bookid, bookname, publisher)
VALUES (14, '스포츠 의학', '한솔의학서적');
```

Book 테이블에 새로운 도서 '스포츠 의학'을 삽입. 스포츠 의학은 한솔의학서적에서 출간. 가격은 미정

#### 대량 삽입

- 대량 삽입(bulk insert)이란 한꺼번에 여러 개의 튜플을 삽입하는 방법

```sql
INSERT INTO Book(bookid, bookname, price, publisher)
SELECT bookid, bookname, price, publisher
FROM Imported_book;
```

수입도서 목록(Imported_book)을 Book 테이블에 모두 삽입(Imported_book 테이블은 스크립트 Book 테이블과 같이 이미 만들어져 있음)

### UPDATE 문

- UPDATE 문은 특정 속성 값을 수정하는 명령

#### UPDATE 문의 기본 문법

![img](images/4-11.png)

---

```sql
UPDATE Customer
SET address='대한민국 부산'
WHERE custid=5;
```

Customer 테이블에서 고객번호가 5인 고객의 주소를 '대한민국 부산'으로 변경

---

```sql
UPDATE Customer
SET address = (SELECT address
               FROM Customer
               WHERE name='김연아')
WHERE name LIKE '박세리';
```

Customer 테이블에서 박세리 고객의 주소를 김연아 고객의 주소로 변경

### DELETE 문

- DELETE 문은 테이블에 있는 기존 튜플을 삭제하는 명령

#### DELETE 문의 기본 문법

```sql
DELETE FROM 테이블이름
[WHERE 검색조건];
```

---

```sql
DELETE FROM Customer
WHERE custid=5;
```

Customer 테이블에서 고객번호가 5인 고객 삭제

---

```sql
DELETE FROM Customer;
```

모든 고객 삭제

## 실습

### 두 개 이상의 테이블에서 SQL 질의

#### 조인

```mysql
SELECT * FROM customer;
SELECT * FROM orders;
SELECT * FROM customer, orders;
```

5 × 10 → 50개의 데이터가 나온다.

자기 것만 가져와야 한다. → where 조건절에 명시해주기

```mysql
SELECT * FROM customer, orders WHERE customer.custid=orders.custid;
```

50권의 데이터가 나오는 것이 아니라 10권의 데이터만 나온다.

customer 데이터도 가져오고 orders 데이터도 가져온다.

```sql
SELECT custid, name, orderid, bookid
FROM customer, orders
WHERE customer.custid=orders.custid;
```

custid가 애매하다. 가지고 오고자 하는 위치를 적어줘야 한다.

```mysql
SELECT customer.custid, name, orderid, bookid
FROM customer, orders
WHERE customer.custid=orders.custid;
```

혼합해서 가져올 때는(join을 사용할 경우) 조건을 사용해야 한다.

where에 필요한 조건을 명시한다.

두 번째 방법은 join을 쓴다. → on 이라는 키워드에 조건을 써준다.

```mysql
SELECT customer.custid, name, orderid, bookid
FROM customer JOIN orders
ON customer.custid=orders.custid;
```

---

```mysql
SELECT customer.custid, name, orderid, bookid
FROM customer JOIN orders
ON customer.custid=orders.custid
WHERE saleprice > 10000;
```

saleprice가 10000 이상인 것만 가져온다.

```mysql
SELECT customer.custid, name, orderid, bookname
FROM customer JOIN orders
ON customer.custid=orders.custid
JOIN book ON orders.bookid=book.bookid
WHERE saleprice > 10000;
```

book에 있는 정보도 같이 가져왔다.

---

- 무결성 데이터
  - 도메인 무결성 : 값을 입력할 때 정해진 범위 내에서 입력
  - 개체 무결성
  - 참조 무결성

---

```mysql
SELECT c.custid, name, orderid, bookname
FROM customer AS c JOIN orders AS o
ON c.custid=o.custid
JOIN book AS b ON o.bookid=b.bookid
WHERE saleprice > 10000;
```

---

```mysql
SELECT c.custid, name, orderid, bookname
FROM customer AS c JOIN orders AS o
ON c.custid=o.custid
JOIN book AS b ON o.bookid=b.bookid
WHERE b.price = 20000;
```

---

같은 것만 가져올 때 inner join

left outer join, right outer join

---

```mysql
SELECT customer.name, saleprice
FROM customer LEFT OUTER JOIN orders
ON customer.custid=orders.custid;
```

책과 주문 테이블을 outer join으로 연결

주문되지 않은 책 정보도 표시

---

```mysql
SELECT customer.name, SUM(orders.saleprice)
FROM customer LEFT OUTER JOIN orders
ON customer.custid=orders.custid
GROUP BY customer.name;
```

---

```mysql
SELECT b.bookname, SUM(o.saleprice), COUNT(o.saleprice)
FROM book AS b LEFT OUTER JOIN orders AS o
ON b.bookid=o.bookid
GROUP BY b.bookname;
```

#### 부속질의

부속질의 : SQL 문 내에 또 다른 SQL 문이 있는 것

---

```mysql
SELECT COUNT(DISTINCT custid)
FROM orders;
```

총 사용자의 수 출력

---

포함된 것은 in, 아니면 not in 사용

많이 쓰면 성능에 좋지 않다.

---

#### 집합연산

합집합 UNION, 차집합 MINUS, 교집합 INTERSECT

---

```mysql
SELECT name
FROM customer
WHERE address like '대한민국%'
UNION
SELECT name
FROM customer
WHERE custid in (SELECT custid
                 FROM orders);
```

union을 사용하지 않으면 섞여서 나올 수 있다.

union을 사용하면 대한민국을 먼저 출력한다.

순서와 데이터 타입이 일치해야 사용 가능하다.

여러 개의 테이블을 복합적으로 표시할 수 있지만 조건을 만족해야 한다.

### CREATE 문

- 테이블 구성, 속성과 속성에 관한 제약 정의, 기본키 및 외래키를 정의하는 명령
- PRIMARY KEY : 기본키를 지정할 때 사용
- FOREIGN KEY : 외래키를 지정할 때 사용
- ON UPDATE와 ON DELETE : 외래키 속성의 튜플 삭제 시 동작을 나타냄

---

속성명과 데이터 타입 나열하기

#### CREATE 문의 기본 문법

```sql
CREATE TABLE 테이블이름
({속성이름 데이터타입
  [NOT NULL|UNIQUE|DEFAULT 기본값|CHECK 체크조건]
 }
  [PRIMARY KEY 속성이름(들)]
 {[FOREIGN KEY 속성이름 REFERENCES 테이블이름(속성이름)]
  [ON DELETE [CASCADE|SET NULL]]
 }
)
```

---

가변 데이터 : 데이터를 5개만 쓰면 5만큼만 차지

- CHAR(n)
  - 고정 길이 문자형 데이터 타입(최대 255byte)
  - 지정된 길이보다 짧은 데이터 입력 시 나머지 공간은 공백으로 채워진다.
- VARCHAR(n)
  - 가변 길이 문자형 데이터 타입(최대 65535byte)
  - 지정된 길이보다 짧은 데이터 입력 시 나머지 공간은 채우지 않는다.

---

```mysql
CREATE TABLE NewBook (
    bookid INT,
    bookname VARCHAR(20),
    publisher VARCHAR(20),
    price INT,
    PRIMARY KEY (bookid));
```

=

```mysql
CREATE TABLE NewBook (
    bookid INT PRIMARY KEY,
    bookname VARCHAR(20),
    publisher VARCHAR(20),
    price INT);
```

기본키 지정 방법

---

어떤 테이블이든 기본키가 있다.

일반키를 나열하고 마지막에 기본키를 지정하거나 중간에 지정하는 방법이 있다.

값은 중복해서 오면 안 된다. 유니크해야 한다. 도서 번호 유일하게 구별

---

필수로 초기값을 넣어주고자 할 때 default 키워드 사용

---

NULL 값이 오면 안 되는 경우 NOT NULL 설정

---

```mysql
CREATE TABLE NewCustomer (
    custid INT PRIMARY KEY,
    name VARCHAR(30),
    address VARCHAR(50),
    phone VARCHAR(15));
```

---

```mysql
CREATE TABLE NewOrders (
    orderid INT,
    custid INT NOT NULL,
    bookid INT NOT NULL,
    saleprice INT,
    orderdate DATETIME,
    PRIMARY KEY (orderid),
    FOREIGN KEY (custid) REFERENCES NewCustomer(custid) ON DELETE CASCADE);
```

### ALTER문

- 생성된 테이블의 속성과 속성에 관한 제약 변경
- 기본키 및 외래키 변경

### DROP 문

- 테이블을 삭제하는 명령
- 테이블 자체를 아예 지운다.

---

TRUNCATE 명령어는 테이블의 데이터를 전부 삭제하는 명령어이다. 테이블은 남겨둔다.

---

```mysql
INSERT INTO NewCustomer(custid, name, address, phone)
VALUES (1, 'user', 'seoul', '01012345678');
SELECT * FROM NewCustomer;
```

---

```mysql
TRUNCATE TABLE NewOrders;
SELECT * FROM NewOrders;
```

---

```mysql
DROP TABLE NewOrders;
SELECT * FROM NewOrders;
```

### [6]

각 이름이 's'로 끝나는 사원들의 이름과 업무를 아래의 예와 같이 출력하고자 한다. 출력 시 성과 이름은 첫 글자가 대문자, 업무는 모두 대문자(UPPER함수 사용)로 출력하고 머리글은 Employee JOBs로 표시하시오.

예) Sigal Tobias is a PU_CLERK

---

#### SUBSTR

```mysql
SUBSTR(문자열, 시작지점, 길이)
```

문자열을 시작지점부터 길이만큼 추출

길이 미입력 시 끝까지 추출

맨 마지막 문자를 -1로 기준을 잡고 거꾸로 문자의 위치를 셀 수 있다.

-1은 뒤에서 첫 번째, -2는 뒤에서 두 번째, ...

#### UPPER

모든 글자를 대문자로

#### LOWER

모든 글자를 소문자로

---

SUBSTR과 UPPER를 이용하면 첫 글자만 대문자로 변환할 수 있다.

---

```mysql
SELECT CONCAT(first_name, ' ', last_name, ' is a ', UPPER(job_id)) AS "Employee JOBs"
FROM employees
-- WHERE last_name LIKE '%s';
WHERE SUBSTR(last_name, -1, 1) = 's';
```

### [7]

모든 사원의 연봉을 표시하는 보고서를 작성하려고 한다. 보고서에 사원의 성과 이름(Name으로 별칭), 급여, 수당여부에 따른 연봉을 포함하여 출력하시오. 수당여부는 수당이 있으면 "Salary + Commission", 수당이 없으면 "Salary only"라고 표시하고, 별칭은 적절히 붙인다. 또한 출력 시 연봉이 높은 순으로 정렬한다.

- IF, IFNULL

#### IF, IFNULL

```mysql
SELECT name, IF(phone IS NOT NULL, '***', '-')
FROM customer;
```

---

```mysql
SELECT name, IFNULL(phone, '-')
FROM customer;
```

---

```mysql
SELECT name, IF(phone IS NOT NULL, phone, '-')
FROM customer;
```

---

```mysql
SELECT CONCAT(first_name, ' ', last_name) AS 'Name',
       salary,
       (salary * 12 * (1 + IFNULL(commission_pct, 0))) AS 'Annual Salary',
       IF(commission_pct IS NULL, 'Salary only', 'Salary + Commission') AS 'Salary Type'
FROM employees
ORDER BY 3 DESC;
```

### [8]

모든 사원들 성과 이름(Name으로 별칭), 입사일 그리고 입사일이 어떤 요일이였는지 출력하시오. 이때 주(week)의 시작인 일요일부터 출력되도록 정렬하시오.

- DATE_FORMAT()

#### NOW & DATE_FORMAT

NOW : 현재 시간 출력

DUAL : 양식을 맞추기 위한 더미 테이블

```mysql
SELECT NOW(), DATE_FORMAT(NOW(), '%Y') FROM DUAL;
SELECT NOW(), DATE_FORMAT(NOW(), '%w') FROM DUAL;
SELECT NOW(), DATE_FORMAT(NOW(), '%W') FROM DUAL;
```

- NOW() : 2023-01-24 15:56:52
- DATE_FORMAT(NOW(), '%Y') : 2023
- DATE_FORMAT(NOW(), '%w') : 2
- DATE_FORMAT(NOW(), '%W') : Tuesday

---

[MySQL DATE_FORMAT Function](https://www.mysqltutorial.org/mysql-date_format/)

---

```mysql
SELECT CONCAT(first_name, ' ', last_name) AS 'Name',
       hire_date,
       DATE_FORMAT(hire_date, '%W') AS 'Day of the week'
FROM employees
ORDER BY DATE_FORMAT(hire_date, '%w');
```

### [9]

모든 사원은 직속 상사 및 직속 직원을 갖는다. 단, 최상위 또는 최하위 직원은 직속상사 및 직원이 없다. 소속된 사원들 중 어떤 사원의 상사로 근무 중인 사원의 총 수를 출력하시오.

```mysql
SELECT COUNT(DISTINCT manager_id) AS 'Count Managers'
FROM employees;
```

### [10]

각 사원이 소속된 부서별로 급여 합계, 급여 평균, 급여 최대값, 급여 최소값을 집계하고자 한다. 계산된 출력값은 6자리와 세 자리 구분기호, $ 표시와 함께 출력하고 부서번호의 오름차순 정렬하시오. 단, 부서에 소속되지 않은 사원에 대한 정보는 제외하고 출력시 머리글은 별칭(alias) 처리하시오.

- GROUP BY, SUM(), AVG(), MAX(), MIN()
- FORMAT(값, 소수점 표현자리수)

---

```mysql
SELECT FORMAT(10000, 3) FROM DUAL;
```

10,000.000

---

```mysql
SELECT *
FROM employees
WHERE department_id IS NOT NULL;
```

---

```mysql
SELECT department_id,
       CONCAT('$', FORMAT(SUM(salary), 0)) AS 'Sum Salary',
       CONCAT('$', FORMAT(AVG(salary), 1)) AS 'Avg Salary',
       CONCAT('$', FORMAT(MAX(salary), 0)) AS 'Max Salary',
       CONCAT('$', FORMAT(MIN(salary), 0)) AS 'Min Salary'
FROM employees
WHERE department_id IS NOT NULL
GROUP BY department_id;
```

## 내장 함수

- SQL에서는 함수의 개념을 사용하는데 수학의 함수와 마찬가지로 특정 값이나 열의 값을 입력받아 그 값을 계산하여 결과 값을 돌려줌
- SQL의 함수는 DBMS가 제공하는 내장 함수(built-in function)와 사용자가 필요에 따라 직접 만드는 사용자 정의 함수(user-defined function)로 나뉨

### SQL 내장 함수

- SQL 내장 함수는 상수나 속성 이름을 입력 값으로 받아 단일 값을 결과로 반환함
- 모든 내장 함수는 최초에 선언될 때 유효한 입력 값을 받아야 함

![img](images/4-12.png)

#### 숫자 함수

![img](images/4-13.png)

##### ABS 함수

절대값을 구하는 함수

```sql
SELECT ABS(-78), ABS(+78)
FROM DUAL;
```

-78과 +78의 절대값

##### ROUND 함수

반올림한 값을 구하는 함수

```sql
SELECT ROUND(4.875, 1)
FROM DUAL;
```

4.875를 소수 첫째 자리까지 반올림한 값

##### 숫자 함수의 연산

```sql
SELECT custid "고객번호", ROUND(SUM(saleprice)/COUNT(*), -2) "평균금액"
FROM Orders
GROUP BY custid;
```

고객별 평균 주문 금액을 백 원 단위로 반올림한 값

#### 문자 함수

![img](images/4-14.png)

##### REPLACE

문자열을 치환하는 함수

```sql
SELECT bookid, REPLACE(bookname, '야구', '농구') bookname, publisher, price
FROM Book;
```

도서제목에 야구가 포함된 도서를 농구로 변경한 도서 목록 

##### LENGTH

글자의 수를 세어주는 함수 (단위가 바이트(byte)가 아닌 문자 단위)

```sql
SELECT bookname "제목", LENGTH(bookname) "글자수", LENGTHB(bookname) "바이트수"
FROM Book
WHERE publisher="굿스포츠";
```

굿스포츠에서 출판한 도서의 제목과 제목의 글자 수

##### SUBSTR

지정한 길이만큼의 문자열을 반환하는 함수

```sql
SELECT SUBSTR(name, 1, 1) "성", COUNT(*) "인원"
FROM Customer
GROUP BY SUBSTR(name, 1, 1);
```

고객 중에서 같은 성(姓)을 가진 사람이 몇 명이나 되는지 성별 인원수 구하기

#### 날짜 · 시간 함수

![img](images/4-15.png)

---

![img](images/4-16.png)

---

```sql
SELECT orderid "주문번호", orderdate "주문일", orderdate+10 "확정"
FROM Orders;
```

주문일로부터 10일 후 매출 확정. 각 주문의 확정일자 구하기

##### TO_DATE

문자형으로 저장된 날짜를 날짜형으로 변환하는 함수

##### TO_CHAR

날짜형을 문자형으로 변환하는 함수

```sql
SELECT orderid "주문번호", TO_CHAR(orderdate, 'yyyy-mm-dd dy') "주문일",
       custid "고객번호", bookid "도서번호"
FROM Orders
WHERE orderdate=TO_DATE('20140707', 'yyyymmdd');
```

##### SYSDATETIME

오라클의 현재 날짜와 시간을 반환하는 함수

##### SYSTIMESTAMP

현재 날짜, 시간과 함께 초 이하의 시간과 서버의 TIMEZONE까지 출력함

```sql
SELECT SYSDATE, TO_CHAR(SYSDATE, 'yyyy/mm/dd dy hh24:mi:ss') "SYSDATE_1"
FROM DUAL;
```

DBMS 서버에 설정된 현재 시간과 오늘 날짜 확인

### NULL 값 처리

#### NULL 값이란?

- 아직 지정되지 않은 값
- NULL 값은 '0', '(빈 문자)', '(공백)' 등과 다른 특별한 값
- NULL 값은 비교 연산자로 비교가 불가능함
- NULL 값의 연산을 수행하면 결과 역시 NULL 값으로 반환됨

#### 집계 함수를 사용할 때 주의할 점

- 'NULL + 숫자' 연산의 결과는 NULL
- 집계 함수 계산 시 NULL이 포함된 행은 집계에서 빠짐
- 해당되는 행이 하나도 없을 경우 SUM, AVG 함수의 결과는 NULL이 되며, COUNT 함수의 결과는 0

#### NULL 값에 대한 연산과 집계 함수

Mybook

| bookid | price |
| ------ | ----- |
| 1      | 10000 |
| 2      | 20000 |
| 3      | NULL  |

---

```sql
SELECT price+100
FROM Mybook
WHERE bookid=3;
```

| PRICE+100 |
| --------- |
| (null)    |

---

```sql
SELECT SUM(price), AVG(price), COUNT(*), COUNT(price)
FROM Mybook;
```

| SUM(PRICE) | AVG(PRICE) | COUNT(*) | COUNT(PRICE) |
| ---------- | ---------- | -------- | ------------ |
| 30000      | 15000      | 3        | 2            |

---

```sql
SELECT SUM(price), AVG(price), COUNT(*)
FROM Mybook
WHERE bookid >= 4;
```

| SUM(PRICE) | AVG(PRICE) | COUNT(*) |
| ---------- | ---------- | -------- |
| (null)     | (null)     | 0        |

#### NULL 값을 확인하는 방법 - IS NULL, IS NOT NULL

- NULL 값을 찾을 때는 '=' 연산자가 아닌 'IS NULL'을 사용
- NULL이 아닌 값을 찾을 때는 '<>' 연산자가 아닌 'IS NOT NULL'을 사용함

---

```sql
SELECT *
FROM Mybook
WHERE price IS NULL;
```

| BOOKID | PRICE  |
| ------ | ------ |
| 3      | (null) |

---

```sql
SELECT *
FROM Mybook
WHERE price = '';
```

| BOOKID | PRICE |
| ------ | ----- |
|        |       |

#### NVL

- NULL 값을 다른 값으로 대치하여 연산하거나 다른 값으로 출력

```
NVL(속성, 값)  /* 속성 값이 NULL이면 '값'으로 대치한다 */
```

---

```sql
SELECT name "이름", NVL(phone, '연락처없음') "전화번호"
FROM Customer;
```

이름, 전화번호가 포함된 고객목록 (단, 전화번호가 없는 고객은 '연락처없음'으로 표시)


