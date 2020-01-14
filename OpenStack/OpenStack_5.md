# OpenStack



1. Nova 추가
2. Neutron
3. CLI로 Instance 시작
4. Cinder
5. Swift
6. Openstack High Availability Architecture



---

### compute1 추가하기



```bash
[root@compute1 ~]# hostnamectl
   Static hostname: controller
Transient hostname: compute1
         Icon name: computer-vm
           Chassis: vm
        Machine ID: 6aee013baffe4bb3a69bec68bd52f558
           Boot ID: 54b1027a37a746b3ad438c09717f5964
    Virtualization: vmware
  Operating System: CentOS Linux 7 (Core)
       CPE OS Name: cpe:/o:centos:centos:7
            Kernel: Linux 3.10.0-1062.9.1.el7.x86_64
      Architecture: x86-64
[root@compute1 ~]# hostnamectl set-hostname compute1
[root@compute1 ~]# hostnamectl
   Static hostname: compute1
         Icon name: computer-vm
           Chassis: vm
        Machine ID: 6aee013baffe4bb3a69bec68bd52f558
           Boot ID: 54b1027a37a746b3ad438c09717f5964
    Virtualization: vmware
  Operating System: CentOS Linux 7 (Core)
       CPE OS Name: cpe:/o:centos:centos:7
            Kernel: Linux 3.10.0-1062.9.1.el7.x86_64
      Architecture: x86-64
```

Static hostname 변경하기



```bash
[root@compute1 ~]# hostname -i
10.0.0.101
```



```bash
[root@compute1 ~]# ip a s ens33
2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:0c:29:f1:73:16 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.101/24 brd 10.0.0.255 scope global ens33
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:fef1:7316/64 scope link 
       valid_lft forever preferred_lft forever
```



```bash
[root@compute1 ~]# cat /etc/hosts
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
10.0.0.100 controller
10.0.0.101 compute1
```



---

### Compute Service (NOVA)



https://docs.openstack.org/nova/rocky/install/index.html



* 컨트롤러 노드에 실행되는 Nova 프로세스
  * nova-api
  * nova-cert
  * nova-conductor
  * nova-consoleauth
  * nova-novncproxy
  * nova-scheduler
  * nova-novaclient
* 컴퓨트 노드에 실행되는 Nova
  * nova-compute-kvm
  * python-guestfs
  * qemu-kvm



host 에서는 가상 머신이 process로 보인다.



https://docs.openstack.org/nova/rocky/install/compute-install-rdo.html



```bash
[root@compute1 ~]# yum install openstack-nova-compute -y
```



controller에 있는 nova.conf를 복사해 특정 파라미터만 바꿀 것이다.



```bash
[root@compute1 ~]# cp /etc/nova/nova.conf /etc/nova/nova.conf.old
[root@compute1 ~]# scp controller:/etc/nova/nova.conf /etc/nova
The authenticity of host 'controller (10.0.0.100)' can't be established.
ECDSA key fingerprint is SHA256:9q7tkZCg/ms1WRmYyMZV+4zK8rnGXnzjLgL7AHRlVJ0.
ECDSA key fingerprint is MD5:b4:8b:e4:15:85:9c:be:cf:7c:5e:b8:90:8d:9b:46:b8.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added 'controller,10.0.0.100' (ECDSA) to the list of known hosts.
root@controller's password: 
nova.conf                                                                                    100%  385KB  15.4MB/s   00:00    
[root@compute1 ~]# ls -l /etc/nova/nova.conf
-rw-r-----. 1 root nova 394479  1월 14 09:47 /etc/nova/nova.conf
```

기존 파일 백업

controller에 있는 /etc/nova/nova.conf 파일 복사해오기



ssh, sftp, scp

remote 복사 할 때 scp 명령어 사용



```bash
[root@compute1 ~]# vi /etc/nova/nova.conf
...
   1253 #my_ip=<host_ipv4>
   1254 my_ip=10.0.0.101
...
  11017 vncserver_proxyclient_address=10.0.0.101
...
```

my_ip 정보 변경

server_proxyclient_address 파라미터 변경. 콘솔 접속 안 될 경우 server_proxyclient_address 파라미터 확인해보기



---



```bash
[DEFAULT]
# ...
use_neutron = true
firewall_driver = nova.virt.firewall.NoopFirewallDriver
```

방화벽을 Neutron 쪽에서 제공하기 때문에, Nova 쪽의 방화벽 드라이버를 사용하지 않도록 설정한다.



```bash
[libvirt]
# ...
virt_type = qemu
```

기본이 qemu로 되어있다. 여기에 하이퍼바이저 type을 지정해주면 된다.



---



```bash
[root@compute1 ~]# systemctl enable libvirtd.service openstack-nova-compute.service
Created symlink from /etc/systemd/system/multi-user.target.wants/openstack-nova-compute.service to /usr/lib/systemd/system/openstack-nova-compute.service.
[root@compute1 ~]# systemctl start libvirtd.service
[root@compute1 ~]# systemctl status libvirtd.service
● libvirtd.service - Virtualization daemon
   Loaded: loaded (/usr/lib/systemd/system/libvirtd.service; enabled; vendor preset: enabled)
   Active: active (running) since 화 2020-01-14 09:53:05 KST; 12s ago
     Docs: man:libvirtd(8)
           https://libvirt.org
 Main PID: 10785 (libvirtd)
    Tasks: 17 (limit: 32768)
   CGroup: /system.slice/libvirtd.service
           └─10785 /usr/sbin/libvirtd

 1월 14 09:53:05 compute1 systemd[1]: Starting Virtualization daemon...
 1월 14 09:53:05 compute1 systemd[1]: Started Virtualization daemon.
 1월 14 09:53:05 compute1 libvirtd[10785]: 2020-01-14 00:53:05.796+0000: 10801: info : libvirt version: 4.5.0, packag...s.org)
 1월 14 09:53:05 compute1 libvirtd[10785]: 2020-01-14 00:53:05.796+0000: 10801: info : hostname: compute1
 1월 14 09:53:05 compute1 libvirtd[10785]: 2020-01-14 00:53:05.796+0000: 10801: error : virHostCPUGetTscInfo:1389 : /…없습니다
 1월 14 09:53:06 compute1 libvirtd[10785]: 2020-01-14 00:53:06.210+0000: 10801: error : virHostCPUGetTscInfo:1389 : /…없습니다
Hint: Some lines were ellipsized, use -l to show in full.
```

libvirtd 를 먼저 올리고 다른 작업 수행



```bash
[root@compute1 ~]# systemctl start openstack-nova-compute.service
```

서비스 시작이 안 된다. -> controller로 가서 문제 해결하기



---

controller 에서 작업



```bash
[root@controller ~]# vi /etc/sysconfig/iptables

     14 -A INPUT -s 10.0.0.101/32 -p tcp -m multiport --dports 5671,5672 -m comment --comment "001 amqp incoming amqp_10.0.0.10        1" -j ACCEPT
     15 -A INPUT -s 10.0.0.101/32 -p tcp -m multiport --dports 5671,5672 -j ACCEPT
     16 -A INPUT -s 10.0.0.100/32 -p tcp -m multiport --dports 5671,5672 -j ACCEPT 
```

/etc/sysconfig/iptables 13번째 줄 아래에 추가



```bash
[root@controller ~]# systemctl reload iptables
```



```bash
[root@controller ~]# systemctl status iptables
● iptables.service - IPv4 firewall with iptables
   Loaded: loaded (/usr/lib/systemd/system/iptables.service; enabled; vendor preset: disabled)
   Active: active (exited) since 수 2020-01-08 14:13:00 KST; 5 days ago
  Process: 87321 ExecReload=/usr/libexec/iptables/iptables.init reload (code=exited, status=0/SUCCESS)
 Main PID: 2819 (code=exited, status=0/SUCCESS)

 1월 08 14:13:00 controller systemd[1]: Starting IPv4 firewall with iptables...
 1월 08 14:13:00 controller iptables.init[2819]: iptables: Applying firewall rules: [  OK  ]
 1월 08 14:13:00 controller systemd[1]: Started IPv4 firewall with iptables.
 1월 14 09:56:53 controller systemd[1]: Reloading IPv4 firewall with iptables.
 1월 14 09:56:54 controller iptables.init[87321]: iptables: Trying to reload firewall rules: [  OK  ]
 1월 14 09:56:54 controller systemd[1]: Reloaded IPv4 firewall with iptables.
```



---

compute1 에서 작업



```bash
[root@compute1 ~]# systemctl start openstack-nova-compute.service
[root@compute1 ~]# systemctl status openstack-nova-compute.service
● openstack-nova-compute.service - OpenStack Nova Compute Server
   Loaded: loaded (/usr/lib/systemd/system/openstack-nova-compute.service; enabled; vendor preset: disabled)
   Active: active (running) since 화 2020-01-14 09:57:02 KST; 3min 10s ago
 Main PID: 10841 (nova-compute)
    Tasks: 22
   CGroup: /system.slice/openstack-nova-compute.service
           └─10841 /usr/bin/python2 /usr/bin/nova-compute

 1월 14 09:54:15 compute1 systemd[1]: Starting OpenStack Nova Compute Server...
 1월 14 09:57:02 compute1 systemd[1]: Started OpenStack Nova Compute Server.
```



---

controller 쪽에서 서비스가 실행되는지 확인



```bash
[root@controller ~]# . keystonerc_admin 
[root@controller ~(keystone_admin)]# openstack compute service list --service nova-compute
+----+--------------+------------+------+---------+-------+----------------------------+
| ID | Binary       | Host       | Zone | Status  | State | Updated At                 |
+----+--------------+------------+------+---------+-------+----------------------------+
|  7 | nova-compute | controller | nova | enabled | up    | 2020-01-14T01:01:14.000000 |
|  8 | nova-compute | compute1   | nova | enabled | up    | 2020-01-14T01:01:10.000000 |
+----+--------------+------------+------+---------+-------+----------------------------+
```

compute1 node가 추가 된 것을 확인할 수 있다.



---



compute1 node와 관련된 정보들을 추가해줘야 한다.



controller에서 작업



```bash
[root@controller ~(keystone_admin)]# su -s /bin/sh -c "nova-manage cell_v2 discover_hosts --verbose" nova
Found 2 cell mappings.
Skipping cell0 since it does not contain hosts.
Getting computes from cell 'default': dc774c14-4a64-4dc4-a2cd-1c8e9d1575b8
Checking host mapping for compute host 'compute1': 701b1f30-aad2-4fa3-9b98-473868860f67
Creating host mapping for compute host 'compute1': 701b1f30-aad2-4fa3-9b98-473868860f67
Found 1 unmapped computes in cell: dc774c14-4a64-4dc4-a2cd-1c8e9d1575b8
```

compute1 node를 discovery 해서 레코드에 추가

Found 1 으로 잘 찾은 것을 확인할 수 있다.



```bash
[root@controller ~(keystone_admin)]# vi /etc/nova/nova.conf
...
   9662 [scheduler]
   9663 discover_hosts_in_cells_interval = 300
...
```

300초 단위로 discovery 하도록 설정



---

### Neutron



가상 네트워크 인프라를 제공하는 서비스.



* OpenStack Networking은 방화벽, 로드밸런서 그리고 가상 사설 네트워크 등의 서비스들을 포함한 고급 가상 네트워크 토폴로지들을 tenants가 생성 하도록 한다.



* Networking은 다음 객체의 추상화를 제공
  * 네트워크
  * 서브넷
  * 라우터



compute1 node가 추가 되었으나 실제 인스턴스를 올릴 수는 없다.

compute1이 완성되려면 Neutron 이 설치되어 있어야 한다.



controller 에서 작업

```bash
[root@controller ~(keystone_admin)]# grep NEU openstack.txt
CONFIG_NEUTRON_INSTALL=y
# CONFIG_NEUTRON_OVS_BRIDGE_IFACES,
# CONFIG_NEUTRON_LB_INTERFACE_MAPPINGS, CONFIG_NEUTRON_OVS_TUNNEL_IF.
CONFIG_NEUTRON_KS_PW=af30600d05884938
CONFIG_NEUTRON_DB_PW=b21f006371654a3f
CONFIG_NEUTRON_L3_EXT_BRIDGE=br-ex
CONFIG_NEUTRON_METADATA_PW=8c3b44dce2a64bbf
CONFIG_NEUTRON_METERING_AGENT_INSTALL=y
CONFIG_NEUTRON_FWAAS=n
CONFIG_NEUTRON_VPNAAS=n
CONFIG_NEUTRON_ML2_TYPE_DRIVERS=vxlan,flat
CONFIG_NEUTRON_ML2_TENANT_NETWORK_TYPES=vxlan
CONFIG_NEUTRON_ML2_MECHANISM_DRIVERS=openvswitch
CONFIG_NEUTRON_ML2_FLAT_NETWORKS=*
CONFIG_NEUTRON_ML2_VLAN_RANGES=
CONFIG_NEUTRON_ML2_TUNNEL_ID_RANGES=
CONFIG_NEUTRON_ML2_VXLAN_GROUP=
CONFIG_NEUTRON_ML2_VNI_RANGES=10:100
CONFIG_NEUTRON_L2_AGENT=openvswitch
CONFIG_NEUTRON_ML2_SRIOV_INTERFACE_MAPPINGS=
CONFIG_NEUTRON_LB_INTERFACE_MAPPINGS=
CONFIG_NEUTRON_OVS_BRIDGE_MAPPINGS=extnet:br-ex
# CONFIG_NEUTRON_OVS_BRIDGE_MAPPINGS must be set in order to create
CONFIG_NEUTRON_OVS_BRIDGE_IFACES=br-ex:ens33
# CONFIG_NEUTRON_OVS_BRIDGE_MAPPINGS and
# CONFIG_NEUTRON_OVS_BRIDGE_IFACES. Example: --os-neutron-ovs-bridges-
CONFIG_NEUTRON_OVS_BRIDGES_COMPUTE=
# CONFIG_NEUTRON_OVS_BRIDGE_MAPPINGS. Example: --os-neutron-ovs-
CONFIG_NEUTRON_OVS_EXTERNAL_PHYSNET=extnet
CONFIG_NEUTRON_OVS_TUNNEL_IF=
CONFIG_NEUTRON_OVS_TUNNEL_SUBNETS=
CONFIG_NEUTRON_OVS_VXLAN_UDP_PORT=4789
CONFIG_NEUTRON_OVN_BRIDGE_MAPPINGS=extnet:br-ex
# CONFIG_NEUTRON_OVN_BRIDGE_MAPPINGS must be set in order to create
CONFIG_NEUTRON_OVN_BRIDGE_IFACES=
# CONFIG_NEUTRON_OVN_BRIDGE_MAPPINGS and
# CONFIG_NEUTRON_OVN_BRIDGE_IFACES. Example: --os-neutron-ovn-bridges-
CONFIG_NEUTRON_OVN_BRIDGES_COMPUTE=
# CONFIG_NEUTRON_OVN_BRIDGE_MAPPINGS. Example: --os-neutron-ovn-
CONFIG_NEUTRON_OVN_EXTERNAL_PHYSNET=extnet
CONFIG_NEUTRON_OVN_TUNNEL_IF=
CONFIG_NEUTRON_OVN_TUNNEL_SUBNETS=
```

Neutron 관련 파라미터 리스트 확인해보기

CONFIG_NEUTRON_FWAAS=n

Neutron의 방화벽 설정이 No로 되어있다. 설치해야 사용 가능하다.



```bash
[root@controller ~(keystone_admin)]# grep LB openstack.txt
# CONFIG_NEUTRON_LB_INTERFACE_MAPPINGS, CONFIG_NEUTRON_OVS_TUNNEL_IF.
# as-a-Service (LBaaS). ['y', 'n']
CONFIG_LBAAS_INSTALL=n
CONFIG_NEUTRON_LB_INTERFACE_MAPPINGS=
```

Load Balancer



p244

Queue : rabbitmq



p245

Linux Bridge : 가상 스위치 라고 생각할 수 있다.



p246

스위치 메커니즘을 제공하는 플러그인

compute node 마다 서로 다른 플러그인 적용 가능

Open vSwitch가 기본으로 설정되어 있다.

윗 단에 ML2 플러그인이 설치되어 있어야 한다. 그 밑 단에 L2 메커니즘의 플러그인이 설치되는 형태이다.



서로 다른 네트워크 타입을 호환하기 위한 layer가 LLC



p247

Hypervisor 별 Plug-in 지원 정보

오픈스택의 기본 하이퍼바이저는 KVM과 QEMU이다. KVM과 QEMU에서 많은 Plug-in 제공



p248

network layout의 인터페이스 3가지

빨간색 인터페이스 : 네트워크 카드가 장착되어 연결. 외부 통신이 필요하지는 않다.

주기적인 OS 업데이트나 패키지 설치 시 외부적인 네트워크 필요. NAT로 동작하는 스위치와 연결해 인터넷이 되도록 보통 사용하고 있다.

OpenStack을 이용해 Private 서버 구축



```bash
# ip netns
```



compute node에 KVM이나 QEMU 기반 인스턴스가 올라간다.



p249

여러 개의 compute node가 있다.

인스턴스들 간에 통신하기 위해 적용되어지는 것이 TypeDriver이다.



Flat : 물리적인 망과 연동하는 방식

VsLAN : VLAN을 개선해서 만든 방식. 물리적인 SW에 overhead를 주지 않는다. 상위 Layer에서 MAC 주소 등 인스턴스에 대한 정보를 유지, 관리한다.



p250

Provider networks : 사용자가 라우터를 생성해 사용할 수 없다.

Tenant Network : 내부 네트워크

Self-service : 사용자가 직접 필요한 네트워크 서비스를 만들어 사용할 수 있다.



p251

```bash
# neutron agent-list
```

agent가 정상적으로 동작하는지 확인

alive에 스마일이 있어야 정상적으로 동작하는 상태이다.

time 동기화가 안 되었을 경우 xxx로 뜨는 경우가 있다.



p252

l3_agent_scheduler : 라우터 스케줄러



active node는 1개

network node 자체가 병목구간이 될 수 있다. 이것을 개선하기 위한 방법이 DVR

외부 네트워크 브릿지가 br-ex이다. 네트워크 노드에 존재. 이것을 타고 나간다. 그런데 DVR 형태로 구성했을 경우 br-ex가 distribute 된다.

local에 분산된 br-ex를 통해 direct로 빠져나간다. 네트워크 노드 병목 구간을 해소할 수 있다.



linuxbridge-agent vs. openvswitch-agent



linuxbridge : direct로 물리적인 인터페이스를 연결할 수 있다. linuxbridge 기반으로 인스턴스를 올린다. 네트워크 노드를 타고 가지 않는다. controller를 타고 나갈 필요 없다.



---



controller에서 작업



```bash
[root@controller ~(keystone_admin)]# neutron agent-list
neutron CLI is deprecated and will be removed in the future. Use openstack CLI instead.
+--------------------------------------+--------------------+------------+-------------------+-------+----------------+---------------------------+
| id                                   | agent_type         | host       | availability_zone | alive | admin_state_up | binary                    |
+--------------------------------------+--------------------+------------+-------------------+-------+----------------+---------------------------+
| 6228c813-8488-4683-8bc4-187c91480861 | L3 agent           | controller | nova              | :-)   | True           | neutron-l3-agent          |
| 76d7a2cd-07a4-4be6-9460-ea861bb2ec11 | Open vSwitch agent | controller |                   | xxx   | True           | neutron-openvswitch-agent |
| 77bd1879-276f-4bef-8d2e-e45da14da0b5 | DHCP agent         | controller | nova              | :-)   | True           | neutron-dhcp-agent        |
| bc660532-13e1-4c99-b034-9813dac07a87 | Metering agent     | controller |                   | :-)   | True           | neutron-metering-agent    |
| f4ca86bb-6999-48a8-bd6c-9f211329117b | Metadata agent     | controller |                   | :-)   | True           | neutron-metadata-agent    |
+--------------------------------------+--------------------+------------+-------------------+-------+----------------+---------------------------+
```



```bash
[root@controller ~(keystone_admin)]# neutron ext-list
neutron CLI is deprecated and will be removed in the future. Use openstack CLI instead.
+--------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------+
| alias                          | name                                                                                                                                    |
+--------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------+
| default-subnetpools            | Default Subnetpools                                                                                                                     |
| qos                            | Quality of Service                                                                                                                      |
| availability_zone              | Availability Zone                                                                                                                       |
| network_availability_zone      | Network Availability Zone                                                                                                               |
| auto-allocated-topology        | Auto Allocated Topology Services                                                                                                        |
| ext-gw-mode                    | Neutron L3 Configurable external gateway mode                                                                                           |
| binding                        | Port Binding                                                                                                                            |
| metering                       | Neutron Metering                                                                                                                        |
| agent                          | agent                                                                                                                                   |
| subnet_allocation              | Subnet Allocation                                                                                                                       |
| l3_agent_scheduler             | L3 Agent Scheduler                                                                                                                      |
| trunk-details                  | Trunk port details                                                                                                                      |
| external-net                   | Neutron external network                                                                                                                |
| standard-attr-tag              | Tag support for resources with standard attribute: subnet, trunk, router, network, policy, subnetpool, port, security_group, floatingip |
| flavors                        | Neutron Service Flavors                                                                                                                 |
| net-mtu                        | Network MTU                                                                                                                             |
| network-ip-availability        | Network IP Availability                                                                                                                 |
| qos-default                    | QoS default policy                                                                                                                      |
| quotas                         | Quota management support                                                                                                                |
| revision-if-match              | If-Match constraints based on revision_number                                                                                           |
| availability_zone_filter       | Availability Zone Filter Extension                                                                                                      |
| l3-ha                          | HA Router extension                                                                                                                     |
| filter-validation              | Filter parameters validation                                                                                                            |
| multi-provider                 | Multi Provider Network                                                                                                                  |
| quota_details                  | Quota details management support                                                                                                        |
| address-scope                  | Address scope                                                                                                                           |
| trunk                          | Trunk Extension                                                                                                                         |
| extraroute                     | Neutron Extra Route                                                                                                                     |
| net-mtu-writable               | Network MTU (writable)                                                                                                                  |
| empty-string-filtering         | Empty String Filtering Extension                                                                                                        |
| subnet-service-types           | Subnet service types                                                                                                                    |
| port-mac-address-regenerate    | Neutron Port MAC address regenerate                                                                                                     |
| standard-attr-timestamp        | Resource timestamps                                                                                                                     |
| provider                       | Provider Network                                                                                                                        |
| service-type                   | Neutron Service Type Management                                                                                                         |
| qos-rule-type-details          | Details of QoS rule types                                                                                                               |
| l3-flavors                     | Router Flavor Extension                                                                                                                 |
| port-security                  | Port Security                                                                                                                           |
| extra_dhcp_opt                 | Neutron Extra DHCP options                                                                                                              |
| port-security-groups-filtering | Port filtering on security groups                                                                                                       |
| standard-attr-revisions        | Resource revision numbers                                                                                                               |
| pagination                     | Pagination support                                                                                                                      |
| sorting                        | Sorting support                                                                                                                         |
| security-group                 | security-group                                                                                                                          |
| dhcp_agent_scheduler           | DHCP Agent Scheduler                                                                                                                    |
| fip-port-details               | Floating IP Port Details Extension                                                                                                      |
| router_availability_zone       | Router Availability Zone                                                                                                                |
| rbac-policies                  | RBAC Policies                                                                                                                           |
| qos-bw-limit-direction         | Direction for QoS bandwidth limit rule                                                                                                  |
| standard-attr-description      | standard-attr-description                                                                                                               |
| ip-substring-filtering         | IP address substring filtering                                                                                                          |
| router                         | Neutron L3 Router                                                                                                                       |
| allowed-address-pairs          | Allowed Address Pairs                                                                                                                   |
| binding-extended               | Port Bindings Extended                                                                                                                  |
| project-id                     | project_id field enabled                                                                                                                |
| qos-fip                        | Floating IP QoS                                                                                                                         |
| dvr                            | Distributed Virtual Router                                                                                                              |
+--------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------+
```



---



p254

compute node에 인스턴스가 올라간 상태라고 가정

보안 그룹을 적용하기 위해 인스턴스에 리눅스 브릿지를 포트 형태로 하나 생성한다.

리눅스 브릿지 기반으로 보안 그룹이 적용된다.

OVS VLAN Bridge는 추가적으로 구성해야 한다.



IP-Fixed, IP-Floating

인스턴스 안에는 IP-Fixed(사설 IP)가 설정된다.

IP-Floating은 라우터에서 관리한다. Router Namespace가 라우터이다. 컨테이너로 라우터가 올라가고, Floating IP를 여기에서 관리한다.

IP-Floating : 인터넷 바깥에서 통신할 수 있는 공인 IP

DIP를 Fixed IP로 바꿔주는 작업이 필요하다. (DNAT) destination IP를 바꿔준다.

인스턴스가 여러 개 있을 때 찾아갈 수 있다.

나갈 때에는 source ip를 floating ip로 바껴서 나간다. 그래야 그 floagint ip로 

나갈 때에는 SNAT을 타고 나가고, 들어올 때에는 DNAT를 타고 들어온다.

목적지의 IP를 사설 IP로 바꾸는 DNAT을 타고 들어온다.

나갈 때 fixed ip가 공인 ip로 변경 -> Source IP가 floating IP로 바껴야 하니 SNAT을 타고 나간다.



controller 에서 실행

```bash
# ps -ef|grep kvm
# virsh list --all
# ip a
# ovs-vsctl show
```



```bash
[root@controller ~]# ps -ef|grep kvm
root        829      2  0  1월13 ?      00:00:00 [kvm-irqfd-clean]
qemu     103096      1  7 11:56 ?        00:04:45 /usr/libexec/qemu-kvm -name guest=instance-00000004,debug-threads=on -S -object secret,id=masterKey0,format=raw,file=/var/lib/libvirt/qemu/domain-4-instance-00000004/master-key.aes -machine pc-i440fx-rhel7.6.0,accel=tcg,usb=off,dump-guest-core=off -m 64 -realtime mlock=off -smp 1,sockets=1,cores=1,threads=1 -uuid 1ecf3956-5834-45d0-86a4-a5ebfa2feeb2 -smbios type=1,manufacturer=RDO,product=OpenStack Compute,version=18.2.3-1.el7,serial=6aee013b-affe-4bb3-a69b-ec68bd52f558,uuid=1ecf3956-5834-45d0-86a4-a5ebfa2feeb2,family=Virtual Machine -no-user-config -nodefaults -chardev socket,id=charmonitor,fd=27,server,nowait -mon chardev=charmonitor,id=monitor,mode=control -rtc base=utc -no-shutdown -boot strict=on -device piix3-usb-uhci,id=usb,bus=pci.0,addr=0x1.0x2 -drive file=/var/lib/nova/instances/1ecf3956-5834-45d0-86a4-a5ebfa2feeb2/disk,format=qcow2,if=none,id=drive-virtio-disk0,cache=none -device virtio-blk-pci,scsi=off,bus=pci.0,addr=0x4,drive=drive-virtio-disk0,id=virtio-disk0,bootindex=1,write-cache=on -drive file=/dev/sdb,format=raw,if=none,id=drive-virtio-disk1,serial=c8edeaa3-93d0-4ab1-8cbd-bc4c59a8eb2a,cache=none,aio=native -device virtio-blk-pci,scsi=off,bus=pci.0,addr=0x5,drive=drive-virtio-disk1,id=virtio-disk1,write-cache=on -netdev tap,fd=29,id=hostnet0 -device virtio-net-pci,host_mtu=1450,netdev=hostnet0,id=net0,mac=fa:16:3e:c8:7c:20,bus=pci.0,addr=0x3 -add-fd set=2,fd=31 -chardev pty,id=charserial0,logfile=/dev/fdset/2,logappend=on -device isa-serial,chardev=charserial0,id=serial0 -device usb-tablet,id=input0,bus=usb.0,port=1 -vnc 0.0.0.0:0 -k en-us -device cirrus-vga,id=video0,bus=pci.0,addr=0x2 -device virtio-balloon-pci,id=balloon0,bus=pci.0,addr=0x6 -sandbox on,obsolete=deny,elevateprivileges=deny,spawn=deny,resourcecontrol=deny -msg timestamp=on
root     112338 112228  0 12:57 pts/0    00:00:00 grep --color=auto kvm
```



```bash
[root@controller ~]# virsh list --all
 Id    이름                         상태
----------------------------------------------------
 4     instance-00000004              실행중
 -     instance-00000003              종료
```



```bash
[root@controller ~]# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast master ovs-system state UP group default qlen 1000
    link/ether 00:0c:29:c5:fd:e8 brd ff:ff:ff:ff:ff:ff
    inet6 fe80::20c:29ff:fec5:fde8/64 scope link 
       valid_lft forever preferred_lft forever
5: ovs-system: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN group default qlen 1000
    link/ether 3a:d8:05:0e:10:c2 brd ff:ff:ff:ff:ff:ff
7: br-int: <BROADCAST,MULTICAST> mtu 1450 qdisc noop state DOWN group default qlen 1000
    link/ether 86:3c:3d:18:12:47 brd ff:ff:ff:ff:ff:ff
8: br-tun: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN group default qlen 1000
    link/ether b6:d8:54:b8:f5:44 brd ff:ff:ff:ff:ff:ff
14: qbra3aed6c9-50: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1450 qdisc noqueue state UP group default qlen 1000
    link/ether 9e:70:48:aa:66:dc brd ff:ff:ff:ff:ff:ff
15: qvoa3aed6c9-50@qvba3aed6c9-50: <BROADCAST,MULTICAST,PROMISC,UP,LOWER_UP> mtu 1450 qdisc noqueue master ovs-system state UP group default qlen 1000
    link/ether 16:77:d7:a7:0a:67 brd ff:ff:ff:ff:ff:ff
    inet6 fe80::1477:d7ff:fea7:a67/64 scope link 
       valid_lft forever preferred_lft forever
16: qvba3aed6c9-50@qvoa3aed6c9-50: <BROADCAST,MULTICAST,PROMISC,UP,LOWER_UP> mtu 1450 qdisc noqueue master qbra3aed6c9-50 state UP group default qlen 1000
    link/ether 9e:70:48:aa:66:dc brd ff:ff:ff:ff:ff:ff
    inet6 fe80::9c70:48ff:feaa:66dc/64 scope link 
       valid_lft forever preferred_lft forever
23: br-ex: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UNKNOWN group default qlen 1000
    link/ether 00:0c:29:c5:fd:e8 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.100/24 brd 10.0.0.255 scope global br-ex
       valid_lft forever preferred_lft forever
    inet6 fe80::c054:acff:fe0b:9348/64 scope link 
       valid_lft forever preferred_lft forever
28: qbr8c10549d-49: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1450 qdisc noqueue state UP group default qlen 1000
    link/ether d2:e2:5a:fc:f3:55 brd ff:ff:ff:ff:ff:ff
29: qvo8c10549d-49@qvb8c10549d-49: <BROADCAST,MULTICAST,PROMISC,UP,LOWER_UP> mtu 1450 qdisc noqueue master ovs-system state UP group default qlen 1000
    link/ether ea:33:83:ee:37:4a brd ff:ff:ff:ff:ff:ff
    inet6 fe80::e833:83ff:feee:374a/64 scope link 
       valid_lft forever preferred_lft forever
30: qvb8c10549d-49@qvo8c10549d-49: <BROADCAST,MULTICAST,PROMISC,UP,LOWER_UP> mtu 1450 qdisc noqueue master qbr8c10549d-49 state UP group default qlen 1000
    link/ether d2:e2:5a:fc:f3:55 brd ff:ff:ff:ff:ff:ff
    inet6 fe80::d0e2:5aff:fefc:f355/64 scope link 
       valid_lft forever preferred_lft forever
31: tap8c10549d-49: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1450 qdisc pfifo_fast master qbr8c10549d-49 state UNKNOWN group default qlen 1000
    link/ether fe:16:3e:c8:7c:20 brd ff:ff:ff:ff:ff:ff
    inet6 fe80::fc16:3eff:fec8:7c20/64 scope link 
       valid_lft forever preferred_lft forever
```



```bash
[root@controller ~]# ovs-vsctl show
d20af7c5-9852-41fc-ab7c-d6893a30832e
    Manager "ptcp:6640:127.0.0.1"
        is_connected: true
    Bridge br-ex
        fail_mode: standalone
        Port "ens33"
            Interface "ens33"
        Port br-ex
            Interface br-ex
                type: internal
    Bridge br-int
        Controller "tcp:127.0.0.1:6633"
        fail_mode: secure
        Port "tap017618bd-62"
            tag: 1
            Interface "tap017618bd-62"
                type: internal
        Port br-int
            Interface br-int
                type: internal
        Port "tap56e811ac-10"
            tag: 2
            Interface "tap56e811ac-10"
                type: internal
        Port int-br-ex
            Interface int-br-ex
                type: patch
                options: {peer=phy-br-ex}
        Port "qvoa3aed6c9-50"
            tag: 1
            Interface "qvoa3aed6c9-50"
        Port patch-tun
            Interface patch-tun
                type: patch
                options: {peer=patch-int}
        Port "qg-7071d95a-9f"
            tag: 2
            Interface "qg-7071d95a-9f"
                type: internal
        Port "qvo8c10549d-49"
            Interface "qvo8c10549d-49"
        Port "qr-0c36cb33-be"
            tag: 1
            Interface "qr-0c36cb33-be"
                type: internal
    Bridge br-tun
        Controller "tcp:127.0.0.1:6633"
        fail_mode: secure
        Port br-tun
            Interface br-tun
                type: internal
        Port patch-int
            Interface patch-int
                type: patch
                options: {peer=patch-tun}
    ovs_version: "2.11.0"
```



---



```bash
[root@controller ~]# ip netns
qrouter-a057f36d-27f0-44b9-b5d2-8a8cde77cf47 (id: 2)
qdhcp-6d379f41-147c-4fa1-bf16-742651879c50 (id: 1)
qdhcp-4e252b8b-2c4a-4a96-af37-4d636fbe1dea (id: 0)
```

네트워크 namespace 확인



```bash
[root@controller ~]# ip netns exec qrouter-a057f36d-27f0-44b9-b5d2-8a8cde77cf47 /bin/bash
```



```bash
[root@controller ~]# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
11: qr-0c36cb33-be: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1450 qdisc noqueue state UNKNOWN group default qlen 1000
    link/ether fa:16:3e:86:7f:28 brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.254/24 brd 192.168.0.255 scope global qr-0c36cb33-be
       valid_lft forever preferred_lft forever
    inet6 fe80::f816:3eff:fe86:7f28/64 scope link 
       valid_lft forever preferred_lft forever
12: qg-7071d95a-9f: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1450 qdisc noqueue state UNKNOWN group default qlen 1000
    link/ether fa:16:3e:a9:e6:2f brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.212/24 brd 10.0.0.255 scope global qg-7071d95a-9f
       valid_lft forever preferred_lft forever
    inet 10.0.0.211/32 brd 10.0.0.211 scope global qg-7071d95a-9f
       valid_lft forever preferred_lft forever
    inet6 fe80::f816:3eff:fea9:e62f/64 scope link 
       valid_lft forever preferred_lft forever
```



라우터에서 외부 네트워크와 연결하는 작업 : 게이트웨이 설정

Floating IP는 라우터에서 관리한다.



```bash
[root@controller ~]# iptables -t nat -L
Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination         
neutron-l3-agent-PREROUTING  all  --  anywhere             anywhere            

Chain INPUT (policy ACCEPT)
target     prot opt source               destination         

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination         
neutron-l3-agent-OUTPUT  all  --  anywhere             anywhere            

Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination         
neutron-l3-agent-POSTROUTING  all  --  anywhere             anywhere            
neutron-postrouting-bottom  all  --  anywhere             anywhere            

Chain neutron-l3-agent-OUTPUT (1 references)
target     prot opt source               destination         
DNAT       all  --  anywhere             controller           to:192.168.0.17

Chain neutron-l3-agent-POSTROUTING (1 references)
target     prot opt source               destination         
ACCEPT     all  --  anywhere             anywhere             ! ctstate DNAT

Chain neutron-l3-agent-PREROUTING (1 references)
target     prot opt source               destination         
REDIRECT   tcp  --  anywhere             169.254.169.254      tcp dpt:http redir ports 9697
DNAT       all  --  anywhere             controller           to:192.168.0.17

Chain neutron-l3-agent-float-snat (1 references)
target     prot opt source               destination         
SNAT       all  --  192.168.0.17         anywhere             to:10.0.0.211

Chain neutron-l3-agent-snat (1 references)
target     prot opt source               destination         
neutron-l3-agent-float-snat  all  --  anywhere             anywhere            
SNAT       all  --  anywhere             anywhere             to:10.0.0.212
SNAT       all  --  anywhere             anywhere             mark match ! 0x2/0xffff ctstate DNAT to:10.0.0.212

Chain neutron-postrouting-bottom (1 references)
target     prot opt source               destination         
neutron-l3-agent-snat  all  --  anywhere             anywhere             /* Perform source NAT on outgoing traffic. */
```



```bash
[root@controller ~]# exit
exit
```



---



p258

mesh topology



p259

start, end 범위 내에서 랜덤하게 할당

대시 보드에서 했던 작업을 CLI로 할 수도 있다.



p260

multitenant

자기가 사용할 내부 네트워크는 스스로 만들어줘야 한다. 외부 네트워크는 만들어진 것을 사용.



바깥으로 나가기 위해서는 라우터를 거쳐야 하는데 라우터에서는 사설 IP를 밖으로 나가지 못하게 한다.



A : 10.0.0.0/8

B : 172.16.0.0/16 ~ 172.31.0.0/16

C : 192.168.0.0/24 ~ 192.168.255.0/24



---

### Networking Service



https://docs.openstack.org/neutron/rocky/install/

-> Install and configure for Red Hat Enterprise Linux and CentOS

-> Install and configure controller node



https://docs.openstack.org/neutron/rocky/install/controller-install-rdo.html



controller에서 확인



end point가 9696

```bash
[root@controller ~]# ss -nlp|grep 9696
tcp    LISTEN     0      128       *:9696                  *:*                   users:(("neutron-server",pid=29680,fd=7),("neutron-server",pid=29679,fd=7),("neutron-server",pid=29678,fd=7),("neutron-server",pid=29677,fd=7),("neutron-server",pid=29675,fd=7),("neutron-server",pid=29674,fd=7),("neutron-server",pid=29637,fd=7))
```



-> Networking Option 2: Self-service networks

https://docs.openstack.org/neutron/rocky/install/controller-install-option2-rdo.html



```bash
[neutron]
# ...
url = http://controller:9696
auth_url = http://controller:5000
auth_type = password
project_domain_name = default
user_domain_name = default
region_name = RegionOne
project_name = service
username = neutron
password = NEUTRON_PASS
```

사용자 이름과 비번이 user create 할 때 비번과 일치해야한다.



ml2와 관련된 설정을 한다. 의존성 있는 파라미터 설정이 들어가야 한다.



```bash
[linux_bridge]
physical_interface_mappings = provider:PROVIDER_INTERFACE_NAME
```

provider에 네트워크 인터페이스 지정해줘야 한다. ens33이 들어간다.



```bash
net.bridge.bridge-nf-call-iptables
net.bridge.bridge-nf-call-ip6tables
```

1로 설정되어 있는지 확인해야 한다.



```bash
[root@controller ~]# sysctl -a
```

전체 커널 파라미터의 리스트 확인 가능



```bash
[root@controller ~]# sysctl -a|grep nf-call
net.bridge.bridge-nf-call-arptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
sysctl: reading key "net.ipv6.conf.all.stable_secret"
sysctl: reading key "net.ipv6.conf.br-ex.stable_secret"
sysctl: reading key "net.ipv6.conf.br-int.stable_secret"
sysctl: reading key "net.ipv6.conf.br-tun.stable_secret"
sysctl: reading key "net.ipv6.conf.default.stable_secret"
sysctl: reading key "net.ipv6.conf.ens33.stable_secret"
sysctl: reading key "net.ipv6.conf.lo.stable_secret"
sysctl: reading key "net.ipv6.conf.ovs-system.stable_secret"
sysctl: reading key "net.ipv6.conf.qbr8c10549d-49.stable_secret"
sysctl: reading key "net.ipv6.conf.qbra3aed6c9-50.stable_secret"
sysctl: reading key "net.ipv6.conf.qvb8c10549d-49.stable_secret"
sysctl: reading key "net.ipv6.conf.qvba3aed6c9-50.stable_secret"
sysctl: reading key "net.ipv6.conf.qvo8c10549d-49.stable_secret"
sysctl: reading key "net.ipv6.conf.qvoa3aed6c9-50.stable_secret"
sysctl: reading key "net.ipv6.conf.tap8c10549d-49.stable_secret"
```



https://docs.openstack.org/neutron/rocky/install/controller-install-rdo.html



```bash
# ln -s /etc/neutron/plugins/ml2/ml2_conf.ini /etc/neutron/plugin.ini
```

심볼릭 링크



```bash
# su -s /bin/sh -c "neutron-db-manage --config-file /etc/neutron/neutron.conf \
  --config-file /etc/neutron/plugins/ml2/ml2_conf.ini upgrade head" neutron
```



```bash
[root@controller ~]# cd /var/lib/mysql/
[root@controller mysql]# ls neutron/
address_scopes.frm                    ipsecpeercidrs.ibd                           nuage_net_partition_router_mapping.ibd
address_scopes.ibd                    ipsecpolicies.frm                            nuage_net_partitions.frm
agents.frm                            ipsecpolicies.ibd                            nuage_net_partitions.ibd
agents.ibd                            logs.frm                                     
...
```

위의 명령어가 잘 수행되었으면 /var/lib/mysql/ 위치에 neutron 관련 파일들이 생성된다.



---

### Install and configure compute node



https://docs.openstack.org/neutron/rocky/install/compute-install-rdo.html



compute1 node 에서 실행

```bash
[root@compute1 ~]# yum install openstack-neutron-linuxbridge ebtables ipset -y
```



```bash
[root@compute1 ~]# cd /etc/neutron/
[root@compute1 neutron]# ls
conf.d  neutron.conf  plugins  rootwrap.conf
[root@compute1 neutron]# cp neutron.conf neutron.conf.old
[root@compute1 neutron]# scp controller:/etc/neutron/neutron.conf neutron.conf
root@controller's password: 
neutron.conf                                                                                 100%   71KB  10.2MB/s   00:00   
```

controller에 있는 /etc/neutron/neutron.conf 파일을 복사해오기



```bash
[root@compute1 neutron]# vi neutron.conf
...
    760 #connection = <None>
    761 #connection=mysql+pymysql://neutron:b21f006371654a3f@10.0.0.100/neutron
```

db connect 주석처리



-> Networking Option 2: Self-service networks

https://docs.openstack.org/neutron/rocky/install/compute-install-option2-rdo.html



```bash
[root@compute1 neutron]# vi /etc/neutron/plugins/ml2/linuxbridge_agent.ini
...
    146 [linux_bridge]
    147 physical_interface_mappings = provider:ens33
...
    204 [vxlan]
    205 enable_vxlan = true
    206 local_ip = 10.0.0.101
    207 l2_population = true
...
    181 [securitygroup]
    182 enable_security_group = true
    183 firewall_driver = neutron.agent.linux.iptables_firewall.IptablesFirewallDriver
```



```bash
[root@compute1 neutron]# sysctl -a|grep nf-call
sysctl: reading key "net.ipv6.conf.all.stable_secret"
sysctl: reading key "net.ipv6.conf.default.stable_secret"
sysctl: reading key "net.ipv6.conf.ens33.stable_secret"
sysctl: reading key "net.ipv6.conf.lo.stable_secret"
```



```bash
[root@compute1 neutron]# lsmod|grep br_netfilter
[root@compute1 neutron]# modprobe br_netfilter
[root@compute1 neutron]# lsmod|grep br_netfilter
br_netfilter           22256  0 
bridge                151336  1 br_netfilter
```



```bash
[root@compute1 neutron]# sysctl -a|grep nf-call
net.bridge.bridge-nf-call-arptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
sysctl: reading key "net.ipv6.conf.all.stable_secret"
sysctl: reading key "net.ipv6.conf.default.stable_secret"
sysctl: reading key "net.ipv6.conf.ens33.stable_secret"
sysctl: reading key "net.ipv6.conf.lo.stable_secret"
```

브릿지 기반의 방화벽을 지원하기 위한 모듈을 올리는 작업. 그래야 보안 그룹이 적용된다.



https://docs.openstack.org/neutron/rocky/install/compute-install-rdo.html



nova.conf 수정할 필요 없어서 바로 서비스 올린다.



```bash
[root@compute1 neutron]# systemctl enable neutron-linuxbridge-agent.service
Created symlink from /etc/systemd/system/multi-user.target.wants/neutron-linuxbridge-agent.service to /usr/lib/systemd/system/neutron-linuxbridge-agent.service.
[root@compute1 neutron]# systemctl start neutron-linuxbridge-agent.service
[root@compute1 neutron]# systemctl status neutron-linuxbridge-agent.service
● neutron-linuxbridge-agent.service - OpenStack Neutron Linux Bridge Agent
   Loaded: loaded (/usr/lib/systemd/system/neutron-linuxbridge-agent.service; enabled; vendor preset: disabled)
   Active: active (running) since 화 2020-01-14 14:25:49 KST; 3s ago
  Process: 15913 ExecStartPre=/usr/bin/neutron-enable-bridge-firewall.sh (code=exited, status=0/SUCCESS)
 Main PID: 15919 (neutron-linuxbr)
    Tasks: 1
   CGroup: /system.slice/neutron-linuxbridge-agent.service
           └─15919 /usr/bin/python2 /usr/bin/neutron-linuxbridge-agent --config-file /usr/share/neutron/neutron-dist.conf --...

 1월 14 14:25:49 compute1 systemd[1]: Starting OpenStack Neutron Linux Bridge Agent...
 1월 14 14:25:49 compute1 neutron-enable-bridge-firewall.sh[15913]: net.bridge.bridge-nf-call-iptables = 1
 1월 14 14:25:49 compute1 neutron-enable-bridge-firewall.sh[15913]: net.bridge.bridge-nf-call-ip6tables = 1
 1월 14 14:25:49 compute1 systemd[1]: Started OpenStack Neutron Linux Bridge Agent.
```



```bash
[root@compute1 neutron]# yum install openstack-utils -y
[root@compute1 neutron]# openstack-status
== Nova services ==
openstack-nova-api:                     inactive  (disabled on boot)
openstack-nova-compute:                 active
openstack-nova-network:                 inactive  (disabled on boot)
openstack-nova-scheduler:               inactive  (disabled on boot)
== Support services ==
openvswitch:                            inactive  (disabled on boot)
dbus:                                   active
Warning novarc not sourced
```





controller에서 작업

```bash
[root@controller mysql]# cd
[root@controller ~]# . keystonerc_admin 
[root@controller ~(keystone_admin)]# openstack network agent list
+--------------------------------------+--------------------+------------+-------------------+-------+-------+---------------------------+
| ID                                   | Agent Type         | Host       | Availability Zone | Alive | State | Binary                    |
+--------------------------------------+--------------------+------------+-------------------+-------+-------+---------------------------+
| 6228c813-8488-4683-8bc4-187c91480861 | L3 agent           | controller | nova              | :-)   | UP    | neutron-l3-agent          |
| 76d7a2cd-07a4-4be6-9460-ea861bb2ec11 | Open vSwitch agent | controller | None              | :-)   | UP    | neutron-openvswitch-agent |
| 77bd1879-276f-4bef-8d2e-e45da14da0b5 | DHCP agent         | controller | nova              | :-)   | UP    | neutron-dhcp-agent        |
| bc660532-13e1-4c99-b034-9813dac07a87 | Metering agent     | controller | None              | :-)   | UP    | neutron-metering-agent    |
| f4ca86bb-6999-48a8-bd6c-9f211329117b | Metadata agent     | controller | None              | :-)   | UP    | neutron-metadata-agent    |
+--------------------------------------+--------------------+------------+-------------------+-------+-------+---------------------------+
```

Linux bridge agent이 추가되어있지 않다.



---

Linux bridge agent 추가 오류시



```bash
[root@compute1 neutron]# setenforce 0
[root@compute1 neutron]# getenforce
Permissive
```



```bash
[root@compute1 neutron]# vi /etc/selinux/config 

# This file controls the state of SELinux on the system.
# SELINUX= can take one of these three values:
#     enforcing - SELinux security policy is enforced.
#     permissive - SELinux prints warnings instead of enforcing.
#     disabled - No SELinux policy is loaded.
SELINUX=disabled
# SELINUXTYPE= can take one of three two values:
#     targeted - Targeted processes are protected,
#     minimum - Modification of targeted policy. Only selected processes are protected.
#     mls - Multi Level Security protection.
SELINUXTYPE=targeted
```



```bash
[root@compute1 neutron]# systemctl restart neutron-linuxbridge-agent.service
```



controller 에서 확인

```bash
[root@controller ~(keystone_admin)]# openstack network agent list
+--------------------------------------+--------------------+------------+-------------------+-------+-------+---------------------------+
| ID                                   | Agent Type         | Host       | Availability Zone | Alive | State | Binary                    |
+--------------------------------------+--------------------+------------+-------------------+-------+-------+---------------------------+
| 6228c813-8488-4683-8bc4-187c91480861 | L3 agent           | controller | nova              | :-)   | UP    | neutron-l3-agent          |
| 76d7a2cd-07a4-4be6-9460-ea861bb2ec11 | Open vSwitch agent | controller | None              | :-)   | UP    | neutron-openvswitch-agent |
| 77bd1879-276f-4bef-8d2e-e45da14da0b5 | DHCP agent         | controller | nova              | :-)   | UP    | neutron-dhcp-agent        |
| bc660532-13e1-4c99-b034-9813dac07a87 | Metering agent     | controller | None              | :-)   | UP    | neutron-metering-agent    |
| beb494d7-06a4-48fd-98ed-c1086c9ae4a4 | Linux bridge agent | compute1   | None              | :-)   | UP    | neutron-linuxbridge-agent |
| f4ca86bb-6999-48a8-bd6c-9f211329117b | Metadata agent     | controller | None              | :-)   | UP    | neutron-metadata-agent    |
+--------------------------------------+--------------------+------------+-------------------+-------+-------+---------------------------+
```



---

#### Launch an instance



https://docs.openstack.org/install-guide/launch-instance.html



controller 에서 작업

```bash
[root@controller ~(keystone_admin)]# openstack flavor create --id 0 --vcpus 1 --ram 64 --disk 1 m1.nano
+----------------------------+---------+
| Field                      | Value   |
+----------------------------+---------+
| OS-FLV-DISABLED:disabled   | False   |
| OS-FLV-EXT-DATA:ephemeral  | 0       |
| disk                       | 1       |
| id                         | 0       |
| name                       | m1.nano |
| os-flavor-access:is_public | True    |
| properties                 |         |
| ram                        | 64      |
| rxtx_factor                | 1.0     |
| swap                       |         |
| vcpus                      | 1       |
+----------------------------+---------+
```



```bash
[root@controller ~(keystone_admin)]# openstack flavor list
+--------------------------------------+-----------+-------+------+-----------+-------+-----------+
| ID                                   | Name      |   RAM | Disk | Ephemeral | VCPUs | Is Public |
+--------------------------------------+-----------+-------+------+-----------+-------+-----------+
| 0                                    | m1.nano   |    64 |    1 |         0 |     1 | True      |
| 1                                    | m1.tiny   |   512 |    1 |         0 |     1 | True      |
| 2                                    | m1.small  |  2048 |   20 |         0 |     1 | True      |
| 3                                    | m1.medium |  4096 |   40 |         0 |     2 | True      |
| 4                                    | m1.large  |  8192 |   80 |         0 |     4 | True      |
| 5                                    | m1.xlarge | 16384 |  160 |         0 |     8 | True      |
| 8c9144ed-dab8-4721-89a8-b61f1615629d | a.nano    |    64 |    1 |         0 |     1 | True      |
+--------------------------------------+-----------+-------+------+-----------+-------+-----------+
```



```bash
[root@controller ~(keystone_admin)]# ls .ssh
authorized_keys  id_rsa  id_rsa.pub  known_hosts
[root@controller ~(keystone_admin)]# ls
anaconda-ks.cfg               cirros-0.3.5-x86_64-disk.vmdk  keystonerc_demo    openstack.old  stack1-key1.pem
cirros-0.3.5-x86_64-disk.img  keystonerc_admin               keystonerc_stack1  openstack.txt
```

id_rsa가 개인키



```bash
[root@controller ~(keystone_admin)]# . keystonerc_demo 
[root@controller ~(keystone_demo)]# openstack keypair create --public-key ~/.ssh/id_rsa.pub mykey
+-------------+-------------------------------------------------+
| Field       | Value                                           |
+-------------+-------------------------------------------------+
| fingerprint | 0d:bd:8e:a0:79:eb:76:00:a8:58:ff:ab:bc:42:a2:6d |
| name        | mykey                                           |
| user_id     | ae98d0c1aea24f6fb24e3cd411a4616f                |
+-------------+-------------------------------------------------+
```



```bash
[root@controller ~(keystone_demo)]# openstack keypair list
+-------+-------------------------------------------------+
| Name  | Fingerprint                                     |
+-------+-------------------------------------------------+
| mykey | 0d:bd:8e:a0:79:eb:76:00:a8:58:ff:ab:bc:42:a2:6d |
+-------+-------------------------------------------------+
```



```bash
[root@controller ~(keystone_demo)]# openstack keypair show mykey
+-------------+-------------------------------------------------+
| Field       | Value                                           |
+-------------+-------------------------------------------------+
| created_at  | 2020-01-14T06:15:26.000000                      |
| deleted     | False                                           |
| deleted_at  | None                                            |
| fingerprint | 0d:bd:8e:a0:79:eb:76:00:a8:58:ff:ab:bc:42:a2:6d |
| id          | 2                                               |
| name        | mykey                                           |
| updated_at  | None                                            |
| user_id     | ae98d0c1aea24f6fb24e3cd411a4616f                |
+-------------+-------------------------------------------------+
```



```bash
[root@controller ~(keystone_demo)]# openstack security group rule create --proto icmp default
+-------------------+--------------------------------------+
| Field             | Value                                |
+-------------------+--------------------------------------+
| created_at        | 2020-01-14T06:17:27Z                 |
| description       |                                      |
| direction         | ingress                              |
| ether_type        | IPv4                                 |
| id                | ad549495-cd06-4dbc-bb1c-b50264a3ad1a |
| name              | None                                 |
| port_range_max    | None                                 |
| port_range_min    | None                                 |
| project_id        | 2f9522eaa35e48bb9bf6117ad1d7d020     |
| protocol          | icmp                                 |
| remote_group_id   | None                                 |
| remote_ip_prefix  | 0.0.0.0/0                            |
| revision_number   | 0                                    |
| security_group_id | c582755b-a656-4c4c-99e9-86f1b751d207 |
| updated_at        | 2020-01-14T06:17:27Z                 |
+-------------------+--------------------------------------+
```



```bash
[root@controller ~(keystone_demo)]# openstack security group rule create --proto tcp --dst-port 22 default
+-------------------+--------------------------------------+
| Field             | Value                                |
+-------------------+--------------------------------------+
| created_at        | 2020-01-14T06:18:13Z                 |
| description       |                                      |
| direction         | ingress                              |
| ether_type        | IPv4                                 |
| id                | 96775363-0362-43f8-8228-265b85061225 |
| name              | None                                 |
| port_range_max    | 22                                   |
| port_range_min    | 22                                   |
| project_id        | 2f9522eaa35e48bb9bf6117ad1d7d020     |
| protocol          | tcp                                  |
| remote_group_id   | None                                 |
| remote_ip_prefix  | 0.0.0.0/0                            |
| revision_number   | 0                                    |
| security_group_id | c582755b-a656-4c4c-99e9-86f1b751d207 |
| updated_at        | 2020-01-14T06:18:13Z                 |
+-------------------+--------------------------------------+
```



Self-service network

https://docs.openstack.org/install-guide/launch-instance-networks-selfservice.html



```bash
[root@controller ~(keystone_demo)]# openstack network create selfservice
+---------------------------+--------------------------------------+
| Field                     | Value                                |
+---------------------------+--------------------------------------+
| admin_state_up            | UP                                   |
| availability_zone_hints   |                                      |
| availability_zones        |                                      |
| created_at                | 2020-01-14T06:19:41Z                 |
| description               |                                      |
| dns_domain                | None                                 |
| id                        | ccfd06f2-175f-4318-b7fe-a9f1c4609dc9 |
| ipv4_address_scope        | None                                 |
| ipv6_address_scope        | None                                 |
| is_default                | False                                |
| is_vlan_transparent       | None                                 |
| mtu                       | 1450                                 |
| name                      | selfservice                          |
| port_security_enabled     | True                                 |
| project_id                | 2f9522eaa35e48bb9bf6117ad1d7d020     |
| provider:network_type     | None                                 |
| provider:physical_network | None                                 |
| provider:segmentation_id  | None                                 |
| qos_policy_id             | None                                 |
| revision_number           | 2                                    |
| router:external           | Internal                             |
| segments                  | None                                 |
| shared                    | False                                |
| status                    | ACTIVE                               |
| subnets                   |                                      |
| tags                      |                                      |
| updated_at                | 2020-01-14T06:19:41Z                 |
+---------------------------+--------------------------------------+
```



```bash
[root@controller ~(keystone_demo)]# openstack subnet create --network selfservice \
>   --dns-nameserver 8.8.4.4 --gateway 172.16.1.1 \
>   --subnet-range 172.16.1.0/24 selfservice
+-------------------+--------------------------------------+
| Field             | Value                                |
+-------------------+--------------------------------------+
| allocation_pools  | 172.16.1.2-172.16.1.254              |
| cidr              | 172.16.1.0/24                        |
| created_at        | 2020-01-14T06:21:56Z                 |
| description       |                                      |
| dns_nameservers   | 8.8.4.4                              |
| enable_dhcp       | True                                 |
| gateway_ip        | 172.16.1.1                           |
| host_routes       |                                      |
| id                | 63925c10-33d8-46da-a47e-d29430d70acd |
| ip_version        | 4                                    |
| ipv6_address_mode | None                                 |
| ipv6_ra_mode      | None                                 |
| name              | selfservice                          |
| network_id        | ccfd06f2-175f-4318-b7fe-a9f1c4609dc9 |
| project_id        | 2f9522eaa35e48bb9bf6117ad1d7d020     |
| revision_number   | 0                                    |
| segment_id        | None                                 |
| service_types     |                                      |
| subnetpool_id     | None                                 |
| tags              |                                      |
| updated_at        | 2020-01-14T06:21:56Z                 |
+-------------------+--------------------------------------+
```



```bash
[root@controller ~(keystone_demo)]# openstack router create router
+-------------------------+--------------------------------------+
| Field                   | Value                                |
+-------------------------+--------------------------------------+
| admin_state_up          | UP                                   |
| availability_zone_hints |                                      |
| availability_zones      |                                      |
| created_at              | 2020-01-14T06:23:05Z                 |
| description             |                                      |
| external_gateway_info   | None                                 |
| flavor_id               | None                                 |
| id                      | e7a9d2be-0864-461e-8a80-aaa4fef8d8fa |
| name                    | router                               |
| project_id              | 2f9522eaa35e48bb9bf6117ad1d7d020     |
| revision_number         | 1                                    |
| routes                  |                                      |
| status                  | ACTIVE                               |
| tags                    |                                      |
| updated_at              | 2020-01-14T06:23:05Z                 |
+-------------------------+--------------------------------------+
```



```bash
[root@controller ~(keystone_demo)]# openstack router add subnet router selfservice
[root@controller ~(keystone_demo)]# openstack router set router --external-gateway ext1
```



```bash
[root@controller ~(keystone_demo)]# ip netns
qrouter-e7a9d2be-0864-461e-8a80-aaa4fef8d8fa (id: 4)
qdhcp-ccfd06f2-175f-4318-b7fe-a9f1c4609dc9 (id: 3)
qrouter-a057f36d-27f0-44b9-b5d2-8a8cde77cf47 (id: 2)
qdhcp-6d379f41-147c-4fa1-bf16-742651879c50 (id: 1)
qdhcp-4e252b8b-2c4a-4a96-af37-4d636fbe1dea (id: 0)
```



```bash
[root@controller ~(keystone_demo)]# . keystonerc_admin 
[root@controller ~(keystone_admin)]# openstack port list --router router
+--------------------------------------+------+-------------------+---------------------------------------------------------------------------+--------+
| ID                                   | Name | MAC Address       | Fixed IP Addresses                                                        | Status |
+--------------------------------------+------+-------------------+---------------------------------------------------------------------------+--------+
| 5caa2e6f-6958-420b-a68e-3f749a7e213e |      | fa:16:3e:8c:c8:d4 | ip_address='10.0.0.215', subnet_id='44b85023-b59a-4a65-ba5a-b7db4519f411' | ACTIVE |
| 9213c122-ce8b-42c0-afbd-c0024871a0e1 |      | fa:16:3e:17:87:1c | ip_address='172.16.1.1', subnet_id='63925c10-33d8-46da-a47e-d29430d70acd' | ACTIVE |
+--------------------------------------+------+-------------------+---------------------------------------------------------------------------+--------+
```





---

-> Launch an instance on the self-service network

https://docs.openstack.org/install-guide/launch-instance-selfservice.html



```bash
[root@controller ~(keystone_admin)]# . keystonerc_demo 
[root@controller ~(keystone_demo)]# openstack image list

[root@controller ~(keystone_demo)]# ls
anaconda-ks.cfg               cirros-0.3.5-x86_64-disk.vmdk  keystonerc_demo    openstack.old  stack1-key1.pem
cirros-0.3.5-x86_64-disk.img  keystonerc_admin               keystonerc_stack1  openstack.txt
```



만약 img 파일이 없다면

```bash
# yum install -y wget
# wget http://download.cirros-cloud.net/0.3.5/cirros-0.3.5-x86_64-disk.img
```



```bash
[root@controller ~(keystone_demo)]# openstack image create "cirros" --container-format bare --disk-format qcow2 --file ./cirros-0.3.5-x86_64-disk.img
+------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Field            | Value                                                                                                                                                                                      |
+------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| checksum         | f8ab98ff5e73ebab884d80c9dc9c7290                                                                                                                                                           |
| container_format | bare                                                                                                                                                                                       |
| created_at       | 2020-01-14T06:29:01Z                                                                                                                                                                       |
| disk_format      | qcow2                                                                                                                                                                                      |
| file             | /v2/images/7e7fbea4-d77e-46c9-87c9-24ff859e1ef0/file                                                                                                                                       |
| id               | 7e7fbea4-d77e-46c9-87c9-24ff859e1ef0                                                                                                                                                       |
| min_disk         | 0                                                                                                                                                                                          |
| min_ram          | 0                                                                                                                                                                                          |
| name             | cirros                                                                                                                                                                                     |
| owner            | 2f9522eaa35e48bb9bf6117ad1d7d020                                                                                                                                                           |
| properties       | os_hash_algo='sha512', os_hash_value='f0fd1b50420dce4ca382ccfbb528eef3a38bbeff00b54e95e3876b9bafe7ed2d6f919ca35d9046d437c6d2d8698b1174a335fbd66035bb3edc525d2cdb187232', os_hidden='False' |
| protected        | False                                                                                                                                                                                      |
| schema           | /v2/schemas/image                                                                                                                                                                          |
| size             | 13267968                                                                                                                                                                                   |
| status           | active                                                                                                                                                                                     |
| tags             |                                                                                                                                                                                            |
| updated_at       | 2020-01-14T06:29:01Z                                                                                                                                                                       |
| virtual_size     | None                                                                                                                                                                                       |
| visibility       | shared                                                                                                                                                                                     |
+------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```



```bash
[root@controller ~(keystone_demo)]# openstack network list
+--------------------------------------+-------------+--------------------------------------+
| ID                                   | Name        | Subnets                              |
+--------------------------------------+-------------+--------------------------------------+
| 6d379f41-147c-4fa1-bf16-742651879c50 | ext1        | 44b85023-b59a-4a65-ba5a-b7db4519f411 |
| ccfd06f2-175f-4318-b7fe-a9f1c4609dc9 | selfservice | 63925c10-33d8-46da-a47e-d29430d70acd |
+--------------------------------------+-------------+--------------------------------------+
```



```bash
[root@controller ~(keystone_demo)]# openstack server create --flavor m1.nano --image cirros \
>   --nic net-id=ccfd06f2-175f-4318-b7fe-a9f1c4609dc9 --security-group default \
>   --key-name mykey selfservice-instance
+-----------------------------+-----------------------------------------------+
| Field                       | Value                                         |
+-----------------------------+-----------------------------------------------+
| OS-DCF:diskConfig           | MANUAL                                        |
| OS-EXT-AZ:availability_zone |                                               |
| OS-EXT-STS:power_state      | NOSTATE                                       |
| OS-EXT-STS:task_state       | scheduling                                    |
| OS-EXT-STS:vm_state         | building                                      |
| OS-SRV-USG:launched_at      | None                                          |
| OS-SRV-USG:terminated_at    | None                                          |
| accessIPv4                  |                                               |
| accessIPv6                  |                                               |
| addresses                   |                                               |
| adminPass                   | p5qw46qMWjuW                                  |
| config_drive                |                                               |
| created                     | 2020-01-14T06:32:24Z                          |
| flavor                      | m1.nano (0)                                   |
| hostId                      |                                               |
| id                          | 159819cd-e8e6-47ba-8556-dec3f2c1003b          |
| image                       | cirros (7e7fbea4-d77e-46c9-87c9-24ff859e1ef0) |
| key_name                    | mykey                                         |
| name                        | selfservice-instance                          |
| progress                    | 0                                             |
| project_id                  | 2f9522eaa35e48bb9bf6117ad1d7d020              |
| properties                  |                                               |
| security_groups             | name='c582755b-a656-4c4c-99e9-86f1b751d207'   |
| status                      | BUILD                                         |
| updated                     | 2020-01-14T06:32:25Z                          |
| user_id                     | ae98d0c1aea24f6fb24e3cd411a4616f              |
| volumes_attached            |                                               |
+-----------------------------+-----------------------------------------------+
```



```bash
[root@controller ~(keystone_demo)]# openstack server list
+--------------------------------------+----------------------+--------+------------------------+--------+---------+
| ID                                   | Name                 | Status | Networks               | Image  | Flavor  |
+--------------------------------------+----------------------+--------+------------------------+--------+---------+
| 159819cd-e8e6-47ba-8556-dec3f2c1003b | selfservice-instance | ACTIVE | selfservice=172.16.1.6 | cirros | m1.nano |
+--------------------------------------+----------------------+--------+------------------------+--------+---------+
```



```bash
[root@controller ~(keystone_demo)]# openstack console url show selfservice-instance
+-------+-------------------------------------------------------------------------------------------+
| Field | Value                                                                                     |
+-------+-------------------------------------------------------------------------------------------+
| type  | novnc                                                                                     |
| url   | http://10.0.0.100:6080/vnc_auto.html?path=%3Ftoken%3Dbef39ec0-1148-4c57-972c-86610ffecf20 |
+-------+-------------------------------------------------------------------------------------------+
```



url을 통해 인스턴스 console 접속 (web 기반 novnc protocol로 접속 가능)

![image-20200114153811937](images/image-20200114153811937.png)



virsh 명령어를 이용해 인스턴스 console 접속

```bash
[root@controller ~(keystone_demo)]# virsh list --all
 Id    이름                         상태
----------------------------------------------------
 4     instance-00000004              실행중
 5     instance-00000005              실행중
 -     instance-00000003              종료

[root@controller ~(keystone_demo)]# virsh console 5
도메인 instance-00000005에 연결되었습니다
Escape character is ^]

login as 'cirros' user. default password: 'cubswin:)'. use 'sudo' for root.
selfservice-instance login: 

```

Ctrl + ] 로 disconnect



http://10.0.0.100/dashboard/auth/login/



demo 사용자로 로그인



![image-20200114160841055](images/image-20200114160841055.png)



---

### Block Storage (Cinder)



p226

* Block Storage 서비스 (Cinder)
  * 블록 스토리지 서비스인 Cinder는 Nova에서 생성된 인스턴스에 확장하여 사용할 수 있는 저장 공간을 생성 및 삭제하고 인스턴스에 연결할 수 있는 기능을 제공



p227

* Cinder가 지원하는 Block Storage 드라이버
  * Cinder의 기본 Block Storage 드라이버는 iSCSI 기반의 LVM(Logical Volume Manager)이다. 그 외에도 많은 드라이버가 Block Storage로 사용된다.



p228

Ceph RBD, LVM



* Ceph(Block Storage) vs. Chef(CM)
  * Ceph
    * Block 기반 (RBD)
    * Object 기반
    * File 기반 (CephFS)



* LVM
  * LVM은 Logical Volume Manager의 약자로 하드 디스크를 파티션 대신 논리 볼륨으로 할당하고, 다시 여러 개의 디스크를 좀 더 효율적이고 유연하게 관리할 수 있는 방식을 뜻한다.



controller 에서 실행

```bash
[root@controller ~(keystone_demo)]# vgs
  VG             #PV #LV #SN Attr   VSize   VFree   
  cinder-volumes   1   4   0 wz--n- <20.60g 1012.00m
  cl               1   3   0 wz--n-  75.75g    4.00m
```



```bash
[root@controller ~(keystone_demo)]# pvs
  PV         VG             Fmt  Attr PSize   PFree   
  /dev/loop0 cinder-volumes lvm2 a--  <20.60g 1012.00m
  /dev/sda2  cl             lvm2 a--   75.75g    4.00m
```



```bash
[root@controller ~(keystone_demo)]# losetup -a
/dev/loop0: [64768]:68197847 (/var/lib/cinder/cinder-volumes)
/dev/loop1: [64768]:68598734 (/srv/loopback-device/swiftloopback)
[root@controller ~(keystone_demo)]# ls -l /var/lib/cinder/cinder-volumes
-rw-r-----. 1 root root 22118662144  1월 10 16:55 /var/lib/cinder/cinder-volumes
```



```bash
[root@controller ~(keystone_demo)]# lvs
  LV                                             VG             Attr       LSize  Pool                Origin                                         Data%  Meta%  Move Log Cpy%Sync Convert
  _snapshot-16755ff2-d772-4f6a-84e7-f79604748883 cinder-volumes Vwi-a-tz-k  1.00g cinder-volumes-pool volume-de0b0ac5-3448-45ed-a764-1b8ecb007b0a    3.21                                   
  cinder-volumes-pool                            cinder-volumes twi-aotz-- 19.57g                                                                    0.16   10.68                           
  volume-c8edeaa3-93d0-4ab1-8cbd-bc4c59a8eb2a    cinder-volumes Vwi-aotz--  1.00g cinder-volumes-pool _snapshot-16755ff2-d772-4f6a-84e7-f79604748883 3.21                                   
  volume-de0b0ac5-3448-45ed-a764-1b8ecb007b0a    cinder-volumes Vwi-a-tz--  1.00g cinder-volumes-pool                                                3.21                                   
  home                                           cl             -wi-ao---- 10.00g                                                                                                           
  root                                           cl             -wi-ao---- 60.00g                                                                                                           
  swap                                           cl             -wi-ao----  5.75g
```



```bash
[root@controller ~(keystone_demo)]# lsblk
NAME                                                                      MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda                                                                         8:0    0  100G  0 disk 
├─sda1                                                                      8:1    0    1G  0 part /boot
└─sda2                                                                      8:2    0 75.8G  0 part 
  ├─cl-root                                                               253:0    0   60G  0 lvm  /
  ├─cl-swap                                                               253:1    0  5.8G  0 lvm  [SWAP]
  └─cl-home                                                               253:2    0   10G  0 lvm  /home
sdb                                                                         8:16   0    1G  0 disk 
└─sdb1                                                                      8:17   0 1023M  0 part 
sr0                                                                        11:0    1  4.1G  0 rom  
loop0                                                                       7:0    0 20.6G  0 loop 
├─cinder--volumes-cinder--volumes--pool_tmeta                             253:3    0   20M  0 lvm  
│ └─cinder--volumes-cinder--volumes--pool-tpool                           253:5    0 19.6G  0 lvm  
│   ├─cinder--volumes-cinder--volumes--pool                               253:6    0 19.6G  0 lvm  
│   ├─cinder--volumes-volume--de0b0ac5--3448--45ed--a764--1b8ecb007b0a    253:7    0    1G  0 lvm  
│   ├─cinder--volumes-_snapshot--16755ff2--d772--4f6a--84e7--f79604748883 253:8    0    1G  0 lvm  
│   └─cinder--volumes-volume--c8edeaa3--93d0--4ab1--8cbd--bc4c59a8eb2a    253:9    0    1G  0 lvm  
└─cinder--volumes-cinder--volumes--pool_tdata                             253:4    0 19.6G  0 lvm  
  └─cinder--volumes-cinder--volumes--pool-tpool                           253:5    0 19.6G  0 lvm  
    ├─cinder--volumes-cinder--volumes--pool                               253:6    0 19.6G  0 lvm  
    ├─cinder--volumes-volume--de0b0ac5--3448--45ed--a764--1b8ecb007b0a    253:7    0    1G  0 lvm  
    ├─cinder--volumes-_snapshot--16755ff2--d772--4f6a--84e7--f79604748883 253:8    0    1G  0 lvm  
    └─cinder--volumes-volume--c8edeaa3--93d0--4ab1--8cbd--bc4c59a8eb2a    253:9    0    1G  0 lvm  
loop1                                                                       7:1    0    2G  0 loop /srv/node/swiftloopback
```



p230

Initiator : Client : NOVA

Target : Server : Cinder node



---



```bash
[root@controller ~(keystone_demo)]# openstack server list
+--------------------------------------+----------------------+--------+------------------------+--------+---------+
| ID                                   | Name                 | Status | Networks               | Image  | Flavor  |
+--------------------------------------+----------------------+--------+------------------------+--------+---------+
| 159819cd-e8e6-47ba-8556-dec3f2c1003b | selfservice-instance | ACTIVE | selfservice=172.16.1.6 | cirros | m1.nano |
+--------------------------------------+----------------------+--------+------------------------+--------+---------+
[root@controller ~(keystone_demo)]# cinder create --name demo-v1 1
+------------------------------+--------------------------------------+
| Property                     | Value                                |
+------------------------------+--------------------------------------+
| attachments                  | []                                   |
| availability_zone            | nova                                 |
| bootable                     | false                                |
| consistencygroup_id          | None                                 |
| created_at                   | 2020-01-14T07:50:52.000000           |
| description                  | None                                 |
| encrypted                    | False                                |
| id                           | 45fbb8f6-dca1-4aa1-bbdf-617025611ff9 |
| metadata                     | {}                                   |
| multiattach                  | False                                |
| name                         | demo-v1                              |
| os-vol-tenant-attr:tenant_id | 2f9522eaa35e48bb9bf6117ad1d7d020     |
| replication_status           | None                                 |
| size                         | 1                                    |
| snapshot_id                  | None                                 |
| source_volid                 | None                                 |
| status                       | creating                             |
| updated_at                   | None                                 |
| user_id                      | ae98d0c1aea24f6fb24e3cd411a4616f     |
| volume_type                  | iscsi                                |
+------------------------------+--------------------------------------+
[root@controller ~(keystone_demo)]# cinder list
+--------------------------------------+-----------+---------+------+-------------+----------+-------------+
| ID                                   | Status    | Name    | Size | Volume Type | Bootable | Attached to |
+--------------------------------------+-----------+---------+------+-------------+----------+-------------+
| 45fbb8f6-dca1-4aa1-bbdf-617025611ff9 | available | demo-v1 | 1    | iscsi       | false    |             |
+--------------------------------------+-----------+---------+------+-------------+----------+-------------+
```



```bash
[root@controller ~(keystone_demo)]# lvs
  LV                                             VG             Attr       LSize  Pool                Origin                                         Data%  Meta%  Move Log Cpy%Sync Convert
  _snapshot-16755ff2-d772-4f6a-84e7-f79604748883 cinder-volumes Vwi-a-tz-k  1.00g cinder-volumes-pool volume-de0b0ac5-3448-45ed-a764-1b8ecb007b0a    3.21                                   
  cinder-volumes-pool                            cinder-volumes twi-aotz-- 19.57g                                                                    0.16   10.70                           
  volume-45fbb8f6-dca1-4aa1-bbdf-617025611ff9    cinder-volumes Vwi-a-tz--  1.00g cinder-volumes-pool                                                0.00                                   
  volume-c8edeaa3-93d0-4ab1-8cbd-bc4c59a8eb2a    cinder-volumes Vwi-aotz--  1.00g cinder-volumes-pool _snapshot-16755ff2-d772-4f6a-84e7-f79604748883 3.21                                   
  volume-de0b0ac5-3448-45ed-a764-1b8ecb007b0a    cinder-volumes Vwi-a-tz--  1.00g cinder-volumes-pool                                                3.21                                   
  home                                           cl             -wi-ao---- 10.00g                                                                                                           
  root                                           cl             -wi-ao---- 60.00g                                                                                                           
  swap                                           cl             -wi-ao----  5.75g
```

logical volume list를 확인한다.  1GB volume이 하나 더 생성된 것을 확인할 수 있다.



```bash
[root@controller ~(keystone_demo)]# nova volume-attach selfservice-instance 45fbb8f6-dca1-4aa1-bbdf-617025611ff9 auto
+----------+--------------------------------------+
| Property | Value                                |
+----------+--------------------------------------+
| device   | /dev/vdb                             |
| id       | 45fbb8f6-dca1-4aa1-bbdf-617025611ff9 |
| serverId | 159819cd-e8e6-47ba-8556-dec3f2c1003b |
| volumeId | 45fbb8f6-dca1-4aa1-bbdf-617025611ff9 |
+----------+--------------------------------------+
```



```bash
[root@controller ~(keystone_demo)]# lsblk
NAME                                                                      MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda                                                                         8:0    0  100G  0 disk 
├─sda1                                                                      8:1    0    1G  0 part /boot
└─sda2                                                                      8:2    0 75.8G  0 part 
  ├─cl-root                                                               253:0    0   60G  0 lvm  /
  ├─cl-swap                                                               253:1    0  5.8G  0 lvm  [SWAP]
  └─cl-home                                                               253:2    0   10G  0 lvm  /home
sdb                                                                         8:16   0    1G  0 disk 
└─sdb1                                                                      8:17   0 1023M  0 part 
sdc                                                                         8:32   0    1G  0 disk 
sr0                                                                        11:0    1  4.1G  0 rom  
loop0                                                                       7:0    0 20.6G  0 loop 
├─cinder--volumes-cinder--volumes--pool_tmeta                             253:3    0   20M  0 lvm  
│ └─cinder--volumes-cinder--volumes--pool-tpool                           253:5    0 19.6G  0 lvm  
│   ├─cinder--volumes-cinder--volumes--pool                               253:6    0 19.6G  0 lvm  
│   ├─cinder--volumes-volume--de0b0ac5--3448--45ed--a764--1b8ecb007b0a    253:7    0    1G  0 lvm  
│   ├─cinder--volumes-_snapshot--16755ff2--d772--4f6a--84e7--f79604748883 253:8    0    1G  0 lvm  
│   ├─cinder--volumes-volume--c8edeaa3--93d0--4ab1--8cbd--bc4c59a8eb2a    253:9    0    1G  0 lvm  
│   └─cinder--volumes-volume--45fbb8f6--dca1--4aa1--bbdf--617025611ff9    253:10   0    1G  0 lvm  
└─cinder--volumes-cinder--volumes--pool_tdata                             253:4    0 19.6G  0 lvm  
  └─cinder--volumes-cinder--volumes--pool-tpool                           253:5    0 19.6G  0 lvm  
    ├─cinder--volumes-cinder--volumes--pool                               253:6    0 19.6G  0 lvm  
    ├─cinder--volumes-volume--de0b0ac5--3448--45ed--a764--1b8ecb007b0a    253:7    0    1G  0 lvm  
    ├─cinder--volumes-_snapshot--16755ff2--d772--4f6a--84e7--f79604748883 253:8    0    1G  0 lvm  
    ├─cinder--volumes-volume--c8edeaa3--93d0--4ab1--8cbd--bc4c59a8eb2a    253:9    0    1G  0 lvm  
    └─cinder--volumes-volume--45fbb8f6--dca1--4aa1--bbdf--617025611ff9    253:10   0    1G  0 lvm  
loop1                                                                       7:1    0    2G  0 loop /srv/node/swiftloopback
```



```bash
[root@controller ~(keystone_demo)]# cinder show demo-v1
+------------------------------+------------------------------------------+
| Property                     | Value                                    |
+------------------------------+------------------------------------------+
| attached_servers             | ['159819cd-e8e6-47ba-8556-dec3f2c1003b'] |
| attachment_ids               | ['899b6762-708c-4dc6-89e1-566419253ea8'] |
| availability_zone            | nova                                     |
| bootable                     | false                                    |
| consistencygroup_id          | None                                     |
| created_at                   | 2020-01-14T07:50:52.000000               |
| description                  | None                                     |
| encrypted                    | False                                    |
| id                           | 45fbb8f6-dca1-4aa1-bbdf-617025611ff9     |
| metadata                     |                                          |
| multiattach                  | False                                    |
| name                         | demo-v1                                  |
| os-vol-tenant-attr:tenant_id | 2f9522eaa35e48bb9bf6117ad1d7d020         |
| replication_status           | None                                     |
| size                         | 1                                        |
| snapshot_id                  | None                                     |
| source_volid                 | None                                     |
| status                       | in-use                                   |
| updated_at                   | 2020-01-14T07:54:06.000000               |
| user_id                      | ae98d0c1aea24f6fb24e3cd411a4616f         |
| volume_type                  | iscsi                                    |
+------------------------------+------------------------------------------+
```





---

### Object Storage Service (Swift)



p265

데이터 유형에 따라 저장하는 store를 선택할 수 있다. 여러 서비스들에 대한 back 단에 데이터를 저장할 때에도 마찬가지로 데이터 유형에 따라 선택할 수 있다.

swift account 쪽으로 자동 기록

컨테이너에 관련된 정보는 container DB에 저장

실제 저장소는 object store. 물리적인 저장소라고 생각



p266

여러개의 물리적인 storage 들을 네트워크를 기반으로 해서 분산 형태로 가상의 disk array 형태로 제공하는 메커니즘이다.

분산과 이중화가 적용되는 architecture

한 쪽 node가 down이 되더라도 다른 node에 중복된 데이터를 가지고 있다.



p267

오브젝트에 대한 위치 정보를 유지, 관리 해야한다. 그 index 파일이 Swift Ring 파일이다.

각 storage node마다 account process, container process, object process가 있다. port로 구분한다.



```bash
[root@controller ~(keystone_demo)]# swift post d1
```

post : 컨테이너 생성



```bash
[root@controller ~(keystone_demo)]# swift upload d1 cirros-0.3.5-x86_64-disk.img
cirros-0.3.5-x86_64-disk.img
```

img 파일 업로드



```bash
[root@controller ~(keystone_demo)]# swift list d1 --lh
 12M 2020-01-14 08:10:04 application/octet-stream cirros-0.3.5-x86_64-disk.img
 12M
```

컨테이너 내 파일 자세하게 확인



```bash
[root@controller ~(keystone_demo)]# cd /var/tmp
[root@controller tmp(keystone_demo)]# swift download d1
cirros-0.3.5-x86_64-disk.img [auth 0.607s, headers 1.251s, total 1.373s, 17.335 MB/s]
[root@controller tmp(keystone_demo)]# ls -l ci*
-rw-r--r--. 1 root root 13267968  1월 10 15:28 cirros-0.3.5-x86_64-disk.img
```

현재 위치에 다운이 된다.



---

### Openstack High Availability Architecture



p270



controller 이중화



compute node 같은 경우 네트워크 카드를 이중화 한다.

네트워크 카드에 문제가 있더라도 다른 쪽 카드를 통해서 작업할 수 있도록 한다. bonding(6.x). teaming(7.x)



storage

Glance : glusterfs (파일 기반 이중화 솔루션)

Cinder : Ceph



---



17장 heat 서비스

자동화

openstack의 리소스들을 자동화한다. OS 에서의 Shell Script 같은 역할이다.



21, 22장



