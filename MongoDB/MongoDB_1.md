# MongoDB

## 소개

* MongoDB는 C++로 작성된 오픈소스 문서지향(Document-Oriented)적 Cross-platform 데이터베이스이며, 뛰어난 확장성과 성능을 자랑한다.
* 현존하는 NoSQL 데이터베이스 중 인지도 1위를 유지하고 있다.



### NoSQL

* Not Only SQL
* 기존의 RDBMS의 한계를 극복하기 위해 만들어진 새로운 형태의 데이터저장소
* 관계형 DB가 아니므로, RDMS처럼 고정된 스키마 및 JOIN이 존재하지 않는다.



### Document

* Document는 RDMS의 record와 비슷한 개념
* 데이터 구조는 한 개 이상의 key-value pair로 이뤄져 있다.

```sql
{
	"_id": ObjectId("5099803df3f4948bd2f98391"),
	"name": "Momo",
	"job": "Developer"
}
```



* _id, name, job 은 key이고, 그 오른쪽에 있는 값들은 value이다.
* _id는 12bytes의 hexadecimal 값으로, 각 document의 유일함(uniqueness)을 제공한다.
* _id 값의 첫 4bytes는 현재 timestamp, 다음 3bytes는 machine id, 다음 2bytes는 MongoDB 서버의 프로세스 id, 마지막 3bytes는 순차번호이다. 추가될 때마다 값이 높아진다.
* Document는 동적(dynamic)의 schema를 갖고 있다.
* 같은 Collection 안에 있는 Document 끼리 다른 schema를 갖고 있을 수 있다.
* 서로 다른 데이터 즉, 다른 key 들을 가지고 있을 수 있다.



### Collection

* Collection은 MongoDB Document의 그룹이다.
* Document들이 Collection 내부에 위치하고 있다.
* RDMS의 table과 비슷한 개념이지만 RDMS와 달리 schema를 따로 가지고 있지 않다.
* 각 Document들이 동적인 schema를 가지고 있다.



### Database

* Database는 Collection들의 물리적인 컨테이너이다.
* 각 Database는 파일시스템에 여러 파일들로 저장된다.



