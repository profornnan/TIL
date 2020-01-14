# OpenStack

### Manual 설치




manual 설치(https://docs.openstack.org/install-guide/)



![image-20200110092840674](images/image-20200110092840674.png)



---

**Host networking -> Controller node**



```bash
[root@controller ~]# vi /etc/sysconfig/network-scripts/ifcfg-ens33

...
#UUID="709b9796-b767-46c9-9aa1-1061c8691874"
...
IPADDR="10.0.0.11"
...
```



```bash
[root@controller ~]# systemctl restart network
[root@controller ~]# ip a
```



Xshell5 에서 manual controller 접속

![image-20200110091921705](images/image-20200110091921705.png)



![image-20200110091931505](images/image-20200110091931505.png)



```bash
[root@controller ~]# vi /etc/hosts

127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
10.0.0.11 controller
10.0.0.31 compute1
```

100번 호스트를 복사했으므로 IP가 100으로 남아있다. 위와 같이 수정



---

**Network Time Protocol (NTP) -> Controller node**



```bash
[root@controller ~]# yum install chrony -y
```



```bash
[root@controller ~]# vi /etc/chrony.conf

# Use public servers from the pool.ntp.org project.
# Please consider joining the pool (http://www.pool.ntp.org/join.html).
server 0.centos.pool.ntp.org iburst
server 1.centos.pool.ntp.org iburst
#server 2.centos.pool.ntp.org iburst
#server 3.centos.pool.ntp.org iburst
server 10.0.0.100 iburst
```

서버 3개 지정



```bash
[root@controller ~]# date
2020. 01. 10. (금) 09:40:52 KST
```



```bash
[root@controller ~]# systemctl status chronyd
● chronyd.service - NTP client/server
   Loaded: loaded (/usr/lib/systemd/system/chronyd.service; enabled; vendor preset: enabled)
   Active: active (running) since 금 2020-01-10 02:48:46 KST; 6h ago
     Docs: man:chronyd(8)
           man:chrony.conf(5)
  Process: 789 ExecStartPost=/usr/libexec/chrony-helper update-daemon (code=exited, status=0/SUCCESS)
  Process: 743 ExecStart=/usr/sbin/chronyd $OPTIONS (code=exited, status=0/SUCCESS)
 Main PID: 757 (chronyd)
   CGroup: /system.slice/chronyd.service
           └─757 /usr/sbin/chronyd

 1월 10 02:48:45 controller chronyd[757]: Frequency -28.574 +/- 0.485 ppm read from /var/lib/chrony/drift
 1월 10 02:48:46 controller systemd[1]: Started NTP client/server.
 1월 10 02:52:08 controller chronyd[757]: Selected source 211.233.84.186
 1월 10 02:52:08 controller chronyd[757]: System clock wrong by -32398.026858 seconds, adjustment started
 1월 09 17:52:10 controller chronyd[757]: System clock was stepped by -32398.026858 seconds
 1월 10 09:01:40 controller chronyd[757]: Forward time jump detected!
 1월 10 09:01:40 controller chronyd[757]: Can't synchronise: no selectable sources
 1월 10 09:03:50 controller chronyd[757]: Selected source 211.233.84.186
 1월 10 09:03:50 controller chronyd[757]: System clock wrong by 1.266430 seconds, adjustment started
 1월 10 09:09:13 controller chronyd[757]: Selected source 106.247.248.106
```



```bash
[root@controller ~]# systemctl restart chronyd
```



```bash
[root@controller ~]# chronyc sources
210 Number of sources = 3
MS Name/IP address         Stratum Poll Reach LastRx Last sample               
===============================================================================
^? 10.0.0.100                    0   7     0     -     +0ns[   +0ns] +/-    0ns
^+ send.mx.cdnetworks.com        2   6    17     4   +705us[ +590us] +/-   47ms
^* 106.247.248.106               2   6    17     6   -334us[ -449us] +/-   19ms
```

10.0.0.100번한테 시간을 요청해 time을 받아온다.



---

**OpenStack packages -> OpenStack packages for RHEL and CentOS**



```bash
[root@controller ~]# yum repolist
```



```bash
[root@controller ~]# yum install python-openstackclient -y
```



```bash
[root@controller ~]# yum install openstack-selinux -y
```



---

**SQL database -> SQL database for RHEL and CentOS**



여러 서비스에 대한 메타 정보를 DB로 관리한다.



```bash
[root@controller ~]# yum install mariadb mariadb-server python2-PyMySQL -y
```



```bash
[root@controller ~]# vi /etc/my.cnf.d/openstack.cnf

[mysqld]
bind-address = 10.0.0.11

default-storage-engine = innodb
innodb_file_per_table = on
max_connections = 4096
collation-server = utf8_general_ci
character-set-server = utf8
```

DB를 시작하는데 필요한 Parameter만 수정

bind-address : 여러 인터페이스 중 특정 인터페이스에서 들어오는 request만 처리함. 0.0.0.0인 경우 any



```bash
[root@controller ~]# systemctl enable mariadb.service
Created symlink from /etc/systemd/system/multi-user.target.wants/mariadb.service to /usr/lib/systemd/system/mariadb.service.
```



```bash
[root@controller ~]# systemctl start mariadb.service
```



```bash
[root@controller ~]# mysql_secure_installation
```

root 비밀번호 설정, 불필요한 보안상의 이슈 제거

비번 abc123으로 설정

모든 설정 전부 Yes



```bash
[root@controller ~]# mysql -uroot -pabc123
```



```mariadb
MariaDB [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
+--------------------+
3 rows in set (0.00 sec)
```



---

**Message queue -> Message queue for RHEL and CentOS**



![image-20200110102346724](images/image-20200110102346724.png)



queue 메커니즘을 사용하게 되면 sender들은 receiver들이 바쁘다고 하더라도 queue에 요청사항을 보내고 자신이 할 일을 할 수 있다.

직접 요청하는 것이 sync

queue에 요청사항을 보내는 방식 async

queue 메커니즘을 사용하는 것이 (비동기적으로 하는 것이) 클라우드 기반으로 여러 서비스를 만들어서 서비스 간 연동을 할 때 서비스에 대한 확장을 flexable하게 할 수 있다.

마이크로 서비스 아키텍처의 중요한 구성 요소. 약결합 아키텍처



```bash
[root@controller ~]# yum install rabbitmq-server -y
```



```bash
[root@controller ~]# yum install -y openstack-utils
```



```bash
[root@controller ~]# openstack-status
== Support services ==
dbus:                                   active
rabbitmq-server:                        active
```



```bash
[root@controller ~]# systemctl enable rabbitmq-server.service
Created symlink from /etc/systemd/system/multi-user.target.wants/rabbitmq-server.service to /usr/lib/systemd/system/rabbitmq-server.service.
```



```bash
[root@controller ~]# systemctl start rabbitmq-server.service
```



```bash
[root@controller mysql]# rabbitmqctl add_user openstack RABBIT_PASS
Creating user "openstack"
```



```bash
[root@controller ~]# rabbitmqctl set_permissions openstack ".*" ".*" ".*"
Setting permissions for user "openstack" in vhost "/"
```

write, read 권한을 설정한다. 모든 사용자에 대해 권한을 준다.



```bash
[root@controller ~]# rabbitmqctl status
```



controller(10.0.0.100)에서 실행

```bash
[root@controller ~]# grep rabbit /etc/*/*conf
...
/etc/nova/nova.conf:#rabbit_userid=guest
/etc/nova/nova.conf:#rabbit_password=guest
...
```

all-in-one으로 구성된 100번에서는 rabbit이 guest로 구성되어있다.



---

**Memcached -> Memcached for RHEL and CentOS**



DB쪽 성능저하를 개선하기 위한 서비스. 



```bash
[root@controller ~]# yum install memcached python-memcached -y
```



```bash
[root@controller ~]# vi /etc/sysconfig/memcached

PORT="11211"
USER="memcached"
MAXCONN="1024"
CACHESIZE="64"
OPTIONS="-l 127.0.0.1,::1,10.0.0.11"
```



```bash
[root@controller ~]# systemctl enable memcached.service
Created symlink from /etc/systemd/system/multi-user.target.wants/memcached.service to /usr/lib/systemd/system/memcached.service.
```



```bash
[root@controller ~]# systemctl start memcached.service
```



```bash
[root@controller ~]# systemctl status memcached.service
● memcached.service - memcached daemon
   Loaded: loaded (/usr/lib/systemd/system/memcached.service; enabled; vendor preset: disabled)
   Active: active (running) since 금 2020-01-10 10:38:40 KST; 13s ago
 Main PID: 14146 (memcached)
   CGroup: /system.slice/memcached.service
           └─14146 /usr/bin/memcached -p 11211 -u memcached -m 64 -c 1024 -l 127.0.0.1,::1,10.0.0.11

 1월 10 10:38:40 controller systemd[1]: Started memcached daemon.
[root@controller ~]# ss -nlp|grep 11211
tcp    LISTEN     0      128    10.0.0.11:11211                 *:*                   users:(("memcached",pid=14146,fd=28))
tcp    LISTEN     0      128    127.0.0.1:11211                 *:*                   users:(("memcached",pid=14146,fd=26))
tcp    LISTEN     0      128       [::1]:11211              [::]:*                   users:(("memcached",pid=14146,fd=27))
```





controller(10.0.0.100) all-in-one 쪽에서 확인

```bash
[root@controller ~]# ss -nlp|grep 11211
udp    UNCONN     0      0         *:11211                 *:*                   users:(("memcached",pid=5592,fd=18),("memcached",pid=5592,fd=17))
tcp    LISTEN     0      128       *:11211                 *:*                   users:(("memcached",pid=5592,fd=16))
[root@controller ~]# cat /etc/sysconfig/memcached 
PORT="11211"
USER="memcached"
MAXCONN="8192"
CACHESIZE="566"
OPTIONS="-l 0.0.0.0 -U 11211 -t 2 >> /var/log/memcached.log 2>&1"
```



---

## Install OpenStack services



![image-20200110104311773](images/image-20200110104311773.png)



**Identity service – keystone installation for Rocky**

-> **Keystone Installation Tutorial for Red Hat Enterprise Linux and CentOS**

-> **Prerequisites**



https://docs.openstack.org/keystone/rocky/install/keystone-install-rdo.html#prerequisites



```bash
[root@controller ~]# mysql -uroot -pabc123
```



```mariadb
MariaDB [(none)]> CREATE DATABASE keystone;
Query OK, 1 row affected (0.00 sec)

MariaDB [(none)]> GRANT ALL PRIVILEGES ON keystone.* TO 'keystone'@'localhost' \
    -> IDENTIFIED BY 'KEYSTONE_DBPASS';
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> GRANT ALL PRIVILEGES ON keystone.* TO 'keystone'@'%' \
    -> IDENTIFIED BY 'KEYSTONE_DBPASS';
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> exit
Bye
```

사전 작업으로 keystone의 메타 정보를 유지 관리할 database 생성

local에서 keystone으로 접속할 수 있는account 2개 생성

accout의 비번 설정



```bash
[root@controller ~]# yum install openstack-keystone httpd mod_wsgi -y
```





controller(10.0.0.100) 에서 확인

```bash
[root@controller ~]# ls -l /etc/keystone/keystone.conf 
-rw-r-----. 1 root keystone 120342  1월  8 14:24 /etc/keystone/keystone.conf
```

keystone이라는 파일 자체는 일반 사용자들이 볼 수 없도록 read 권한이 없어야 한다.



```bash
[root@controller ~]# vi /etc/keystone/keystone.conf

    741 #connection = <None>
    742 connection = mysql+pymysql://keystone:KEYSTONE_DBPASS@controller/keystone
    ...
   2829 provider = fernet
```



```bash
[root@controller ~]# su -s /bin/sh -c "keystone-manage db_sync" keystone
```



```bash
[root@controller mysql]# ls /var/lib/mysql/keystone/
access_token.frm                 group.frm              policy.ibd                  service.frm
access_token.ibd                 group.ibd              policy_association.frm      service.ibd
...
```

파일들이 생성되었는지 확인



```bash
[root@controller mysql]# keystone-manage fernet_setup --keystone-user keystone --keystone-group keystone
```



```bash
[root@controller mysql]# keystone-manage credential_setup --keystone-user keystone --keystone-group keystone
```





controller(10.0.0.100) 에서 확인

```bash
[root@controller ~]# . keystonerc_admin 

[root@controller ~(keystone_admin)]# openstack endpoint list
+----------------------------------+-----------+--------------+--------------+---------+-----------+----------------------------------------------+
| ID                               | Region    | Service Name | Service Type | Enabled | Interface | URL                                          |
+----------------------------------+-----------+--------------+--------------+---------+-----------+----------------------------------------------+
| 0495b85634f94a859d459106f102000d | RegionOne | keystone     | identity     | True    | internal  | http://10.0.0.100:5000/v3                    |
| 0783fc5670014363afbe0174587c9546 | RegionOne | placement    | placement    | True    | admin     | http://10.0.0.100:8778/placement             |
| 0ffb139868fd4c48b0a5ecabbd71dd34 | RegionOne | swift        | object-store | True    | public    | http://10.0.0.100:8080/v1/AUTH_%(tenant_id)s |
| 1a7389ab90b44f68b9739675a8c6682e | RegionOne | keystone     | identity     | True    | public    | http://10.0.0.100:5000/v3                    |
| 1a89470697ef4749a11a2380dbdd0944 | RegionOne | neutron      | network      | True    | admin     | http://10.0.0.100:9696                       |
| 1d87ec2648f842d0a9abf9fb015b8010 | RegionOne | swift        | object-store | True    | admin     | http://10.0.0.100:8080/v1/AUTH_%(tenant_id)s |
| 22497281d2724b41bdffae454bd42570 | RegionOne | cinderv2     | volumev2     | True    | public    | http://10.0.0.100:8776/v2/%(tenant_id)s      |
| 2950e4f82d23423b9161a001d82fae43 | RegionOne | cinderv3     | volumev3     | True    | admin     | http://10.0.0.100:8776/v3/%(tenant_id)s      |
| 34a5bcc3fff74c34b568ef5eab10ffed | RegionOne | nova         | compute      | True    | admin     | http://10.0.0.100:8774/v2.1/%(tenant_id)s    |
| 374e17821bbf46a2a3797106e5b0b888 | RegionOne | cinderv2     | volumev2     | True    | admin     | http://10.0.0.100:8776/v2/%(tenant_id)s      |
| 54c8fa1258634a768ed1855bff9870cb | RegionOne | placement    | placement    | True    | internal  | http://10.0.0.100:8778/placement             |
| 56587d0a6b9a423f81d2ad53ad500998 | RegionOne | nova         | compute      | True    | internal  | http://10.0.0.100:8774/v2.1/%(tenant_id)s    |
| 624ba6d3df754b108c9a60358d0e7b00 | RegionOne | neutron      | network      | True    | internal  | http://10.0.0.100:9696                       |
| 62fd84303eeb4dc3a389a880e8799d9d | RegionOne | cinderv3     | volumev3     | True    | public    | http://10.0.0.100:8776/v3/%(tenant_id)s      |
| 66060d5727cf44e681c3c8c6ce4f7dc4 | RegionOne | nova         | compute      | True    | public    | http://10.0.0.100:8774/v2.1/%(tenant_id)s    |
| 8ca17b1e498841dd97ab4bccfb2b2967 | RegionOne | glance       | image        | True    | internal  | http://10.0.0.100:9292                       |
| 8ea7b257ddfb4bcfba2ca5b7449b962d | RegionOne | keystone     | identity     | True    | admin     | http://10.0.0.100:35357/v3                   |
| 958b80aeb3bb430283cf187de7384f74 | RegionOne | glance       | image        | True    | admin     | http://10.0.0.100:9292                       |
| 99c5ef5ae71741d4b7ae012371568398 | RegionOne | glance       | image        | True    | public    | http://10.0.0.100:9292                       |
| 9f96e284470f4b4a85ba1a6f4f9cb3c1 | RegionOne | cinderv3     | volumev3     | True    | internal  | http://10.0.0.100:8776/v3/%(tenant_id)s      |
| a132be202b284794bda6a04648463fe2 | RegionOne | cinder       | volume       | True    | public    | http://10.0.0.100:8776/v1/%(tenant_id)s      |
| b63c28a23d4145969915ebf439bd7457 | RegionOne | neutron      | network      | True    | public    | http://10.0.0.100:9696                       |
| ba269b62e40c477980c1b5a2e5768d3b | RegionOne | cinderv2     | volumev2     | True    | internal  | http://10.0.0.100:8776/v2/%(tenant_id)s      |
| bacb6655be7b4a07915389a51fffaf7c | RegionOne | cinder       | volume       | True    | internal  | http://10.0.0.100:8776/v1/%(tenant_id)s      |
| de965e4d2f394e9680527ddc61bb8ba7 | RegionOne | placement    | placement    | True    | public    | http://10.0.0.100:8778/placement             |
| e5d3ddb47d2d4a939e79501375e68b62 | RegionOne | swift        | object-store | True    | internal  | http://10.0.0.100:8080/v1/AUTH_%(tenant_id)s |
| ee53297e95634d3698b10d7c1d04d3d0 | RegionOne | cinder       | volume       | True    | admin     | http://10.0.0.100:8776/v1/%(tenant_id)s      |
+----------------------------------+-----------+--------------+--------------+---------+-----------+----------------------------------------------+

[root@controller ~(keystone_admin)]# openstack catalog list
+-----------+--------------+-----------------------------------------------------------------------------+
| Name      | Type         | Endpoints                                                                   |
+-----------+--------------+-----------------------------------------------------------------------------+
| nova      | compute      | RegionOne                                                                   |
|           |              |   admin: http://10.0.0.100:8774/v2.1/6d3ec878ce184a74af20101c98f38f3e       |
|           |              | RegionOne                                                                   |
|           |              |   internal: http://10.0.0.100:8774/v2.1/6d3ec878ce184a74af20101c98f38f3e    |
|           |              | RegionOne                                                                   |
|           |              |   public: http://10.0.0.100:8774/v2.1/6d3ec878ce184a74af20101c98f38f3e      |
|           |              |                                                                             |
| placement | placement    | RegionOne                                                                   |
|           |              |   admin: http://10.0.0.100:8778/placement                                   |
|           |              | RegionOne                                                                   |
|           |              |   internal: http://10.0.0.100:8778/placement                                |
|           |              | RegionOne                                                                   |
|           |              |   public: http://10.0.0.100:8778/placement                                  |
|           |              |                                                                             |
| keystone  | identity     | RegionOne                                                                   |
|           |              |   internal: http://10.0.0.100:5000/v3                                       |
|           |              | RegionOne                                                                   |
|           |              |   public: http://10.0.0.100:5000/v3                                         |
|           |              | RegionOne                                                                   |
|           |              |   admin: http://10.0.0.100:35357/v3                                         |
|           |              |                                                                             |
| neutron   | network      | RegionOne                                                                   |
|           |              |   admin: http://10.0.0.100:9696                                             |
|           |              | RegionOne                                                                   |
|           |              |   internal: http://10.0.0.100:9696                                          |
|           |              | RegionOne                                                                   |
|           |              |   public: http://10.0.0.100:9696                                            |
|           |              |                                                                             |
| glance    | image        | RegionOne                                                                   |
|           |              |   internal: http://10.0.0.100:9292                                          |
|           |              | RegionOne                                                                   |
|           |              |   admin: http://10.0.0.100:9292                                             |
|           |              | RegionOne                                                                   |
|           |              |   public: http://10.0.0.100:9292                                            |
|           |              |                                                                             |
| cinderv3  | volumev3     | RegionOne                                                                   |
|           |              |   admin: http://10.0.0.100:8776/v3/6d3ec878ce184a74af20101c98f38f3e         |
|           |              | RegionOne                                                                   |
|           |              |   public: http://10.0.0.100:8776/v3/6d3ec878ce184a74af20101c98f38f3e        |
|           |              | RegionOne                                                                   |
|           |              |   internal: http://10.0.0.100:8776/v3/6d3ec878ce184a74af20101c98f38f3e      |
|           |              |                                                                             |
| cinderv2  | volumev2     | RegionOne                                                                   |
|           |              |   public: http://10.0.0.100:8776/v2/6d3ec878ce184a74af20101c98f38f3e        |
|           |              | RegionOne                                                                   |
|           |              |   admin: http://10.0.0.100:8776/v2/6d3ec878ce184a74af20101c98f38f3e         |
|           |              | RegionOne                                                                   |
|           |              |   internal: http://10.0.0.100:8776/v2/6d3ec878ce184a74af20101c98f38f3e      |
|           |              |                                                                             |
| swift     | object-store | RegionOne                                                                   |
|           |              |   public: http://10.0.0.100:8080/v1/AUTH_6d3ec878ce184a74af20101c98f38f3e   |
|           |              | RegionOne                                                                   |
|           |              |   admin: http://10.0.0.100:8080/v1/AUTH_6d3ec878ce184a74af20101c98f38f3e    |
|           |              | RegionOne                                                                   |
|           |              |   internal: http://10.0.0.100:8080/v1/AUTH_6d3ec878ce184a74af20101c98f38f3e |
|           |              |                                                                             |
| cinder    | volume       | RegionOne                                                                   |
|           |              |   public: http://10.0.0.100:8776/v1/6d3ec878ce184a74af20101c98f38f3e        |
|           |              | RegionOne                                                                   |
|           |              |   internal: http://10.0.0.100:8776/v1/6d3ec878ce184a74af20101c98f38f3e      |
|           |              | RegionOne                                                                   |
|           |              |   admin: http://10.0.0.100:8776/v1/6d3ec878ce184a74af20101c98f38f3e         |
|           |              |                                                                             |
+-----------+--------------+-----------------------------------------------------------------------------+
```





```bash
[root@controller mysql]# keystone-manage bootstrap --bootstrap-password ADMIN_PASS \
>   --bootstrap-admin-url http://controller:5000/v3/ \
>   --bootstrap-internal-url http://controller:5000/v3/ \
>   --bootstrap-public-url http://controller:5000/v3/ \
>   --bootstrap-region-id RegionOne
```

PW가 ADMIN_PASS

keystone에 대한 endpoint 등록



```bash
[root@controller mysql]# vi /etc/httpd/conf/httpd.conf

     95 #ServerName www.example.com:80
     96 ServerName controller
```



```bash
[root@controller mysql]# ln -s /usr/share/keystone/wsgi-keystone.conf /etc/httpd/conf.d/
```



```bash
[root@controller mysql]# systemctl enable httpd.service
Created symlink from /etc/systemd/system/multi-user.target.wants/httpd.service to /usr/lib/systemd/system/httpd.service.
```



```bash
[root@controller mysql]# systemctl start httpd.service
```



````bash
[root@controller mysql]# systemctl status httpd.service
● httpd.service - The Apache HTTP Server
   Loaded: loaded (/usr/lib/systemd/system/httpd.service; enabled; vendor preset: disabled)
   Active: active (running) since 금 2020-01-10 11:24:45 KST; 27s ago
     Docs: man:httpd(8)
           man:apachectl(8)
 Main PID: 17290 (httpd)
   Status: "Total requests: 0; Current requests/sec: 0; Current traffic:   0 B/sec"
   CGroup: /system.slice/httpd.service
           ├─17290 /usr/sbin/httpd -DFOREGROUND
           ├─17291 (wsgi:keystone- -DFOREGROUND
           ├─17292 (wsgi:keystone- -DFOREGROUND
           ├─17293 (wsgi:keystone- -DFOREGROUND
           ├─17294 (wsgi:keystone- -DFOREGROUND
           ├─17295 (wsgi:keystone- -DFOREGROUND
           ├─17296 /usr/sbin/httpd -DFOREGROUND
           ├─17297 /usr/sbin/httpd -DFOREGROUND
           ├─17298 /usr/sbin/httpd -DFOREGROUND
           ├─17299 /usr/sbin/httpd -DFOREGROUND
           └─17300 /usr/sbin/httpd -DFOREGROUND

 1월 10 11:24:45 controller systemd[1]: Starting The Apache HTTP Server...
 1월 10 11:24:45 controller systemd[1]: Started The Apache HTTP Server.
````



```bash
[root@controller mysql]# export OS_USERNAME=admin
[root@controller mysql]# export OS_PASSWORD=ADMIN_PASS
[root@controller mysql]# export OS_PROJECT_NAME=admin
[root@controller mysql]# export OS_USER_DOMAIN_NAME=Default
[root@controller mysql]# export OS_PROJECT_DOMAIN_NAME=Default
[root@controller mysql]# export OS_AUTH_URL=http://controller:5000/v3
[root@controller mysql]# export OS_IDENTITY_API_VERSION=3
```



```bash
[root@controller mysql]# openstack user list
+----------------------------------+-------+
| ID                               | Name  |
+----------------------------------+-------+
| c8c3256ae1cc4228b0317ceccda27669 | admin |
+----------------------------------+-------+
```



홈페이지 아래쪽 NEXT 버튼 클릭



---

### Create a domain, projects, users, and roles



```bash
[root@controller mysql]# openstack project create --domain default --description "Service Project" service
+-------------+----------------------------------+
| Field       | Value                            |
+-------------+----------------------------------+
| description | Service Project                  |
| domain_id   | default                          |
| enabled     | True                             |
| id          | 8903ece984094ae686fe22fe702a224c |
| is_domain   | False                            |
| name        | service                          |
| parent_id   | default                          |
| tags        | []                               |
+-------------+----------------------------------+
```



```bash
[root@controller mysql]# openstack project create --domain default --description "Demo Project" myproject
+-------------+----------------------------------+
| Field       | Value                            |
+-------------+----------------------------------+
| description | Demo Project                     |
| domain_id   | default                          |
| enabled     | True                             |
| id          | 511cbecdca1f4fafbcb90f2618124bbd |
| is_domain   | False                            |
| name        | myproject                        |
| parent_id   | default                          |
| tags        | []                               |
+-------------+----------------------------------+
```



```bash
[root@controller mysql]# openstack user create --domain default --password abc123 myuser
+---------------------+----------------------------------+
| Field               | Value                            |
+---------------------+----------------------------------+
| domain_id           | default                          |
| enabled             | True                             |
| id                  | 80cc304f8aef48dab67b176ec247614d |
| name                | myuser                           |
| options             | {}                               |
| password_expires_at | None                             |
+---------------------+----------------------------------+
```



```bash
[root@controller mysql]# openstack role create myrole
+-----------+----------------------------------+
| Field     | Value                            |
+-----------+----------------------------------+
| domain_id | None                             |
| id        | 821410e86bb34666a385122aec4cb668 |
| name      | myrole                           |
+-----------+----------------------------------+
```



```bash
[root@controller mysql]# openstack role add --project myproject --user myuser myrole
```

myproject에 myrole을 assign



우측 하단 NEXT 버튼 2번 클릭



---

### Create OpenStack client environment scripts



환경 변수 설정 Script 작성



controller(10.0.0.100) 에서 확인

```bash
[root@controller ~]# . keystonerc_admin 
[root@controller ~(keystone_admin)]# cat keystonerc_admin 
unset OS_SERVICE_TOKEN
    export OS_USERNAME=admin
    export OS_PASSWORD='abc123'
    export OS_REGION_NAME=RegionOne
    export OS_AUTH_URL=http://10.0.0.100:5000/v3
    export PS1='[\u@\h \W(keystone_admin)]\$ '
    
export OS_PROJECT_NAME=admin
export OS_USER_DOMAIN_NAME=Default
export OS_PROJECT_DOMAIN_NAME=Default
export OS_IDENTITY_API_VERSION=3
    [root@controller ~(keystone_admin)]# 
```

PS1 : Shell에서의 프롬프트 모양을 변경하는 환경변수



```bash
[root@controller ~]# vi admin-openrc

export OS_PROJECT_DOMAIN_NAME=Default
export OS_USER_DOMAIN_NAME=Default
export OS_PROJECT_NAME=admin
export OS_USERNAME=admin
export OS_PASSWORD=ADMIN_PASS
export OS_AUTH_URL=http://controller:5000/v3
export OS_IDENTITY_API_VERSION=3
export OS_IMAGE_API_VERSION=2
export PS1='[\u@\h \W(keystone_admin)]\$ '
```



```bash
[root@controller ~]# . admin-openrc
[root@controller ~(keystone_admin)]# 
```



```bash
[root@controller ~(keystone_admin)]# vi demo-openrc

export OS_PROJECT_DOMAIN_NAME=Default
export OS_USER_DOMAIN_NAME=Default
export OS_PROJECT_NAME=myproject
export OS_USERNAME=myuser
export OS_PASSWORD=abc123
export OS_AUTH_URL=http://controller:5000/v3
export OS_IDENTITY_API_VERSION=3
export OS_IMAGE_API_VERSION=2
export PS1='[\u@\h \W(keystone_myuser)]\$ '
```

비밀번호 abc123으로 설정



```bash
[root@controller ~(keystone_admin)]# . demo-openrc 
[root@controller ~(keystone_myuser)]# 
```



```bash
[root@controller ~(keystone_admin)]# openstack user list
+----------------------------------+--------+
| ID                               | Name   |
+----------------------------------+--------+
| 80cc304f8aef48dab67b176ec247614d | myuser |
| c8c3256ae1cc4228b0317ceccda27669 | admin  |
+----------------------------------+--------+
```



```bash
[root@controller ~(keystone_myuser)]# openstack token issue
+------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Field      | Value                                                                                                                                                                                   |
+------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| expires    | 2020-01-10T05:30:10+0000                                                                                                                                                                |
| id         | gAAAAABeF_3Sa0XRgsaDeKcQq1_Ti8g-uGZIMurNini5fRL4i8SlyET55Faq2pYvONdDrUcqCiLnuFqXuOiyz06yLrK3idDvUVHb3HLZ3-3EfSmyj1SrHL2WXxwah6U6-HsmCP_Ja3Rg0G8uH9ZoxvL12gaCWOrBHDHs2-7Sl6EekDFH8wk7Cg0 |
| project_id | 511cbecdca1f4fafbcb90f2618124bbd                                                                                                                                                        |
| user_id    | 80cc304f8aef48dab67b176ec247614d                                                                                                                                                        |
+------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```



---



책 p99 ~



책 p110 4번

permissive : disable이기는 하지만 접근에 관련된 문제가 있을 경우 로그에 기록을 남기는 모드



---

## Image Service (Glance)



root-disk의 이미지를 제공

API를 제공한다 -> 프로그래밍을 할 수 있다.



이미지를 등록해야 NOVA에서 사용 가능하다.



강의자료 p 222

glance-api를 glance-registry에 넘겨준다.

파일에 대한 메타 정보들만 DB에 들어간다. 그것을 등록하는 것이 glance-registry



### CLI로 구성하는 glance (서비스 사용하기)

file이라는 명령어로 확인

CLI 명령을 사용할 때 추가적인 옵션이 필요하다. 디스크 포맷



책 p168

RAW : snapshot, 압축, 암호화 지원 안한다.

보통 qcow2 사용



bare : 순수한 디스크 이미지

ovf : VM과 같은 가상화 SW같은 경우 export 기능 제공. 디스크 뿐만 아니라 메타 구성 파일도 하나의 파일로 아카이빙 한다. 그대로 다른 물리적인 시스템에 이관. export한 이미지를 그대로 glance에 올릴 수 있다.



controller(10.0.0.100)

```bash
[root@controller ~(keystone_admin)]# glance image-list
+--------------------------------------+------------+
| ID                                   | Name       |
+--------------------------------------+------------+
| d3fdf81a-7186-47f6-ad71-441e1147ef3f | class      |
| a41300a7-8872-46bf-88c1-fbaa16a799ad | class-snap |
+--------------------------------------+------------+
```

서비스 커맨드의 CLI는 - 필요.



```bash
[root@controller ~(keystone_admin)]# openstack image list
+--------------------------------------+------------+--------+
| ID                                   | Name       | Status |
+--------------------------------------+------------+--------+
| d3fdf81a-7186-47f6-ad71-441e1147ef3f | class      | active |
| a41300a7-8872-46bf-88c1-fbaa16a799ad | class-snap | active |
+--------------------------------------+------------+--------+
```



---

## Glance Installation




https://docs.openstack.org/glance/rocky/install/

-> **Install and configure (Red Hat)**




https://docs.openstack.org/glance/rocky/install/install-rdo.html



```bash
[root@controller ~(keystone_myuser)]# mysql -uroot -pabc123
```

mysql 접속



```mysql
MariaDB [(none)]> CREATE DATABASE glance;
Query OK, 1 row affected (0.00 sec)
```

glance database 생성



```mysql
MariaDB [(none)]> GRANT ALL PRIVILEGES ON glance.* TO 'glance'@'localhost' \
    ->   IDENTIFIED BY 'GLANCE_DBPASS';
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> GRANT ALL PRIVILEGES ON glance.* TO 'glance'@'%' \
    ->   IDENTIFIED BY 'GLANCE_DBPASS';
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> exit
Bye
```



```bash
[root@controller ~(keystone_myuser)]# . admin-openrc 
[root@controller ~(keystone_admin)]# openstack user create --domain default --password GLANCE_PASS glance
+---------------------+----------------------------------+
| Field               | Value                            |
+---------------------+----------------------------------+
| domain_id           | default                          |
| enabled             | True                             |
| id                  | ea0e5e2f94a4434a9f905f050fb5fe72 |
| name                | glance                           |
| options             | {}                               |
| password_expires_at | None                             |
+---------------------+----------------------------------+
```

오류가 났을 경우 openstack user set --domain default --password GLANCE_PASS glance 이용



```bash
[root@controller ~(keystone_admin)]# openstack role add --project service --user glance admin
```

role 등록



```bash
[root@controller ~(keystone_admin)]# openstack service create --name glance \
>   --description "OpenStack Image" image
+-------------+----------------------------------+
| Field       | Value                            |
+-------------+----------------------------------+
| description | OpenStack Image                  |
| enabled     | True                             |
| id          | f130ec9237bd47658dbdc73542dc9d2e |
| name        | glance                           |
| type        | image                            |
+-------------+----------------------------------+
```

서비스 생성



```bash
[root@controller ~(keystone_admin)]# openstack endpoint create --region RegionOne \
>   image public http://controller:9292
+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
| id           | 220c4d8ac66c4cc1a5fef680edf9ca86 |
| interface    | public                           |
| region       | RegionOne                        |
| region_id    | RegionOne                        |
| service_id   | f130ec9237bd47658dbdc73542dc9d2e |
| service_name | glance                           |
| service_type | image                            |
| url          | http://controller:9292           |
+--------------+----------------------------------+

[root@controller ~(keystone_admin)]# openstack endpoint create --region RegionOne \
>   image internal http://controller:9292
+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
| id           | 272b154e847043fbbcac5a0a78f48c23 |
| interface    | internal                         |
| region       | RegionOne                        |
| region_id    | RegionOne                        |
| service_id   | f130ec9237bd47658dbdc73542dc9d2e |
| service_name | glance                           |
| service_type | image                            |
| url          | http://controller:9292           |
+--------------+----------------------------------+

[root@controller ~(keystone_admin)]# openstack endpoint create --region RegionOne \
>   image admin http://controller:9292
+--------------+----------------------------------+
| Field        | Value                            |
+--------------+----------------------------------+
| enabled      | True                             |
| id           | 2f85cf6e076147d5bff50202405f2b71 |
| interface    | admin                            |
| region       | RegionOne                        |
| region_id    | RegionOne                        |
| service_id   | f130ec9237bd47658dbdc73542dc9d2e |
| service_name | glance                           |
| service_type | image                            |
| url          | http://controller:9292           |
+--------------+----------------------------------+
```

endpoint 3개 등록



```bash
[root@controller ~(keystone_admin)]# yum install openstack-glance -y
```



```bash
[root@controller ~(keystone_admin)]# vi /etc/glance/glance-api.conf

   1900 #connection = <None>
   1901 connection = mysql+pymysql://glance:GLANCE_DBPASS@controller/glance
   
   3472 [keystone_authtoken]
   3473 www_authenticate_uri  = http://controller:5000
   3474 auth_url = http://controller:5000
   3475 memcached_servers = controller:11211
   3476 auth_type = password
   3477 project_domain_name = Default
   3478 user_domain_name = Default
   3479 project_name = service
   3480 username = glance
   3481 password = GLANCE_PASS

   4398 [paste_deploy]
		...
   4423 flavor = keystone

   2007 [glance_store]
   2008 stores = file,http
   2009 default_store = file
   2010 filesystem_store_datadir = /var/lib/glance/images/
```





controller(10.0.0.100)

```bash
[root@controller ~(keystone_admin)]# cd /var/lib/glance/images/
[root@controller images(keystone_admin)]# ls -l
합계 34400
-rw-r-----. 1 glance glance 21954560  1월  9 14:33 a41300a7-8872-46bf-88c1-fbaa16a799ad
-rw-r-----. 1 glance glance 13267968  1월  9 09:56 d3fdf81a-7186-47f6-ad71-441e1147ef3f
```

이 위치에 파일이 저장된다. glance storage의 위치

all-in-one으로 설치했기 때문에 이 위치에 저장된다.





```bash
[root@controller ~(keystone_admin)]# vi /etc/glance/glance-registry.conf

   1146 #connection = <None>
   1147 connection = mysql+pymysql://glance:GLANCE_DBPASS@controller/glance

   1253 [keystone_authtoken]
   1254 www_authenticate_uri = http://controller:5000
   1255 auth_url = http://controller:5000
   1256 memcached_servers = controller:11211
   1257 auth_type = password
   1258 project_domain_name = Default
   1259 user_domain_name = Default
   1260 project_name = service
   1261 username = glance
   1262 password = GLANCE_PASS

   2152 [paste_deploy]
		...
   2177 flavor = keystone
```

pw기반 인증



```bash
[root@controller ~(keystone_admin)]# su -s /bin/sh -c "glance-manage db_sync" glance
```



```bash
[root@controller ~(keystone_admin)]# ls /var/lib/mysql/glance/
alembic_version.frm   image_properties.ibd                  metadef_namespaces.ibd      metadef_tags.ibd
alembic_version.ibd   image_tags.frm                        metadef_objects.frm         migrate_version.frm
db.opt                image_tags.ibd                        metadef_objects.ibd         migrate_version.ibd
image_locations.frm   images.frm                            metadef_properties.frm      task_info.frm
image_locations.ibd   images.ibd                            metadef_properties.ibd      task_info.ibd
image_members.frm     metadef_namespace_resource_types.frm  metadef_resource_types.frm  tasks.frm
image_members.ibd     metadef_namespace_resource_types.ibd  metadef_resource_types.ibd  tasks.ibd
image_properties.frm  metadef_namespaces.frm                metadef_tags.frm
```



```bash
[root@controller ~(keystone_admin)]# systemctl enable openstack-glance-api.service openstack-glance-registry.service
Created symlink from /etc/systemd/system/multi-user.target.wants/openstack-glance-api.service to /usr/lib/systemd/system/openstack-glance-api.service.
Created symlink from /etc/systemd/system/multi-user.target.wants/openstack-glance-registry.service to /usr/lib/systemd/system/openstack-glance-registry.service.
```



```bash
[root@controller ~(keystone_admin)]# systemctl start openstack-glance-api.service openstack-glance-registry.service
```



```bash
[root@controller ~(keystone_admin)]# yum install -y openstack-utils
```



```bash
[root@controller ~(keystone_admin)]# openstack-status
== Glance services ==
openstack-glance-api:                   active
openstack-glance-registry:              active
...
```



---

#### Glance 서비스 테스트



책 p187



```bash
[root@controller ~(keystone_admin)]# yum install -y wget
```



https://download.cirros-cloud.net/0.3.5/



cirros-0.3.5-x86_64-disk.img 오른쪽 클릭 -> 링크 주소 복사

https://download.cirros-cloud.net/0.3.5/cirros-0.3.5-x86_64-disk.img



```bash
[root@controller ~(keystone_admin)]# wget https://download.cirros-cloud.net/0.3.5/cirros-0.3.5-x86_64-disk.img
```

명령어 wget을 사용해서 리눅스 이미지 cirros를 다운로드한다.



```bash
[root@controller ~(keystone_admin)]# ls
admin-openrc  anaconda-ks.cfg  cirros-0.3.5-x86_64-disk.img  demo-openrc
```



```bash
[root@controller ~(keystone_admin)]# file cirros-0.3.5-x86_64-disk.img 
cirros-0.3.5-x86_64-disk.img: QEMU QCOW Image (v2), 41126400 bytes
```



```bash
[root@controller ~(keystone_admin)]# openstack image create "cirros" --file cirros-0.3.5-x86_64-disk.img  --disk-format qcow2 --container-format bare --public
+------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Field            | Value                                                                                                                                                                                      |
+------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| checksum         | f8ab98ff5e73ebab884d80c9dc9c7290                                                                                                                                                           |
| container_format | bare                                                                                                                                                                                       |
| created_at       | 2020-01-10T06:14:09Z                                                                                                                                                                       |
| disk_format      | qcow2                                                                                                                                                                                      |
| file             | /v2/images/91379b7a-a76a-45d8-a79a-7534028c4c9d/file                                                                                                                                       |
| id               | 91379b7a-a76a-45d8-a79a-7534028c4c9d                                                                                                                                                       |
| min_disk         | 0                                                                                                                                                                                          |
| min_ram          | 0                                                                                                                                                                                          |
| name             | cirros                                                                                                                                                                                     |
| owner            | b67e20c068ce44bc9375b48b8ccd67b0                                                                                                                                                           |
| properties       | os_hash_algo='sha512', os_hash_value='f0fd1b50420dce4ca382ccfbb528eef3a38bbeff00b54e95e3876b9bafe7ed2d6f919ca35d9046d437c6d2d8698b1174a335fbd66035bb3edc525d2cdb187232', os_hidden='False' |
| protected        | False                                                                                                                                                                                      |
| schema           | /v2/schemas/image                                                                                                                                                                          |
| size             | 13267968                                                                                                                                                                                   |
| status           | active                                                                                                                                                                                     |
| tags             |                                                                                                                                                                                            |
| updated_at       | 2020-01-10T06:14:09Z                                                                                                                                                                       |
| virtual_size     | None                                                                                                                                                                                       |
| visibility       | public                                                                                                                                                                                     |
+------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

이미지 생성을 위해 Glance 서비스에서 사용할 이름으로 'cirros'를 지정

--public을 하려면 admin 권한이여야 한다.



```bash
[root@controller ~(keystone_admin)]# ls /var/lib/glance/images/
91379b7a-a76a-45d8-a79a-7534028c4c9d
```



```bash
[root@controller ~(keystone_admin)]# ls -l /var/lib/glance/images/
합계 12960
-rw-r-----. 1 glance glance 13267968  1월 10 15:14 91379b7a-a76a-45d8-a79a-7534028c4c9d
```



```bash
[root@controller ~(keystone_admin)]# glance image-show 91379b7a-a76a-45d8-a79a-7534028c4c9d
+------------------+----------------------------------------------------------------------------------+
| Property         | Value                                                                            |
+------------------+----------------------------------------------------------------------------------+
| checksum         | f8ab98ff5e73ebab884d80c9dc9c7290                                                 |
| container_format | bare                                                                             |
| created_at       | 2020-01-10T06:14:09Z                                                             |
| disk_format      | qcow2                                                                            |
| id               | 91379b7a-a76a-45d8-a79a-7534028c4c9d                                             |
| min_disk         | 0                                                                                |
| min_ram          | 0                                                                                |
| name             | cirros                                                                           |
| os_hash_algo     | sha512                                                                           |
| os_hash_value    | f0fd1b50420dce4ca382ccfbb528eef3a38bbeff00b54e95e3876b9bafe7ed2d6f919ca35d9046d4 |
|                  | 37c6d2d8698b1174a335fbd66035bb3edc525d2cdb187232                                 |
| os_hidden        | False                                                                            |
| owner            | b67e20c068ce44bc9375b48b8ccd67b0                                                 |
| protected        | False                                                                            |
| size             | 13267968                                                                         |
| status           | active                                                                           |
| tags             | []                                                                               |
| updated_at       | 2020-01-10T06:14:09Z                                                             |
| virtual_size     | Not available                                                                    |
| visibility       | public                                                                           |
+------------------+----------------------------------------------------------------------------------+
```



---



controller(10.0.0.100) 에서 확인

```bash
[root@controller images(keystone_admin)]# cd
[root@controller ~(keystone_admin)]# scp 10.0.0.11:/root/ci* .
The authenticity of host '10.0.0.11 (10.0.0.11)' can't be established.
ECDSA key fingerprint is SHA256:9q7tkZCg/ms1WRmYyMZV+4zK8rnGXnzjLgL7AHRlVJ0.
ECDSA key fingerprint is MD5:b4:8b:e4:15:85:9c:be:cf:7c:5e:b8:90:8d:9b:46:b8.
Are you sure you want to continue connecting (yes/no)? yes
root@10.0.0.11's password: 
cirros-0.3.5-x86_64-disk.img                                                                 100%   13MB  58.9MB/s   00:00    
```

manual에 있는 이미지 가져오기



```bash
[root@controller ~(keystone_admin)]# qemu-img info cirros-0.3.5-x86_64-disk.img 
image: cirros-0.3.5-x86_64-disk.img
file format: qcow2
virtual size: 39M (41126400 bytes)
disk size: 13M
cluster_size: 65536
Format specific information:
    compat: 0.10
    refcount bits: 16
```

이미지에 대한 세부 정보(파일 포맷 등) 확인 가능



```bash
[root@controller ~(keystone_admin)]# qemu-img convert -O vmdk cirros-0.3.5-x86_64-disk.img cirros-0.3.5-x86_64-disk.vmdk

[root@controller ~(keystone_admin)]# ls -l ci*
-rw-r--r--. 1 root root 13267968  1월 10 15:28 cirros-0.3.5-x86_64-disk.img
-rw-r--r--. 1 root root 21561344  1월 10 15:30 cirros-0.3.5-x86_64-disk.vmdk
```

qemu-img를 이용하면 하이퍼바이저에 맞게끔 컨버팅이 가능하다.



vmdk가 실제 VMware에서 사용 가능한 이미지인지 확인해보기 -> VMware에 올려보기



```bash
[root@controller ~(keystone_admin)]# mkdir /win
[root@controller ~(keystone_admin)]# vmhgfs-fuse /win
[root@controller ~(keystone_admin)]# df -h
Filesystem           Size  Used Avail Use% Mounted on
devtmpfs             2.8G     0  2.8G   0% /dev
tmpfs                2.8G  4.0K  2.8G   1% /dev/shm
tmpfs                2.8G   85M  2.7G   3% /run
tmpfs                2.8G     0  2.8G   0% /sys/fs/cgroup
/dev/mapper/cl-root   60G  3.3G   57G   6% /
/dev/mapper/cl-home   10G   33M   10G   1% /home
/dev/sda1           1014M  180M  835M  18% /boot
tmpfs                567M     0  567M   0% /run/user/0
/dev/loop1           1.9G   19M  1.7G   2% /srv/node/swiftloopback
vmhgfs-fuse          931G  135G  797G  15% /mnt/hgfs
vmhgfs-fuse          931G  135G  797G  15% /win
[root@controller ~(keystone_admin)]# cp cirros-0.3.5-x86_64-disk.vmdk /win/share/
```

Windows와의 공유 폴더로 cirros-0.3.5-x86_64-disk.vmdk를 복사한다.



![image-20200110154032722](images/image-20200110154032722.png)

C:\share

cirros-0.3.5-x86_64-disk.vmdk 파일 복사



![image-20200110154209504](images/image-20200110154209504.png)

C:\openstack\cirros

openstack 폴더 안에 cirros 폴더 생성 -> cirros-0.3.5-x86_64-disk.vmdk 파일 붙여넣기



VMware -> File -> New Virtual Machine

![image-20200110154415493](images/image-20200110154415493.png)



![image-20200110154516877](images/image-20200110154516877.png)

cirros 폴더 경로 지정



![image-20200110155050146](images/image-20200110155050146.png)

기존에 있는 virtual disk 사용



![image-20200110155104947](images/image-20200110155104947.png)

cirros-0.3.5-x86_64-disk.vmdk 파일 선택

팝업 창에서 Keep~ 선택



![image-20200110155554919](images/image-20200110155554919.png)

가상머신이 잘 작동하는 것을 확인할 수 있다.



---



manual

```bash
[root@controller ~(keystone_admin)]# ss -nlpt|grep 9292
LISTEN     0      128          *:9292                     *:*                   users:(("glance-api",pid=24759,fd=4),("glance-api",pid=24758,fd=4),("glance-api",pid=24734,fd=4))
```

glance-api라는 프로세스가 9292 포트를 열어놓고 glance request를 대기. NOVA 쪽에서 사용 요청이 들어오면 사용할 수 있게끔 파일 서비스를 해준다.



---

수동으로 이미지 생성하기(p392) -> 복잡하다. 나중에 필요 시 확인



클라우드 이미지 사용하기(p402)

http://cloud.centos.org/centos/7/images/



![image-20200110161031730](images/image-20200110161031730.png)

CentOS-7-x86_64-GenericCloud-1508.qcow2c 오른쪽 클릭 -> 링크 주소 복사



```bash
[root@controller ~(keystone_admin)]# wget http://cloud.centos.org/centos/7/images/CentOS-7-x86_64-GenericCloud-1508.qcow2c
```



```bash
[root@controller ~(keystone_admin)]# openstack image create "centos7" --file CentOS-7-x86_64-GenericCloud-1508.qcow2c --disk-format qcow2 --container-format bare --public
+------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Field            | Value                                                                                                                                                                                      |
+------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| checksum         | cb612193c84eb48af5166cd6e7ee7460                                                                                                                                                           |
| container_format | bare                                                                                                                                                                                       |
| created_at       | 2020-01-10T07:40:25Z                                                                                                                                                                       |
| disk_format      | qcow2                                                                                                                                                                                      |
| file             | /v2/images/6bc0b6e1-173e-473f-9a61-24d6544d54a7/file                                                                                                                                       |
| id               | 6bc0b6e1-173e-473f-9a61-24d6544d54a7                                                                                                                                                       |
| min_disk         | 0                                                                                                                                                                                          |
| min_ram          | 0                                                                                                                                                                                          |
| name             | centos7                                                                                                                                                                                    |
| owner            | b67e20c068ce44bc9375b48b8ccd67b0                                                                                                                                                           |
| properties       | os_hash_algo='sha512', os_hash_value='1f646ebc1e72fe80f34530d33dc7991d94b47cf49dc1df795dfa9dc04219dd2702fbeb1c2a74356b783ad1f07de53237a3a9131d805a77099967d86abf06f24b', os_hidden='False' |
| protected        | False                                                                                                                                                                                      |
| schema           | /v2/schemas/image                                                                                                                                                                          |
| size             | 427008512                                                                                                                                                                                  |
| status           | active                                                                                                                                                                                     |
| tags             |                                                                                                                                                                                            |
| updated_at       | 2020-01-10T07:40:33Z                                                                                                                                                                       |
| virtual_size     | None                                                                                                                                                                                       |
| visibility       | public                                                                                                                                                                                     |
+------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```



---



https://docs.openstack.org/nova/rocky/install/controller-install-rdo.html



all-in-one에서 nova가 설치 상태 확인



controller(10.0.0.100) 에서 실행

```bash
[root@controller ~(keystone_stack1)]# virsh list --all
 Id    이름                         상태
----------------------------------------------------
 1     instance-00000003              실행중
 -     instance-00000004              종료
```

인스턴스 상태를 확인할 수 있다.

virsh는 인스턴스 콘솔(CLI)로 접근하는 기능을 제공



```bash
[root@controller ~(keystone_admin)]# mysql -u root
```



```mariadb
MariaDB [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| cinder             |
| glance             |
| information_schema |
| keystone           |
| mysql              |
| neutron            |
| nova               |
| nova_api           |
| nova_cell0         |
| nova_placement     |
| performance_schema |
| test               |
+--------------------+
12 rows in set (0.00 sec)
```



```bash
[root@controller ~(keystone_admin)]# ss -nlp|grep 8774
u_dgr  UNCONN     0      0         * 188774                * 221                 users:(("swift-account-s",pid=30733,fd=14))
tcp    LISTEN     0      128       *:8774                  *:*                   users:(("nova-api",pid=9949,fd=6),("nova-api",pid=9948,fd=6),("nova-api",pid=9946,fd=6),("nova-api",pid=9945,fd=6),("nova-api",pid=9869,fd=6))
```

포트가 열렸는지 확인



```bash
[root@controller ~(keystone_admin)]# ss -nlp|grep 8778
tcp    LISTEN     0      128       *:8778                  *:*                   users:(("httpd",pid=111630,fd=3),("httpd",pid=111628,fd=3),("httpd",pid=105201,fd=3),("httpd",pid=103745,fd=3),("httpd",pid=103744,fd=3),("httpd",pid=103743,fd=3),("httpd",pid=102797,fd=3),("httpd",pid=102794,fd=3),("httpd",pid=102572,fd=3),("httpd",pid=102571,fd=3),("httpd",pid=102166,fd=3),("httpd",pid=101356,fd=3),("httpd",pid=80142,fd=3),("httpd",pid=75463,fd=3),("httpd",pid=72101,fd=3),("httpd",pid=72093,fd=3),("httpd",pid=71218,fd=3),("httpd",pid=71213,fd=3),("httpd",pid=38516,fd=3),("httpd",pid=11310,fd=3),("httpd",pid=11294,fd=3))
```



keystone은 5000번 포트

horizon은 80포트

이름이 전부 httpd이다. 같은 프로세스인데 포트로 서비스 구분



```bash
[root@controller ~(keystone_admin)]# openstack-status
== Nova services ==
openstack-nova-api:                     active
openstack-nova-compute:                 active
openstack-nova-network:                 inactive  (disabled on boot)
openstack-nova-scheduler:               active
openstack-nova-conductor:               active
openstack-nova-console:                 inactive  (disabled on boot)
openstack-nova-consoleauth:             active
openstack-nova-xvpvncproxy:             inactive  (disabled on boot)
...
```



---

### Compute Service (NOVA)



p236

queue : rabbitmq-server

생성 요청을 특정 노드에 보내기 전에 NOVA 스케쥴러에 의해 스케쥴링이 먼저 일어나야함.

DB에는 구성 요소 뿐만 아니라 사용량도 가지고 있다. 



p239



p240

호스트 관점에서는 가상 머신이 프로세스로 떠있다.



대시보드에 stack1으로 로그인

Compute -> 인스턴스

![image-20200110170235024](images/image-20200110170235024.png)



```bash
[root@controller ~(keystone_stack1)]# ps -ef|grep kvm
root        829      2  0  1월09 ?      00:00:00 [kvm-irqfd-clean]
root      69714  34874  0 17:02 pts/0    00:00:00 grep --color=auto kvm
qemu      75583      1  6 02:42 ?        00:55:08 /usr/libexec/qemu-kvm -name guest=instance-00000003,debug-threads=on -S -object secret,id=masterKey0,format=raw,file=/var/lib/libvirt/qemu/domain-1-instance-00000003/master-key.aes -machine pc-i440fx-rhel7.6.0,accel=tcg,usb=off,dump-guest-core=off -m 64 -realtime mlock=off -smp 1,sockets=1,cores=1,threads=1 -uuid c37996dc-4e20-41f5-abe9-e626db516dc0 -smbios type=1,manufacturer=RDO,product=OpenStack Compute,version=18.2.3-1.el7,serial=6aee013b-affe-4bb3-a69b-ec68bd52f558,uuid=c37996dc-4e20-41f5-abe9-e626db516dc0,family=Virtual Machine -no-user-config -nodefaults -chardev socket,id=charmonitor,fd=26,server,nowait -mon chardev=charmonitor,id=monitor,mode=control -rtc base=utc -no-shutdown -boot strict=on -device piix3-usb-uhci,id=usb,bus=pci.0,addr=0x1.0x2 -drive file=/var/lib/nova/instances/c37996dc-4e20-41f5-abe9-e626db516dc0/disk,format=qcow2,if=none,id=drive-virtio-disk0,cache=none -device virtio-blk-pci,scsi=off,bus=pci.0,addr=0x4,drive=drive-virtio-disk0,id=virtio-disk0,bootindex=1,write-cache=on -netdev tap,fd=28,id=hostnet0 -device virtio-net-pci,host_mtu=1450,netdev=hostnet0,id=net0,mac=fa:16:3e:48:d2:47,bus=pci.0,addr=0x3 -add-fd set=2,fd=30 -chardev pty,id=charserial0,logfile=/dev/fdset/2,logappend=on -device isa-serial,chardev=charserial0,id=serial0 -device usb-tablet,id=input0,bus=usb.0,port=1 -vnc 0.0.0.0:0 -k en-us -device cirrus-vga,id=video0,bus=pci.0,addr=0x2 -device virtio-balloon-pci,id=balloon0,bus=pci.0,addr=0x5 -sandbox on,obsolete=deny,elevateprivileges=deny,spawn=deny,resourcecontrol=deny -msg timestamp=on
```



```bash
[root@controller ~(keystone_admin)]# . keystonerc_stack1 
[root@controller ~(keystone_stack1)]# nova list
+--------------------------------------+----------------+---------+------------+-------------+-------------------------------+
| ID                                   | Name           | Status  | Task State | Power State | Networks                      |
+--------------------------------------+----------------+---------+------------+-------------+-------------------------------+
| 1ecf3956-5834-45d0-86a4-a5ebfa2feeb2 | class-snap     | SHUTOFF | -          | Shutdown    | int1=192.168.0.6              |
| c37996dc-4e20-41f5-abe9-e626db516dc0 | class_instance | ACTIVE  | -          | Running     | int1=192.168.0.17, 10.0.0.211 |
+--------------------------------------+----------------+---------+------------+-------------+-------------------------------+
```

인스턴스 정보 및 상태가 보인다.



```bash
[root@controller ~(keystone_stack1)]# virsh list --all
 Id    이름                         상태
----------------------------------------------------
 1     instance-00000003              실행중
 -     instance-00000004              종료

```



```bash
[root@controller ~(keystone_stack1)]# virsh console 1
도메인 instance-00000003에 연결되었습니다
Escape character is ^]
 
login as 'cirros' user. default password: 'cubswin:)'. use 'sudo' for root.
class-instance login: cirros
Password: 
$ lsblk
NAME   MAJ:MIN RM    SIZE RO TYPE MOUNTPOINT
vda    253:0    0      1G  0 disk 
`-vda1 253:1    0 1011.9M  0 part /

```

콘솔 접속 가능



```bash
$ exit

login as 'cirros' user. default password: 'cubswin:)'. use 'sudo' for root.
class-instance login: 
[root@controller ~(keystone_stack1)]# 
```

Ctrl + ] 로 접속 해제 할 수 있다.



---

### compute1 추가하기



https://docs.openstack.org/nova/rocky/install/compute-install-rdo.html



compute1 가상 머신 생성 (all-in-one에 붙일 것이다.)



CPU : 2

M : 2G

IP 변경 : 10.0.0.101

host 이름 변경 : compute1



![image-20200110172924044](images/image-20200110172924044.png)

compute1에 복사해둔 이미지 사용



VMware -> File -> New Virtual Machine



![image-20200110173303442](images/image-20200110173303442.png)



팝업창에서 Continue



![image-20200110173357119](images/image-20200110173357119.png)



![image-20200110173416728](images/image-20200110173416728.png)



![image-20200110173449351](images/image-20200110173449351.png)



![image-20200110173533615](images/image-20200110173533615.png)



Power on this virtual machine



```bash
$ vi /etc/sysconfig/network-scripts/ifcfg-ens33
```



![image-20200110173906676](images/image-20200110173906676.png)



VVID 주석

IPADDR="10.0.0.101"



```bash
$ systemctl restart network
$ ip a
```



![image-20200110174224676](images/image-20200110174224676.png)



![image-20200110174325102](images/image-20200110174325102.png)



![image-20200110174334157](images/image-20200110174334157.png)



```bash
[root@controller ~]# hostname
controller
[root@controller ~]# hostname compute1
[root@controller ~]# hostname
compute1
```

hostname 변경



