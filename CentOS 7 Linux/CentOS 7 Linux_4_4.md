# CentOS 7 Linux_4_4

## 4. 서버를 구축할 때 알아야 할 필수 개념과 명령어

### 4.4 리눅스 관리자를 위한 명령어

#### 프로그램 설치를 위한 RPM

* CentOS에서 패키지(프로그램)를 설치하는 데 RPM과 YUM을 가장 많이 사용
* YUM이 나오기 전에는 RPM을 사용
* YUM은 RPM의 개념과 기능을 포함
* YUM은 RPM을 포함한 확장 개념에 가깝다.



##### RPM

* 레드햇사에서 프로그램을 설치한 후에 바로 실행할 수 있는 설치 파일 제작
* 이런 설치 파일의 확장명은 *.rpm이며, 이를 패키지라 부른다.



##### 파일의 의미

* rpm 파일 형식

  ```
  패키지이름-버전-릴리즈번호.CentOS버전.아키텍처.rpm
  gedit-3.8.3-6.el7.x86_64.rpm
  ```

  * 패키지 이름 : gedit
    * 패키지(프로그램)의 이름
  * 버전 : 3.8.3
    * 대개 3자리 수로 구성
    * 주 버전, 부 버전, 패치 버전 순서
    * 숫자가 높을수록 최신
  * 릴리즈 번호 : 6
    * 문제점을 개선할 때마다 붙여지는 번호
  * CentOS 버전 : el7
    * CentOS에서 배포할 경우에 붙여진다.
    * el(Enterprise Linux)7은 CentOS 7 또는 Redhat Enterprise Linux 7용을 의미
  * 아키텍처 : x86_64
    * x86 계열의 64비트 CPU를 의미
    * 이 파일을 설치할 수 있는 CPU를 뜻한다.



##### 자주 사용하는 rpm 명령어 옵션

* 설치

  ```bash
  $ rpm -Uvh 패키지파일이름.rpm
  ```

  * `U` : 기존에 패키지가 설치되지 않았다면 일반적인 설치, 기존에 패키지가 설치되어 있다면 업그레이드.
  * `v` : 설치 과정 확인
  * `h` : 설치 진행 과정을 `#` 기호로 화면에 출력

* 삭제

  ```bash
  $ rpm -e 패키지이름
  ```

  * `e` : erase의 약자

* 이미 설치된 패키지 조회

  ```bash
  $ rpm -qa 패키지이름		# 시스템에 패키지가 설치되어있는지 확인
  $ rpm -qf 파일의절대경로	# 이미 설치된 파일이 어느 패키지에 포함된 것인지 확인
  $ rpm -ql 패키지이름		# 특정 패키지가 어떤 파일들이 포함되었는지 확인
  $ rpm -qi 패키지이름		# 설치된 패키지의 상세 정보
  ```

  CentOS에서는 설치 시에 RPM보다 더 편리한 YUM을 사용하기 때문에 RPM을 사용할 일이 많이 줄었지만, 이미 설치된 패키지의 정보를 보는데 위 4가지 질의 옵션을 자주 사용

* 아직 설치되지 않은 rpm 파일 조회

  ```bash
  $ rpm -qlp 패키지파일이름.rpm	# 패키지 파일에 어떤 파일들이 포함되었는지 확인
  $ rpm -qip 패키지파일이름.rpm	# 패키지 파일 상세 정보
  ```

  

##### RPM의 단점

* 의존성 문제 -> 해결한 것이 `yum` 명령어이다.



#### 편리하게 패키지를 설치하는 YUM

* RPM의 의존성 문제를 해결하려고 제공하는 것이 YUM 명령어
* YUM은 rpm 패키지를 설치하는 편리한 도구



##### YUM

* 특정 패키지를 설치하고자 할 때 의존성이 있는 다른 패키지를 자동으로 먼저 설치해준다.
* `rpm` 명령어는 설치하려는 rpm 파일이 DVD에 있거나 인터넷에서 미리 다운로드한 후 설치해야한다.
* 하지만 YUM은 CentOS가 제공하는 rpm 파일 저장소에서 설치할 rpm 파일과 해당 파일과 의존성이 있는 다른 rpm 파일까지 인터넷을 통해 다운로드 한 후 자동으로 설치
* 저장소의 URL은 `/etc/yum.repos.d/` 디렉터리의 파일에 저장되어 있다.



##### YUM의 기본 사용법

* 기본 설치 방법

  ```bash
  $ yum -y install 패키지이름
  ```

  `-y` 옵션을 주면 사용자에게 yes/no를 묻는 부분에서 무조건 yes를 입력한 것으로 간주

* rpm 파일 설치 방법

  ```bash
  $ yum localinstall rpm파일이름.rpm
  ```

  rpm 파일이 있다면 해당 명령어를 실행해 패키지 설치 가능.

  현재 디렉터리의 rpm 파일에 의존성 문제가 있을 경우 문제를 해결할 수 있는 파일을 인터넷에서 다운로드해 설치해준다.

* 업데이트 가능한 목록 보기

  ```bash
  $ yum check-update
  ```

  시스템에 설치된 패키지 중 업데이트가 가능한 패키지 목록을 출력

* 업데이트

  ```bash
  $ yum update 패키지이름
  ```

  기존에 설치되지 않은 패키지 새로 설치

  이미 설치되어 있으면 업데이트

* 삭제

  ```bash
  $ yum remove 패키지이름
  ```

  기존 설치된 패키지를 제거

* 정보 확인

  ```bash
  $ yum info 패키지이름
  ```

  패키지의 요약 정보를 보여준다.



##### YUM 고급 사용법

* 패키지 그룹 설치

  ```bash
  $ yum groupinstall "패키지그룹이름"
  ```

  패키지 그룹에 포함되는 패키지들을 통째로 설치할 때 사용

  패키지 그룹의 종류는 `yum grouplist`로 확인할 수 있다.

* 패키지 리스트 확인

  ```bash
  $ yum list 패키지이름
  $ yum list all
  $ yum list httpd*
  ```

  CentOS에서 제공하는 패키지 리스트를 보여준다.

* 특정 파일이 속한 패키지 이름 확인

  ```bash
  $ yum provides 파일이름
  ```

  특정 파일이 어느 패키지에 들어 있는지 확인

* GPG 키 검사 생략

  ```bash
  $ yum install --nogpgcheck rpm파일이름.rpm
  ```

  CentOS 7에서 인증되지 않은 rpm 파일을 `yum localinstall`로 설치하면 설치되지 않는 경우도 있다. 그럴경우 위의 옵션을 사용하면 설치할 수 있다.

* 기존 저장소 목록 지우기

  ```bash
  $ yum clean all
  ```

  기존에 다운로드한 패키지 목록을 지운 다음 yum install을 실행하면 새로 패키지 목록을 다운로드한다.



##### YUM의 작동 방식과 설정 파일

* `yum` 명령어와 관련된 설정 파일
  * `/etc/yum.conf` 파일
  * `/etc/yum.repos.d/` 디렉터리
    * 이 디렉터리에 있는 각 파일은 `yum` 명령어를 실행했을 때 인터넷에서 해당 패키지 파일을 검색하는 네트워크 주소가 들어있다.
* repo 파일의 구성
  * `#` : 주석
  * `name` : 저장소의 이름
  * `mirrorlist` : baseurl에 설정 값(URL)이 생략되어 있으면, 대신 mirrorlist에 적혀 있는 URL이 사용됨
  * `baseurl`
    * URL이 적혀있어야 한다.
    * http, ftp, file 3가지 중 하나가 오면 된다.
    * 저장소의 URL을 정확히 알고 있으면 직접 적어도 된다.
    * 여러 개가 이어져서 나올 수 있다.
  * `gpgcheck`
    * 패키지의 GPG 서명을 확인할지 여부를 1(사용), 0(사용 안 함)으로 지정할 수 있다.
    * 1로 지정할 경우 gpgkey 항목을 반드시 설정해야 한다.
  * `gpgkey` : 아스키 GPG 키가 들어 있는 저장소의 URL이 적혀 있으면 된다.
  * `enable`
    * 이 저장소를 사용할지 여부를 1(사용), 0(사용 안 함)으로 지정할 수 있다.
    * 생략 시 기본 값 1



#### 파일 압축과 묶기

##### 파일 압축

리눅스에서 많이 보는 압축 파일의 확장자명 -> xz, bz2, gz, zip, Z 등

* xz

  * 확장명 xz로 압축하거나 풀어준다.

  * 비교적 최신의 압축 명령으로, 압축률이 뛰어나다.

    ```bash
    $ xz 파일이름		# '파일 이름'을 '파일이름.xz'로 만든다.(기존 파일 삭제)
    $ xz -d 파일이름.xz	# 압축 파일을 일반 파일로 만듦(decompose)
    $ xz -l 파일이름.xz	# '파일이름.xz' 압축 파일에 포함된 파일 목록과 압축률 등을 출력(list)
    $ xz -k 파일이름	# 압축 후에 기존 파일을 삭제하지 않고 그대로 둠(keep)
    ```

* bzip2

  * 확장명 bz2로 압축하거나 풀어준다.

    ```bash
    $ bzip2 파일이름		# '파일이름'을 압축 파일인 '파일이름.bzip2'로 만든다.
    $ bzip2 -d 파일이름.bz2	# '파일이름.bz2' 압축 파일을 일반 파일로 만든다.
    ```

* bunzip2

  * 확장명 bz2\의 압축을 풀어준다.
  * `bzip2 -d`와 동일한 명령이다.

* gzip

  * 확장명 gz으로 압축하거나 풀어준다.

    ```bash
    $ gzip 파일이름			# '파일이름'을 '파일이름.gz'으로 만듦
    $ gzip -d 파일이름.gz	# '파일이름.gz' 압축 파일을 일반 파일로 만듦
    ```

* gunzip

  * 확장명 gz의 압축을 풀어준다.
  * `gzip -d`와 동일한 명령

* zip

  * Windows용과 호환되는 확장명 zip으로 압축하거나 풀어준다.

    ```bash
    $ zip 생성할파일이름.zip 압축할파일이름	# 압축할 파일 이름을 '새로생성될파일이름.zip'으로 만듦
    ```

* unzip

  * Windows용과 호환되는 zip으로 묶은 압축 파일을 풀어준다.

    ```bash
    $ upzip 압축파일이름.zip		# '압축파일이름.zip'의 압축을 풀어준다.
    ```

    

##### 파일 묶기

* 리눅스(유닉스)에서는 '파일 압축'과 '파일 묶기'는 원칙적으로 별개의 프로그램으로 실행하도록 되어있다. (한 번에 할 수 있는 옵션도 제공)

* `tar` : 파일 묶기의 명령어. 묶여진 파일의 확장명도 tar이다.

  * 확장명 tar로 묶음 파일을 만들거나 묶음을 푼다.

  * 동작

    * `c` : 새로운 묶음을 만든다.
    * `x` : 묶인 파일을 푼다.
    * `t ` : 묶음을 풀기 전에 묶인 경로를 보여준다.
    * `C` : 묶음을 풀 때 지정된 디렉터리에 압축을 푼다. 지정하지 않으면 묶을 때와 종일한 디렉터리에 풀린다.

  * 옵션

    * `f` : 묶음 파일 이름 지정. 원래 tar은 테이프 장치 백업이 기본이다.(생략하면 테이프로 보내짐)
    * `v` : 파일이 묶이거나 풀리는 과정을 보여준다. (visual)
    * `J` : tar + xz
    * `z` : tar + gzip
    * `j` : tar + bzip2

    ```bash
    $ tar cvf my.tar /etc/sysconfig/	# 묶기
    $ tar cvfJ my.tar.xz /etc/sysconfig/	# 묶기 + xz압축
    $ tar tvf my.tar	# 파일 확인
    $ tar xvf my.tar	# tar 풀기
    $ tar Cxvf newdir my.tar	# newdir에 tar 풀기
    $ tar xfz my.tar.gz	# gzip 압축 해제 + tar 풀기
    ```

    

##### 파일 위치 검색

* `find 경로 옵션 조건 action`

  * 옵션

    * -name, -user : 소유자
    * -newer : 전, 후
    * -perm : 허가권
    * -size : 크기

  * action

    * -print : 기본 값
    * -exec : 외부 명령 실행

  * 기본 사용 예

    ```bash
    $ find /etc -name "*.conf"
    $ find /home -user centos
    $ find ~ -perm 644
    $ find /usr/bin -size +10k -size -100k
    ```

  * 고급 사용 예

    ```bash
    $ find ~ -size 0k -exec ls -l {} \;
    $ find /home -name "*.swp" -exec rm {} \;
    ```

    `-exec`와 `\`는 외부 명령어의 시작과 끝을 표시

    `find` 명령어의 실행 결과인 swp 파일이 rm 명령으로 실행됨. (파일이 삭제됨)

* `which 실행파일 이름`

  * PATH에 설정된 디렉터리만 검색
  * 절대 경로를 포함한 위치를 검색

* `whereis 실행파일 이름`

  * 실행 파일, 소스, man 페이지 파일까지 검색한다.

* `locate 파일이름`

  * 파일 목록 데이터베이스에서 검색하기 때문에 매우 빠르고 유용하지만 `updatedb` 명령어를 1회 실행해야 사용가능



#### 시스템 설정

##### 날짜 및 설정

* `system-config-date` 명령어를 사용해 날짜와 시간 설정 가능

##### 네트워크 설정

* `nmtui` 명령어 사용

##### 방화벽 설정

* `firewall-config` 명령어 사용
* 외부에 서비스하려고 포트를 열어줄 때 사용

##### 서비스(데몬) 설정

* `ntsysv` 명령어 사용
* 서비스(데몬)의 시작, 중지, 재시작 및 사용 여부 설정

##### 그 외에 사용되는 설정 명령

* `system-config-keyboard` : 키보드 설정
* `system-config-language` : 언어 설정
* `system-config-printer` : 프린터 설정
* `system-config-users` : 사용자 설정
* `system-config-kickstart` : 킥스타트 설정



#### CRON과 AT

##### cron

* 주기적으로 반복되는 일을 자동으로 실행할 수 있도록 시스템 작업을 예약해 놓은 것
* `crond` : cron과 관련된 데몬(서비스)
* `/etc/crontab` : cron 관련 파일
  * 분 시 일 월 요일 사용자 실행명령
    * 분 : 0~59
    * 시 : 0~23
    * 일 : 1~31
    * 월 : 1~12
    * 요일 : 0~6, 0부터 일요일로 시작
    * 사용자 : 명령을 실행할 사용자
    * 실행 명령 : 그 시간에 실행할 명령
    * ex) 00 05 1 * * root cp -r /home /backup
      * 매월 1일 새벽 5시 00분에 실행
      * 사용자는 root 권한
      * `/home` 디렉터리를 통째로 `/backup` 디렉터리에 복사



##### at

* `cron`은 주기적으로 반복되는 작업을 예약하는 것이지만, `at` 명령어는 일회성 작업을 예약하는 것이다.

* 예약해 놓으면 한 번만 실행되고 소멸된다.

* 예약

  ```bash
  $ at 시간
  $ at 3:00am tomorrow
  $ at now+1hours
  ```

  at> 프롬프트에 예약 명령어 입력 후 `Enter`

  완료되면 `Ctrl` + `d`

* 확인

  ```bash
  $ at -l
  ```

* 취소

  ```bash
  $ atrm 작업번호
  ```

  

