# Docker exercise



## Docker Compose - LAB1



Drupal

Local에 설치하는 것이 아니라 container 환경에서 돌리는 것이 목적

drupal image와 mysql image를 이용





## Docker Compose - LAB2



drupal 이미지 자체를 커스터마이징 하는 것이 목적

원래 있던 drupal 이미지를 다운 받아서 커스터마이징

drupal image, mysql image 이용

README 파일 참고

postgre : 사용 방법이 mysql 과는 다르다. 별도의 공부 필요



실무에서 mysql 쓰는 경우도 있지만 mysql의 오픈 소스 버전인 mariadb를 많이 사용



Dockerfile, yaml 파일 작성





## Docker Swarm - LAB3



- bretfisher/examplevotingapp_vote
- bretfisher/examplevotingapp_worker:java
- bretfisher/examplevotingapp_result
- redis:3.2
- postgres:9.4



있는 그대로 deploy 해서 사용



redis

nosql 중 하나. key value 만 들어가 있는 데이터베이스. 간단하게 사용할 수 있는 nosql



postgres

mysql같은 관계형 데이터베이스.



다른 데이터베이스를 사용하겠다고 하면 bretfisher~ 이미지의 모드를 바꿔줘야 한다.



docker-compose.yml 파일 실행

필요했던 환경 구축이 된 상태에서 나머지 서비스 구축



- volume x 1 (db-data,target=/var/lib/postgresql/data)
- networks x 2 (frontend, backend)
- services x 5 (voting-app, redis, db, worker, result-app)
- stack x 1 (my-vote-app)



yaml 파일 작성

volume mount 걸 때 host, container

postgre에 volume mount를 건다.



5가지 컨테이너를 만들 것인데 volume은 postgre 하나에만 건다.



네트워크 2개. frontend, backend

overlay로 만들어서 서비스 적절하게 분배



service 구성



voting 하기 위해서는 http://localhost:8000/

투표 결과를 보기 위해서는 http://localhost:5001/



Swarm 설정 -> compose-file



네트워크가 필요하다. frontend와 backend

overlay network로



처음에 voting-app에서 투표한다.

어떤 ID가 누구를 선택했는지 redis에 쌓아놓는다.

worker가 변화를 감지해서 다음 쪽에 전달

worker 안에서는 필요했던 데이터를 가져와서 db쪽으로 데이터를 전달해준다.

마지막에 db에 있는 데이터를 끌어와서 result-app 쪽에서 결과를 보여준다.



db에 접속해서 select 하면 투표 결과 확인 가능



docker-compose.yml

```yaml
version: "3"
services: 
  registry:
    container_name: registry
    image: registry:latest
    ports: 
      - 5000:5000
    volumes: 
      - "./registry-data:/var/lib/registry"

  manager:
    container_name: manager
    image: docker:19.03.5-dind
    privileged: true
    tty: true
    ports:
      - 8000:80
      - 9000:9000
      - 5001:5001
    depends_on: 
      - registry
    expose: 
      - 3375
    command: "--insecure-registry registry:5000"
    volumes: 
      - "./stack:/stack"

  worker01:
    container_name: work01
    image: docker:19.03.5-dind
    privileged: true
    tty: true
    depends_on: 
      - manager
      - registry
    expose: 
      - 7946
      - 7946/udp
      - 4789/udp
    command: "--insecure-registry registry:5000"

  worker02:
    container_name: work02
    image: docker:19.03.5-dind
    privileged: true
    tty: true
    depends_on: 
      - manager
      - registry
    expose: 
      - 7946
      - 7946/udp
      - 4789/udp
    command: "--insecure-registry registry:5000"

  worker03:
    container_name: work03
    image: docker:19.03.5-dind
    privileged: true
    tty: true
    depends_on: 
      - manager
      - registry
    expose: 
      - 7946
      - 7946/udp
      - 4789/udp
    command: "--insecure-registry registry:5000"
```



docker swarm 설정



manager에서

docker network create -d overlay backend

docker network create -d overlay frontend



서비스를 하나씩 생성

docker service create --name vote -p 80:80 --network frontend --replicas 2 bretfisher/examplevotingapp_vote

docker service create --name redis --network frontend redis:3.2

docker service create --name db --network backend --mount type=volume,source=db-data,target=/var/lib/postgresql/data postgres:9.4

docker service create --name worker --network frontend --network backend bretfisher/examplevotingapp_worker:java

docker service create --name result --network backend -p 5001:80 bretfisher/examplevotingapp_result





windows가 8000, 5001번 호출 가능

8000번 호출하면 manager가 가지고 있는 80을 사용

5001번 호출하면 manager가 가지고 있는 5001 사용



worker가 해주는 역할은 다리 역할 -> backend와 frontend 둘 다 참여하고 있어야 한다.



docker service ps db



NODE 이름으로 접속

powershell 띄워서 docker exec -it NODE_ID sh

docker ps



docker exec -it container_id bash



postgre

psql -Upostgres



해당하는 허브 사이트에 postgre 정보 확인



select * from vote;

저장된 정보 확인 가능하다.



