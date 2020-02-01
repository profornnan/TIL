# CentOS 7 Linux_4_2

## 4. 서버를 구축할 때 알아야 할 필수 개념과 명령어

### 4.2 리눅스 기본 명령어

* ls

  * LiSt의 약자로 Windows의 `dir`과 같은 역할을 한다.

  * 해당 디렉터리에 있는 파일의 목록을 나열한다.

    ```bash
    $ ls					# 현재 디렉터리의 파일 목록
    $ ls /etc/sysconfig		# /etc/sysconfig 디렉터리의 목록
    $ ls -a					# 현재 디렉터리의 목록(숨긴 파일 포함)
    $ ls -l					# 현재 디렉터리의 목록을 자세히 보여줌
    $ ls *.cfg				# 확장자가 cfg인 목록을 보여줌
    ```

* cd

  * Change Directory의 약자로 디렉터리를 이동하는 명령이다.

    ```bash
    $ cd				# 현재 사용자의 홈 디렉터리로 이동
    $ cd ~centos		# centos 사용자의 홈 디렉터리로 이동
    $ cd ..				# 바로 상위의 디렉터리로 이동
    $ cd /etc/sysconfig	# /etc/sysconfig 디렉터리로 이동
    ```

    `.` : 현재 디렉터리

    `..` : 현재 디렉터리의 상위 디렉터리

* pwd

  * Print Working Directory의 약자로 현재 디렉터리의 전체 경로를 화면에 보여준다.

    ```bash
    $ pwd		# 현재 작업 중인 디렉터리의 경로 출력
    ```

* rm

  * ReMove의 약자로 파일이나 디렉터리를 삭제한다.

  * 파일이나 디렉터리를 삭제할 권한이 있어야 한다.

  * root 사용자는 모든 권한이 있으므로 이 명령에 제약이 없다.

    ```bash
    $ rm abc.txt
    ```

    `-i` : 삭제 시 정말 삭제할지 확인

    `-f` : 삭제 시 확인하지 않고 바로 삭제

    `-r` : 해당 디렉터리를 삭제 (Recursive)

* cp

  * CoPy의 약자로 파일이나 디렉터리를 복사한다.

  * 새로 복사한 파일은 복사한 사용자의 소유가 된다.

  * 명령어를 실행하는 사용자는 해당 파일의 읽기 권한이 필요하다.

    ```bash
    $ cp abc.txt cba.txt
    ```

* touch

  * 크기가 0인 파일 생성

  * 이미 파일이 존재한다면 파일의 최종 수정 시간을 변경

    ```bash
    $ touch abc.txt
    ```

* mv

  * MoVe의 약자로 파일이나 디렉터리의 이름을 변경하거나 다른 디렉터리로 옮길 때 사용

    ```bash
    $ mv abc.txt /etc/sysconfig/	# abc.txt를 /etc/sysconfig/ 디렉터리로 이동
    $ mv abc.txt www.txt		# abc.txt의 이름을 www.txt로 변경해서 이동
    ```

* mkdir

  * MaKe DIRectory의 약자

  * 새로운 디렉터리를 생성

  * 생성한 디렉터리는 명령어를 실행한 사용자의 소유가 됨

    ```bash
    $ mkdir abc
    ```

* rmdir

  * ReMove DIRectory의 약자

  * 디렉터리를 삭제한다.

  * 해당 디렉터리의 삭제 권한이 있어야 한다.

  * 디렉터리는 비어있어야 한다.

  * 파일이 들어있는 디렉터리를 삭제하려면 `rm -r`을 실행

    ```bash
    $ rmdir abc
    ```

* cat

  * conCATenate의 약자

  * 파일의 내용을 화면에 보여준다.

  * 여러 개 파일을 나열하면 파일을 연결해서 보여준다.

    ```bash
    $ cat a.txt b.txt
    ```

* head, tail

  * 텍스트 형식으로 작성된 파일의 앞 10행 또는 마지막 10행만 화면에 출력

    ```bash
    $ head anaconda-ks.cfg
    $ tail -5 anaconda-ks.cfg
    ```

* more

  * 텍스트 형식으로 지정된 파일을 페이지 단위로 화면에 출력

  * `Space` : 다음 페이지로 이동

  * `b` : 앞 페이지로 이동

  * `q` : 종료

    ```bash
    $ more anaconda-ks.cfg
    ```

* less

  * `more` 명령어와 용도가 비슷하지만 기능이 더 확장됨

  * `more`에서 사용하는 키를 사용 가능

  * 화살표 키나 `Page Up`, `Page Down`도 사용 가능

    ```bash
    $ less anaconda-ks.cfg
    ```

* file

  * 해당 파일이 어떤 종류의 파일인지 표시

* clear

  * 현재 사용중인 터미널 화면을 지운다.



