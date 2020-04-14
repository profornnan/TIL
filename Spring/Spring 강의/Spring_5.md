# Spring

### 컴포넌트 스캔을 통해 만들어지는 빈과 수동으로 등록한 빈이 충돌



/ex03/src/main/java/spring/MemberDao.java

```java
@Component
public class MemberDao {
    	:
}
```

⇒ 컴포넌트 스캔을 통해서 **MemberDao 타입의 memberDao 빈**이 자동으로 생성 및 등록



/ex03/src/main/java/config/AppConf.java

```java
@Configuration
@ComponentScan(basePackages = { "spring", "spring2" })
public class AppConf {

	@Bean
	public MemberDao memberDao() {
		return new MemberDao();
	}
    			:
}
```

⇒ **MemberDao 타입의 memberDao 빈**을 생성 및 등록



같은 타입의 같은 이름의 빈이 컴포넌트 스캔 방식과 수동 등록 방식으로 정의되어 있는 경우 ⇒ **수동으로 등록한 빈을 우선적으로 생성**



이러한 충돌을 방지하기 위해서는 컴포넌트(빈) 이름을 다르게 설정하는 것이 필요



### 수동으로 등록하는 빈의 이름이 다른 경우

/ex03/src/main/java/spring/MemberDao.java

```java
@Component
public class MemberDao {
    	:
}
```

⇒ 컴포넌트 스캔을 통해서 **MemberDao 타입의 memberDao 빈**이 자동으로 생성 및 등록



/ex03/src/main/java/config/AppConf.java

```java
@Configuration
@ComponentScan(basePackages = { "spring", "spring2" })
public class AppConf {

	@Bean
	public MemberDao memberDao2() {
		return new MemberDao();
	}
    			:
}
```

⇒ **MemberDao 타입의** **memberDao2** **빈**을 생성 및 등록



## 빈 라이프사이클(bean life-cycle)

### 스프링 컨테이너 초기화 및 종료

```java
// 컨테이너를 초기화
// ⇒ 스프링 설정 클래스의 정보를 읽어와서 빈 객체를 생성하고 각 빈을 연결(의존 주입)하고 초기화하는 작업을 수행
private static ApplicationContext ctx = new AnnotationConfigApplicationContext(AppConf.class);

// 컨테이너에서 빈 객체를 구해서 사용
// Greet g = new Greet();
Greet g = ctx.getBean("greet", Greet.class);
System.out.println(g.greet("스프링"));

// 컨테이너 종료 
// ⇒ 빈 객체를 소멸
ctx.close();
```



### 빈 객체의 라이프사이클

빈 객체의 라이프사이클을 스프링 컨테이너가 관리

빈 객체는 생성 → 의존 설정 → 초기화 → 사용 → 소멸 과정을 거침



초기화 및 소멸 과정에서 수행할 기능의 예

1. 데이터베이스 연결 및 연결 해제
2. 채팅과 같은 프로그램에서 서버와의 소켓 연결 및 연결 해제



### 스프링 인터페이스를 이용한 빈 객체 초기화 및 소멸

https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/InitializingBean.html



https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/DisposableBean.html



org.springframework.beans.factory.InitializingBean 인터페이스에 afterPropertiesSet() 메서드와 org.springframework.beans.factory.DisposableBean 인터페이스에 destroy() 메서드를 정의



/ex03/src/main/java/spring/Client.java

```java
package spring;

public class Client {
	
	private String host;
	
	public void setHost(String host) {
		this.host = host;
	}
	
	public void send() {
		System.out.println("Client send to " + this.host);
	}
}
```



/ex03/src/main/java/config/AppConf3.java

```java
package config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import spring.Client;

@Configuration
public class AppConf3 {
	
	@Bean
	public Client client() {
		Client c = new Client();
		c.setHost("MyHost");
		return c;
	}
}
```



/ex03/src/main/java/main/Main3.java

```java
package main;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import config.AppConf3;
import spring.Client;

public class Main3 {
	public static void main(String[] args) {
		AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(AppConf3.class);
		
		Client client = ctx.getBean("client", Client.class);
		client.send();
		
		ctx.close();
	}
}
```



Main3.java 마우스 오른쪽 클릭 => Run As => Java Application

```
4월 13, 2020 10:54:14 오전 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Mon Apr 13 10:54:14 KST 2020]; root of context hierarchy
Client send to MyHost
4월 13, 2020 10:54:15 오전 org.springframework.context.support.AbstractApplicationContext doClose
정보: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Mon Apr 13 10:54:14 KST 2020]; root of context hierarchy
```



---



Client 빈이 생성 후, 소멸 전 수행해야 할 기능을 추가



/ex03/src/main/java/spring/Client.java

```java
package spring;

import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;

public class Client implements InitializingBean, DisposableBean {
	
	private String host;
	
	public void setHost(String host) {
		this.host = host;
	}
	
	public void send() {
		System.out.println("Client send to " + this.host);
	}

	@Override
	public void afterPropertiesSet() throws Exception {
		System.out.println("Client.afterPropertiesSet() 실행");
	}

	@Override
	public void destroy() throws Exception {
		System.out.println("Client.destory() 실행");
	}
}
```



```
4월 13, 2020 10:58:37 오전 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Mon Apr 13 10:58:37 KST 2020]; root of context hierarchy
Client.afterPropertiesSet() 실행
Client send to MyHost
4월 13, 2020 10:58:39 오전 org.springframework.context.support.AbstractApplicationContext doClose
정보: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Mon Apr 13 10:58:37 KST 2020]; root of context hierarchy
Client.destory() 실행
```



### 커스텀 메서드를 이용한 빈 객체 초기화 및 소멸

모든 클래스가 InitializingBean, DisposableBean 인터페이스를 상속받을 수는 없음

직접 구현한 클래가 아닌 경우 = 외부에서 제공받은 클래스인 경우



Client.java 복사 => 붙여넣기 => Client2.java

/ex03/src/main/java/spring/Client2.java

```java
package spring;

public class Client2 {

	private String host;

	public void setHost(String host) {
		this.host = host;
	}

	public void send() {
		System.out.println("Client send to " + this.host);
	}

	// Clients 객체가 생성된 직후 실행되기를 원하는 메서드
	public void connect() {
		System.out.println("Client.connect() 실행");
	}

	// Clients 객체가 소멸되기 직전 실행되기를 원하는 메서드
	public void disconnect() {
		System.out.println("Client.disconnect() 실행");
	}
}
```



/ex03/src/main/java/config/AppConf4.java

```java
package config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import spring.Client2;

@Configuration
public class AppConf4 {

	@Bean(initMethod = "connect", destroyMethod = "disconnect")
	public Client2 client2() {
		Client2 c = new Client2();
		c.setHost("MyHost");
		return c;
	}
}
```



/ex03/src/main/java/main/Main4.java

```java
package main;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import config.AppConf4;
import spring.Client2;

public class Main4 {
	public static void main(String[] args) {
		AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(AppConf4.class);

		Client2 client2 = ctx.getBean("client2", Client2.class);
		client2.send();

		ctx.close();
	}
}
```



```
4월 13, 2020 11:35:47 오전 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Mon Apr 13 11:35:47 KST 2020]; root of context hierarchy
Client.connect() 실행
Client send to MyHost
4월 13, 2020 11:35:48 오전 org.springframework.context.support.AbstractApplicationContext doClose
정보: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Mon Apr 13 11:35:47 KST 2020]; root of context hierarchy
Client.disconnect() 실행
```



---



빈 설정 메서드에서 초기화 메서드를 직접 실행하는 것도 가능 (당연히)

```java
@Configuration
public class AppConf4 {

	@Bean(destroyMethod = "disconnect")
	public Client2 client2() {
		Client2 c = new Client2();
		c.setHost("MyHost");
		c.connect();
		return c;
	}
}
```



---



빈 설정 메서드에서 초기화 메서드를 직접 실행할 때 초기화 메서드가 두 번 호출되지 않도록 유의

```java
public class Client implements InitializingBean, DisposableBean {
	
	private String host;
	
	public void setHost(String host) {
		this.host = host;
	}
	
	public void send() {
		System.out.println("Client send to " + this.host);
	}

	@Override
	public void afterPropertiesSet() throws Exception {
		System.out.println("Client.afterPropertiesSet() 실행");
	}

	@Override
	public void destroy() throws Exception {
		System.out.println("Client.destory() 실행");
	}
}
```



```java
@Configuration
public class AppConf3 {
	
	@Bean
	public Client client() throws Exception {
		Client c = new Client();
		c.setHost("MyHost");
		c.afterPropertiesSet();
		return c;
	}
}
```



```
4월 13, 2020 11:44:51 오전 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Mon Apr 13 11:44:51 KST 2020]; root of context hierarchy
Client.afterPropertiesSet() 실행
Client.afterPropertiesSet() 실행
Client send to MyHost
4월 13, 2020 11:44:52 오전 org.springframework.context.support.AbstractApplicationContext doClose
정보: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Mon Apr 13 11:44:51 KST 2020]; root of context hierarchy
Client.destory() 실행
```



## 빈 객체의 범위(scope)

### 싱글톤 범위 (sigleton scope)

별도의 설정을 하지 않으면 빈은 싱글톤 범위를 가진다.

명시적으로 싱글톤 범위를 지정하려면 @Scope("singleton") 애노테이션을 사용



```java
package config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

import spring.Client;

@Configuration
public class AppConf3 {
	
	@Bean
	@Scope("singleton")   // 생략 가능
	public Client client() throws Exception {
		Client c = new Client();
		c.setHost("MyHost");
		c.afterPropertiesSet();
		return c;
	}
}
```



```java
package main;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import config.AppConf3;
import spring.Client;

public class Main3 {
	public static void main(String[] args) {
		AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(AppConf3.class);
		
		Client client1 = ctx.getBean("client", Client.class);
		Client client2 = ctx.getBean("client", Client.class);
				
		System.out.println("client1 >>> " + client1);
		System.out.println("client2 >>> " + client2);
		System.out.println("client1 == client2 >>> " + (client1 == client2));
		
		client1.send();
		client2.send();
		
		ctx.close();
	}
}
```



```
4월 13, 2020 11:51:20 오전 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Mon Apr 13 11:51:20 KST 2020]; root of context hierarchy
Client.afterPropertiesSet() 실행
Client.afterPropertiesSet() 실행
client1 >>> spring.Client@12028586
client2 >>> spring.Client@12028586
client1 == client2 >>> true
Client send to MyHost
Client send to MyHost
4월 13, 2020 11:51:21 오전 org.springframework.context.support.AbstractApplicationContext doClose
정보: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Mon Apr 13 11:51:20 KST 2020]; root of context hierarchy
Client.destory() 실행
```



### 프로토타입 범위

빈 객체를 구할 때 마다 매번 새로운 객체를 생성

→ getBean()



@Scope("prototype") 애노테이션을 이용해서 프로토타입 범위를 지정



/ex03/src/main/java/spring/Client.java

```java
public class Client implements InitializingBean, DisposableBean {
	
	private String host;
	
	public void setHost(String host) {
		this.host = host;
	}
	
	public void send() {
		System.out.println("Client send to " + this.host);  // #3-2, #3-3
	}

	@Override
	public void afterPropertiesSet() throws Exception {
		System.out.println("Client.afterPropertiesSet() 실행");  // #1-3
	}

	@Override
	public void destroy() throws Exception {
		System.out.println("Client.destory() 실행");  // #8-2
	}
}
```



/ex03/src/main/java/spring/Client2.java

```java
package spring;

public class Client2 {

	private String host;

	public void setHost(String host) {
		this.host = host;
	}

	public void send() {
		System.out.println("Client2 send to " + this.host);  // #7-2, #7-4
	}

	public void connect() {
		System.out.println("Client2.connect() 실행");  // #4-3, #5-3
	}

	public void disconnect() {
		System.out.println("Client2.disconnect() 실행");
	}
}
```



/ex03/src/main/java/config/AppConf3.java

```java
@Configuration
public class AppConf3 {
	
	@Bean
	@Scope("singleton")
	public Client client() {             
		Client c = new Client();
		c.setHost("MyHost");  // #1-2
		return c;
	}
	
	@Bean(initMethod = "connect", destroyMethod = "disconnect")
	@Scope("prototype")
	public Client2 client2() {
		Client2 c = new Client2();
		c.setHost("MyHost2");  // #4-2, #5-2
		return c;
	}
}
```



/ex03/src/main/java/main/Main3.java

```java
public class Main3 {
	public static void main(String[] args) {
		AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(AppConf3.class);  // #1-1
		
		Client client1 = ctx.getBean("client", Client.class);
		Client client2 = ctx.getBean("client", Client.class);
				
		System.out.println("client1 >>> " + client1);  // #2
		System.out.println("client2 >>> " + client2);
		System.out.println("client1 == client2 >>> " + (client1 == client2));
		
		client1.send();  // #3-1
		client2.send();  // #3-3
		
		Client2 client3 = ctx.getBean("client2", Client2.class);  // #4-1
		Client2 client4 = ctx.getBean("client2", Client2.class);  // #5-1
		
		System.out.println("client3 >>> " + client3);  // #6
		System.out.println("client4 >>> " + client4);
		System.out.println("client3 == client4 >>> " + (client3 == client4));

		client3.send();  // #7-1
		client4.send();  // #7-3

		ctx.close();  // #8-1
	}
}
```



실행결과

```
client1 >>> spring.Client@1372ed45  ⇐ 싱글톤 범위는 동일한 빈이 반환
client2 >>> spring.Client@1372ed45
client1 == client2 >>> true

client3 >>> spring.Client2@6a79c292  ⇐ 프로토타입 범위는 매번 다른 빈이 반환
client4 >>> spring.Client2@37574691
client3 == client4 >>> false
```



### 프로타입 범위를 갖는 빈은 완전한 라이프사이클을 따르지 않는다.

```
4월 13, 2020 1:47:06 오후 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Mon Apr 13 13:47:06 KST 2020]; root of context hierarchy
Client.afterPropertiesSet() 실행
client1 >>> spring.Client@1372ed45
client2 >>> spring.Client@1372ed45
client1 == client2 >>> true
Client send to MyHost
Client send to MyHost
Client2.connect() 실행
Client2.connect() 실행
client3 >>> spring.Client2@6a79c292
client4 >>> spring.Client2@37574691
client3 == client4 >>> false
Client2 send to MyHost2
Client2 send to MyHost2
4월 13, 2020 1:47:07 오후 org.springframework.context.support.AbstractApplicationContext doClose
정보: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Mon Apr 13 13:47:06 KST 2020]; root of context hierarchy
Client.destory() 실행
```



## AOP(Aspect Oriented Programming: 관점 지향 프로그래밍)

공통된 기능들을 외부로 뽑아내서 프로그램의 구조를 단순하게 만들고자 하는 것이다.



공통 관심사를 구현(반영)한 코드가 다수 발견

예) (데이터베이스) 연결 및 해제, 로그 생성, 캐싱, 파일 열기 및 닫기, … 



```
회원정보목록을조회해서반환() {
    데이터베이스연결
    트랜잭션을설정
    회원정보를조회
    트랜잭션을해제
    데이터베이스연결을해제
}

회원상세정보를조회해서반환(회원ID) {
    데이터베이스연결
    트랜잭션을설정
    회원ID와일치하는회원상세정보를조회
    트랜잭션을해제
    데이터베이스연결을해제
}

회원정보를수정(회원정보) {
    데이터베이스연결
    트랜잭션을설정
    회원정보를수정
    트랜잭션을해제
    데이터베이스연결을해제
}
```



공통 관심사 코드와 비즈니스 코드를 분리



```
사전작업() {
	데이터베이스연결
	트랜잭션을설정
}

사후작업() {
	트랜잭션을해제
	데이터베이스연결을해제
}

회원정보목록을조회해서반환() {
	회원정보를조회
}

회원상세정보를조회해서반환(회원ID) {
	회원ID와일치하는회원상세정보를조회
}

회원정보를수정(회원정보) {
	회원정보를수정
}
```



### AOP를 적용하는 방법

컴파일시 적용 ⇒ 비즈니스.java → javac → (비즈니스+공통관심).class

실행시 적용 ⇒ 비즈니스.java → javac → 비즈니스.class → java → (비즈니스+공통관심)

Proxy 패턴을 통한 적용 ⇒ (비즈니스+공통관심).java → 



스프링 프레임워크의 AOP 기능은 spring-aop 모듈을 통해서 제공

spring-context 모듈을 의존 대상으로 추가하면 spring-aop 모듈도 함께 의존 대상에 포함됨



aspectjweaver 모듈은 AOP를 설정하는데 필요한 애노테이션을 제공



```xml
  <dependencies>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-context</artifactId>
      <version>5.0.2.RELEASE</version>
    </dependency>
    <!-- https://mvnrepository.com/artifact/org.aspectj/aspectjweaver -->
	<dependency>
	    <groupId>org.aspectj</groupId>
	    <artifactId>aspectjweaver</artifactId>
	    <version>1.8.13</version>
	</dependency>
  </dependencies>
```



### factorial 기능을 구현

인터페이스를 정의

/ex03/src/main/java/spring/Calculator.java

```java
package spring;

public interface Calculator {
	public long factorial(long num);
}
```



factorial 기능을 for-loop를 이용해서 구현

/ex03/src/main/java/spring/ImplCalculator.java

```java
package spring;

public class ImplCalculator implements Calculator {

	// 6! = 1 * 2 * 3 * 4 * 5 * 6
	// n! = 1 * 2 * ... * (n-1) * n
	@Override
	public long factorial(long num) {
		long result = 1;
		for (long n = 1; n <= num; n ++) {
			result = result * n;
		}
		return result;
	}	
}
```



factorial 기능을 재귀호출을 이용해서 구현

/ex03/src/main/java/spring/RecuCalculator.java

```java
package spring;

public class RecuCalculator implements Calculator {

	// 6! = 1 * 2 * 3 * 4 * 5 * 6
	// 6! = 6 * 5 * 4 * 3 * 2 * 1
	/* 6! = 6 * 5!
	 * 6! = 6 * 5 * 4!
	 * 6! = 6 * 5 * 4 * 3!
	 * 
	 * f(6) = 6 * f(5)
	 *      = 6 * 5 * f(4)
	 *      = 6 * 5 * 4 * f(3)
	 *      
	 * f(n) = n * f(n-1)   (단, n >= 1) 
	 * 
	 * 재귀문 = 재귀함수 = 재귀호출 = 자기가 자기를 호출하는 구조를 가진 메서드(함수)
     * 재귀문을 구현할 때는 반드시 귀납조건(base case)을 구현해야 함
	 * 귀납조건 = 재귀문을 빠져나가는 조건
	 */
	@Override
	public long factorial(long num) {
		if (num < 1) {
			return 1;
		} else {
			return num * factorial(num - 1);
		}
	}
}
```



### factorial 기능을 실행하는 클래스를 생성

/ex03/src/main/java/main/MainForFactorial.java

```java
package main;

import spring.ImplCalculator;
import spring.RecuCalculator;

public class MainForFactorial {

	public static void main(String[] args) {
		// for-loop 방식으로 구현한 factorial 메소드를 호출
		ImplCalculator implCal = new ImplCalculator();
		long f1 = implCal.factorial(10);
		System.out.printf("10! = %d\n", f1);
		
		// 재귀호출 방식으로 구현한 factorial 메소드를 호출
		RecuCalculator recuCal = new RecuCalculator();
		long f2 = recuCal.factorial(10);
		System.out.printf("10! = %d\n", f2);
	}
}
```



```
10! = 3628800
10! = 3628800
```



### factorial 계산에 소요되는 시간을 계산

시작 시간과 끝 시간의 차이를 계산하는 방식

/ex03/src/main/java/spring/ImplCalculator.java

```java
package spring;

public class ImplCalculator implements Calculator {

	@Override
	public long factorial(long num) {
		long start = System.currentTimeMillis(); // 메서드의 시작 시간
		
		long result = 1;
		for (long n = 1; n <= num; n ++) {
			result = result * n;
		}
		
		long end = System.currentTimeMillis(); // 모든 계산이 끝났을 때 시간
		System.out.printf("factorial(%d) 실행 시간 = %d\n", num, (end-start));
		
		return result;
	}	
}
```



```
factorial(10) 실행 시간 = 0
10! = 3628800
10! = 3628800
```



---



StopWatch 라이브러리를 이용해서 경과 시간을 계산하는 방식

```java
package spring;

import org.springframework.util.StopWatch;

public class ImplCalculator implements Calculator {

	@Override
	public long factorial(long num) {
		StopWatch sw = new StopWatch("ImplCalculator.factorial()");
		sw.start();

		long result = 1;
		for (long n = 1; n <= num; n++) {
			result = result * n;
		}

		sw.stop();
		System.out.println(sw.prettyPrint());

		return result;
	}
}
```



```
StopWatch 'ImplCalculator.factorial()': running time (millis) = 0
-----------------------------------------
ms     %     Task name
-----------------------------------------
00000  �  

10! = 3628800
10! = 3628800
```



---



재귀호출 방식으로 구현한 factorial 메서드의 실행 시간은 어떻게 계산해야 할까?

⇒ 메서드 구현부에서 실행 시간을 계산하는 것이 한계가 있음

⇒ 메서드를 호출하는 곳에서 호출 바로 직전과 반환하는 바로 직전의 시간 차이를 계산



/ex03/src/main/java/spring/ImplCalculator.java

```java
package spring;

public class ImplCalculator implements Calculator {

	@Override
	public long factorial(long num) {
		long result = 1;
		for (long n = 1; n <= num; n ++) {
			result = result * n;
		}
		return result;
	}
}
```



/ex03/src/main/java/main/MainForFactorial.java

```java
package main;

import org.springframework.util.StopWatch;

import spring.ImplCalculator;
import spring.RecuCalculator;

public class MainForFactorial {

	public static void main(String[] args) {
		// for-loop 방식으로 구현한 factorial 메소드를 호출
		ImplCalculator implCal = new ImplCalculator();
		StopWatch sw1 = new StopWatch("ImplCalculator.factorial(20)");
		sw1.start();
		long f1 = implCal.factorial(20);
		sw1.stop();
		System.out.printf("20! = %d\n", f1);
		
		// 재귀호출 방식으로 구현한 factorial 메소드를 호출
		RecuCalculator recuCal = new RecuCalculator();
		StopWatch sw2 = new StopWatch("RecuCalculator.factorial(20)");
		sw2.start();
		long f2 = recuCal.factorial(20);
		sw2.stop();
		System.out.printf("20! = %d\n", f2);
		
		System.out.println(sw1.prettyPrint());
		System.out.println(sw2.prettyPrint());
	}
}
```



```
20! = 2432902008176640000
20! = 2432902008176640000
StopWatch 'ImplCalculator.factorial(20)': running time (millis) = 0
-----------------------------------------
ms     %     Task name
-----------------------------------------
00000  �  

StopWatch 'RecuCalculator.factorial(20)': running time (millis) = 0
-----------------------------------------
ms     %     Task name
-----------------------------------------
00000  �  
```



---



```java
package main;

import spring.ImplCalculator;
import spring.RecuCalculator;

public class MainForFactorial {

	public static void main(String[] args) {
		// for-loop 방식으로 구현한 factorial 메소드를 호출
		ImplCalculator implCal = new ImplCalculator();
		long start = System.currentTimeMillis();
		long f1 = implCal.factorial(20);
		long end = System.currentTimeMillis();
		System.out.printf("20! = %d\n", f1);
		System.out.printf("ImplCalculator.factorial(20) 실행 시간 : %d\n", (end - start));
		
		// 재귀호출 방식으로 구현한 factorial 메소드를 호출
		RecuCalculator recuCal = new RecuCalculator();
		start = System.currentTimeMillis();
		long f2 = recuCal.factorial(20);
		end = System.currentTimeMillis();
		System.out.printf("20! = %d\n", f2);
		System.out.printf("RecuCalculator.factorial(20) 실행 시간 : %d\n", (end - start));	
	}
}
```



```
20! = 2432902008176640000
ImplCalculator.factorial(20) 실행 시간 : 0
20! = 2432902008176640000
RecuCalculator.factorial(20) 실행 시간 : 0
```



실행 시간을 계산하는 방식 또는 출력 방식이 변경되면 중복된 모든 코드를 수정해야 함

정확한 시간 산정이 되지 않고 있음



시작 시간 설정 → 계산 영역을 호출 → [ 계산 영역 ] → 계산 결과를 반환 받음 → 시간을 종료



### 프록시 객체를 이용해서 실행 시간을 산정



/ex03/src/main/java/spring/ExeTimeCalculator.java

```java
package spring;

public class ExeTimeCalculator implements Calculator {
	
	private Calculator delegate;
	
	public ExeTimeCalculator(Calculator delegate) {
		this.delegate = delegate;
	}

	@Override
	public long factorial(long num) {
		// 공통 관심사를 구현한 코드를 적용할 수 있다.
		long start = System.currentTimeMillis();	// 공통관심사 코드 
		
		long result = delegate.factorial(num);		// 비즈니스 로직
		
		long end = System.currentTimeMillis();		// 공통관심사 코드 
		
		System.out.printf("실행 시간 %d\n", (end - start));	// 공통관심사 코드
		
		return result;
	}
}
```



/ex03/src/main/java/main/MainForProxy.java

```java
package main;

import spring.ExeTimeCalculator;
import spring.ImplCalculator;
import spring.RecuCalculator;

public class MainForProxy {

	public static void main(String[] args) {
		ExeTimeCalculator cal1 = new ExeTimeCalculator(new ImplCalculator());
		cal1.factorial(10);
		
		ExeTimeCalculator cal2 = new ExeTimeCalculator(new RecuCalculator());
		cal2.factorial(10);
	}
}
```



어떤 메서드의 실행을 위임받아서 대신 실행해주는 것을 프록시 패턴이라고 한다.

실행 시점에 실제 구현체가 무엇인지 알려주는 방식



```
실행 시간 0
실행 시간 0
```



인터페이스 단일화 가능

공통 관심사 코드를 쉽게 적용하고 변경할 수 있는 장점이 있다.

실행 시간을 정확하게 측정하기 위해서 측정 단위를 밀리 세컨드에서 나노 세컨드로 변경

⇒ System.currentTimeMillis() → System.nanoTime()



```java
package spring;

public class ExeTimeCalculator implements Calculator {
	
	private Calculator delegate;
	
	public ExeTimeCalculator(Calculator delegate) {
		this.delegate = delegate;
	}

	@Override
	public long factorial(long num) {
		// 공통 관심사를 구현한 코드를 적용할 수 있다.
		long start = System.nanoTime();			// 공통관심사 코드 
		
		long result = delegate.factorial(num);	// 비즈니스 로직
		
		long end = System.nanoTime();			// 공통관심사 코드 
		
		System.out.printf("실행 시간 %d\n", (end - start));	// 공통관심사 코드
		
		return result;
	}
}
```



```
실행 시간 12700
실행 시간 19700
```



### AOP 주요 용어

https://docs.spring.io/spring/docs/2.0.x/reference/aop.html



* Advice
  * 언제 공통 관심 기능을 핵심 로직(비즈니스 로직)에 적용할 지를 정의
  * 예) 메서드를 호출하기 전(언제)에 트랜잭션 시작(핵심 로직) 기능을 적용하라



* Joinpoint
  * Advice를 적용 가능한 지점을 의미
  * 메서드 호출, 필드 값 등이 해당
  * 스프링은 프록시를 이용한 AOP를 지원하므로 메서드 호출에 대한 Joinpoint만 지원



* Pointcut
  * Joinpoint의 부분집합으로 실제 Advice가 적용되는 Joinpoint를 나타냄
  * 스프링은 정규표현식 또는 AspectJ 문법을 이용해서 정의



* Weaving
  * Advice를 핵심 로직 코드에 적용하는 것



* Aspect
  * 여러 객체에 공통으로 적용되는 기능



### 스프링에서 구현 가능한 Advice의 종류

https://docs.spring.io/spring/docs/2.0.x/reference/aop.html



* Before Advice
  * 대상 객체의 메서드 호출 전에 공통 기능을 실행
* After Returning Advice
  * 대상 객체의 메서드가 예외 없이 실행된 이후에 공통 기능을 실행
* After Throwing Advice
  * 대상 객체의 메서드를 실행하는 도중 예외가 발생하면 공통 기능을 실행
* After Advice
  * 예외 발생 여부와 상관없이 대상 객체의 메서드 실행 후 공통 기능을 실행
* Around Advice
  * 대상 객체의 메서드 실행 전, 후 또는 예외 발생 시점에 공통 기능을 실행
  * 다양한 시점에 원하는 기능을 삽입할 수 있어서 널리 사용





## 스프링 AOP 구현

1. Aspect로 사용할 클래스에 @Aspect 애노테이션을 추가
2. @Pointcut 애노테이션으로 공통 기능을 적용할 Pointcut을 정의
3. 공통 기능을 구현할 메서드에 @Around 애노테이션을 적용



### 공통 관심사를 구현

aspect 패키지 생성

/ex03/src/main/java/aspect/ExeTimeAspect.java

```java
package aspect;

import java.util.Arrays;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;

// @Advice와 @Pointcut을 함께 제공해야 함
@Aspect
public class ExeTimeAspect {

	// 공통 기능을 적용할 대상을 설정
	// spring 패키지와 그 하위 패키지에 위치한 public 메서드를 Pointcut으로 설정
	//  * : 모든 값을 표현
	// .. : 0개 이상
	@Pointcut("execution(public * spring..*(..))")
	private void publicTarget() {

	}

	// Around Advice를 설정
	// publicTarget() => 메서드에 정의한 Pointcut에 공통 기능을 적용
	// measure() 메서드의 ProceedingJoinPoint 타입 파라미터 => 프록시 대상 객체의 메서드를 호출할 때 사용
	// proceed() => 실제 대상 객체의 메서드를 호출
	// getSignature(), getTarget(), getArgs() => 호출한 메서드의 시그니처, 대상 객체, 파라미터 목록을 제공하는 메서드
	@Around("publicTarget()")
	public Object measure(ProceedingJoinPoint joinPoint) throws Throwable {
		long start = System.nanoTime();		
		try {
			Object result = joinPoint.proceed();
			return result;
		} finally {
			long finish = System.nanoTime();
			Signature sig = joinPoint.getSignature();
			System.out.printf("%s.%s(%s) 실행 시간: %d ns\n", 
				joinPoint.getTarget().getClass().getSimpleName(), 
				sig.getName(), 
				Arrays.deepToString(joinPoint.getArgs()), 
				(finish - start)
			);			
		}		
	}
}
```



### 스프링 설정 클래스를 작성

/ex03/src/main/java/config/AppConf5.java

```java
package config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

import aspect.ExeTimeAspect;
import spring.Calculator;
import spring.RecuCalculator;

@Configuration

// @Aspect 애노테이션이 붙은 클래스를 공통 기능으로 적용
// @Aspect 애노테이션이 붙은 빈 객체를 찾아서 빈 객체의 @Pointcut 설정과 @Around 설정을 사용
@EnableAspectJAutoProxy
public class AppConf5 {

	@Bean
	public ExeTimeAspect exeTimeAspect() {
		return new ExeTimeAspect();
	}
	
	@Bean
	public Calculator calculator() {
		return new RecuCalculator();
	}
}
```



### 스프링 컨테이너 생성

/ex03/src/main/java/main/MainForAspect.java

```java
package main;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import config.AppConf5;
import spring.Calculator;

public class MainForAspect {
	public static void main(String[] args) {
		AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(AppConf5.class);
		
		Calculator cal = ctx.getBean("calculator", Calculator.class);
		long fatorial10 = cal.factorial(10);
		System.out.println(fatorial10);
		
		ctx.close();
	}
}
```



```
4월 14, 2020 9:12:14 오전 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Tue Apr 14 09:12:14 KST 2020]; root of context hierarchy
RecuCalculator.factorial([10]) 실행 시간: 129000 ns
3628800
4월 14, 2020 9:12:16 오전 org.springframework.context.support.AbstractApplicationContext doClose
정보: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Tue Apr 14 09:12:14 KST 2020]; root of context hierarchy
```



#### for-loop 방식으로 팩토리얼을 계산했을 때 걸리는 시간을 출력

설정 클래스에 빈을 추가

/ex03/src/main/java/config/AppConf5.java

```java
@Configuration
@EnableAspectJAutoProxy
public class AppConf5 {

	@Bean
	public ExeTimeAspect exeTimeAspect() {
		return new ExeTimeAspect();
	}
	
	@Bean
	public Calculator calculator() {
		return new RecuCalculator();
	}
	
	@Bean
	public Calculator implCalculator() {
		return new ImplCalculator();
	}
}
```



빈을 가져와서 실행 ⇒ 실행 시간 계산은 AOP 설정을 통해서 추가되므로 관련한 작업은 필요 없음

/ex03/src/main/java/main/MainForAspect.java

```java
public class MainForAspect {
	public static void main(String[] args) {
		AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(AppConf5.class);
		
		System.out.println("재귀호출 방식으로 팩토리얼을 계산했을 때 걸리는 시간");
		Calculator cal = ctx.getBean("calculator", Calculator.class);
		long fatorial10 = cal.factorial(10);
		System.out.println(fatorial10);
		
		System.out.println("for-loop 방식으로 팩토리얼을 계산했을 때 걸리는 시간");
		Calculator cal2 = ctx.getBean("implCalculator", Calculator.class);
		long fac2 = cal2.factorial(10);
		System.out.println(fac2);
		
		ctx.close();
	}
}
```



```
4월 14, 2020 9:59:38 오전 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Tue Apr 14 09:59:38 KST 2020]; root of context hierarchy
재귀호출 방식으로 팩토리얼을 계산했을 때 걸리는 시간
RecuCalculator.factorial([10]) 실행 시간: 80000 ns
3628800
for-loop 방식으로 팩토리얼을 계산했을 때 걸리는 시간
ImplCalculator.factorial([10]) 실행 시간: 20800 ns
3628800
4월 14, 2020 9:59:40 오전 org.springframework.context.support.AbstractApplicationContext doClose
정보: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Tue Apr 14 09:59:38 KST 2020]; root of context hierarchy
```



---



```java
public class MainForAspect {
	public static void main(String[] args) {
		AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(AppConf5.class);
		
		System.out.println("재귀호출 방식으로 팩토리얼을 계산했을 때 걸리는 시간");
		Calculator cal = ctx.getBean("calculator", Calculator.class);
		long fatorial10 = cal.factorial(10);
		System.out.println(fatorial10);
		
		// AOP 적용 전 : spring.RecuCalculator
		// AOP 적용 후 : com.sun.proxy.$Proxy17 <= 스프링이 생성한 프록시 타입
		System.out.println(cal.getClass().getName());
		
		ctx.close();
	}
}
```



```
재귀호출 방식으로 팩토리얼을 계산했을 때 걸리는 시간
RecuCalculator.factorial([10]) 실행 시간: 72400 ns
3628800
com.sun.proxy.$Proxy17
```



AppConf5.java 파일에서 @EnableAspectJAutoProxy 주석처리 후 실행

```
재귀호출 방식으로 팩토리얼을 계산했을 때 걸리는 시간
3628800
spring.RecuCalculator
```



## 프록시 생성 방식

### 빈 객체가 인터페이스를 상속하면 인터페이스를 이용해서 프록시를 생성

```java
public class MainForAspect {
	public static void main(String[] args) {
		AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(AppConf5.class);
		
		Calculator cal = ctx.getBean("calculator", RecuCalculator.class);
		long fatorial10 = cal.factorial(10);
		System.out.println(fatorial10);
		System.out.println(cal.getClass().getName()); 	
		
		ctx.close();
	}
}
```



```
4월 14, 2020 10:12:02 오전 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Tue Apr 14 10:12:02 KST 2020]; root of context hierarchy
Exception in thread "main" org.springframework.beans.factory.BeanNotOfRequiredTypeException: Bean named 'calculator' is expected to be of type 'spring.RecuCalculator' but was actually of type 'com.sun.proxy.$Proxy17'
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:384)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:205)
	at org.springframework.context.support.AbstractApplicationContext.getBean(AbstractApplicationContext.java:1091)
	at main.MainForAspect.main(MainForAspect.java:13)
```



인터페이스 구현체를 이용하면 오류 발생



```
                      <<interface>>
           +-------->   Calculator   <---------+
           |                                   |
           |                                   |
     RecuCalculator                         $Proxy17   
```



### 빈 객체가 인터페이스를 상속하더라도 클래스를 상속받아 프록시를 생성하도록 설정

```
                      <<interface>>
           +-------->   Calculator             
           |                                   
     RecuCalculator     
           ^
           |
       $Proxy17
```



/ex03/src/main/java/config/AppConf5.java

```java
@Configuration
// 인터페이스가 아닌 자바 클래스를 상속받아 프록시를 생성
@EnableAspectJAutoProxy(proxyTargetClass = true)
public class AppConf5 {
		:
}
```



```
4월 14, 2020 10:21:49 오전 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Tue Apr 14 10:21:49 KST 2020]; root of context hierarchy
RecuCalculator.factorial([10]) 실행 시간: 57236500 ns
3628800
spring.RecuCalculator$$EnhancerBySpringCGLIB$$2c5d997a
4월 14, 2020 10:21:51 오전 org.springframework.context.support.AbstractApplicationContext doClose
정보: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@5387f9e0: startup date [Tue Apr 14 10:21:49 KST 2020]; root of context hierarchy
```



## execution 명시자의 표현식

execution 명시자 ⇒ Advice를 적용할 메서드를 지정 = Pointcut 설정



https://docs.spring.io/spring/docs/2.0.x/reference/aop.html

⇒ 6.2.3.4. Examples



```
execution(modifiers-pattern? ret-type-pattern declaring-type-pattern? name-pattern(param-pattern)
          throws-pattern?)
```



\* : 모든 값을 표현

.. : 0개 이상



```
execution(public void set*(..)) 
```

리턴 타입이 void이고 메서드 이름이 set으로 시작하고 파라미터가 0개 이상인 메서드



```
execution(* read*(Integer, ..))
```

메서드 이름이 read로 시작하고, 첫번째 파라미터 타입이 Integer이며, 한 개 이상의 파라미터를 가지는 메서드



```
execution(* exam.*.*())
```

exam 패키지 타입에 속한 파라미터가 없는 모든 메서드



```
execution(* exam..*.*(..))
```

exam 패키지 및 하위 패키지에 있는, 파라미터가 0개 이상인 메서드



```
execution(Long Calculator.factorial())
```

리턴 타입이 Long인 Calculator 타입의 factorial() 메서드



## Advice 적용 순서

### 하나의 Pointcut에 여러 Advice가 적용된 경우

캐시 기능을 추가 ⇒

factorial 계산을 요청하면 캐시에 존재하는 값은 계산하고 않고 캐시를 읽어서 반환

캐시에 존재하지 않으면 계산하고 캐시에 저장 후 반환

→ 불필요한(중복된) 연산을 줄이고 성능 향상을 가져올 수 있다.



/ex03/src/main/java/aspect/CacheAspect.java

```java
package aspect;

import java.util.HashMap;
import java.util.Map;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;

@Aspect
public class CacheAspect {

	// 인수와 연산값을 담고 있는 해쉬 맵
	private Map<Long, Object> cache = new HashMap<Long, Object>();
	
	// cal.factorial(10);
	@Pointcut("execution(public * spring..factorial(long))")
	public void cacheTarget() {
		
	}
	
	@Around("cacheTarget()")
	public Object execute(ProceedingJoinPoint joinPoint) throws Throwable {
		Long num = (Long) joinPoint.getArgs()[0];
		if (cache.containsKey(num)) {
			System.out.println("캐시에서 가져옴 >>> " + num);
			return cache.get(num);
		}
		
		Object result = joinPoint.proceed();
		cache.put(num, result);
		System.out.println("캐시에 넣음 >>> " + num);
		return result;
	}
}
```



/ex03/src/main/java/config/AppConfWithCache.java

```java
package config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

import aspect.CacheAspect;
import spring.Calculator;
import spring.RecuCalculator;

@Configuration
@EnableAspectJAutoProxy
public class AppConfWithCache {
	
	@Bean 
	public CacheAspect cacheAspect() {
		return new CacheAspect();
	}
	
	@Bean
	public Calculator calculator() {
		return new RecuCalculator();
	}
}
```



/ex03/src/main/java/main/MainForAspectWithCache.java

```java
package main;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import config.AppConfWithCache;
import spring.Calculator;

public class MainForAspectWithCache {

	public static void main(String[] args) {
		
		AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfWithCache.class);
		
		Calculator cal = ctx.getBean("calculator", Calculator.class);
		cal.factorial(7);
		cal.factorial(5);
		cal.factorial(7);
		cal.factorial(6);
		cal.factorial(7);
		cal.factorial(5);
		
		ctx.close();
	}
}
```



[실행결과]

```
캐시에 넣음 >>> 7
캐시에 넣음 >>> 5
캐시에서 가져옴 >>> 7
캐시에 넣음 >>> 6
캐시에서 가져옴 >>> 7
캐시에서 가져옴 >>> 5
```

⇒ 캐시 사용 여부를 확인



---



[기능추가]

factorial() 계산에 걸리는 시간을 함께 출력하도록 수정

⇒ ExeTimeAspect 활용



/ex03/src/main/java/config/AppConfWithCache.java

```java
@Configuration
@EnableAspectJAutoProxy
public class AppConfWithCache {
	
	@Bean 
	public CacheAspect cacheAspect() {
		return new CacheAspect();
	}
	
	@Bean
	public ExeTimeAspect exeTimeAspect() {
		return new ExeTimeAspect();
	}
	
	@Bean
	public Calculator calculator() {
		return new RecuCalculator();
	}
}
```



[실행결과]

```
RecuCalculator.factorial([7]) 실행 시간: 66200 ns
캐시에 넣음 >>> 7
RecuCalculator.factorial([5]) 실행 시간: 22500 ns
캐시에 넣음 >>> 5
캐시에서 가져옴 >>> 7
RecuCalculator.factorial([6]) 실행 시간: 30400 ns
캐시에 넣음 >>> 6
캐시에서 가져옴 >>> 7
캐시에서 가져옴 >>> 5
```

⇒ Advice 적용 순서가 CacheAspect → ExeTimeAspect → 실제대상(Calculator)

⇒ **우연하게도** 설정 클래스에 정의한 빈 순서와 동일 (스프링 프레임워크와 Java 버전에 따라 상이)

⇒ 보장받을 수 없다.



---



```java
@Configuration
@EnableAspectJAutoProxy
public class AppConfWithCache {
	
	@Bean
	public ExeTimeAspect exeTimeAspect() {
		return new ExeTimeAspect();
	}
	
	@Bean 
	public CacheAspect cacheAspect() {
		return new CacheAspect();
	}
	
	@Bean
	public Calculator calculator() {
		return new RecuCalculator();
	}
}
```



```
캐시에 넣음 >>> 7
RecuCalculator.factorial([7]) 실행 시간: 341000 ns
캐시에 넣음 >>> 5
RecuCalculator.factorial([5]) 실행 시간: 85700 ns
캐시에서 가져옴 >>> 7
RecuCalculator.factorial([7]) 실행 시간: 70800 ns
캐시에 넣음 >>> 6
RecuCalculator.factorial([6]) 실행 시간: 68200 ns
캐시에서 가져옴 >>> 7
RecuCalculator.factorial([7]) 실행 시간: 62400 ns
캐시에서 가져옴 >>> 5
RecuCalculator.factorial([5]) 실행 시간: 65800 ns
```

→ 현재 환경에서는 빈 순서를 바꾸면 Advice의 적용 순서도 바뀌는 것을 확인



### Advice 적용 순서를 직접 지정

/ex03/src/main/java/config/AppConfWithCache.java

```java
@Configuration
@EnableAspectJAutoProxy
public class AppConfWithCache {
	
	@Bean 
	public CacheAspect cacheAspect() {
		return new CacheAspect();
	}
	
	@Bean
	public ExeTimeAspect exeTimeAspect() {
		return new ExeTimeAspect();
	}
	
	@Bean
	public Calculator calculator() {
		return new RecuCalculator();
	}
}
```



/ex03/src/main/java/aspect/ExeTimeAspect.java

```java
@Aspect
@Order(1)
public class ExeTimeAspect {
    		:
}
```



/ex03/src/main/java/aspect/CacheAspect.java

```java
@Aspect
@Order(2)
public class CacheAspect {
    		:
}
```



```
캐시에 넣음 >>> 7
RecuCalculator.factorial([7]) 실행 시간: 386500 ns
캐시에 넣음 >>> 5
RecuCalculator.factorial([5]) 실행 시간: 126300 ns
캐시에서 가져옴 >>> 7
RecuCalculator.factorial([7]) 실행 시간: 238900 ns
캐시에 넣음 >>> 6
RecuCalculator.factorial([6]) 실행 시간: 150600 ns
캐시에서 가져옴 >>> 7
RecuCalculator.factorial([7]) 실행 시간: 122800 ns
캐시에서 가져옴 >>> 5
RecuCalculator.factorial([5]) 실행 시간: 121600 ns
```



## Pointcut 설정 및 재사용

```java
@Aspect
@Order(2)
public class CacheAspect {

	private Map<Long, Object> cache = new HashMap<Long, Object>();
	
	@Pointcut("execution(public * spring..factorial(long))")
	public void cacheTarget() {
		
	}
	
	@Around("cacheTarget()")
	public Object execute(ProceedingJoinPoint joinPoint) throws Throwable {
        			:
```



### @Around 애노테이션에 직접 execution 명시자를 지정도 가능

```java
@Aspect
@Order(2)
public class CacheAspect {

	private Map<Long, Object> cache = new HashMap<Long, Object>();

	@Around("execution(public * spring..factorial(long))")
	public Object execute(ProceedingJoinPoint joinPoint) throws Throwable {
        				:
```



### Pointcut 재활용

```java
@Aspect
@Order(1)
public class ExeTimeAspect {

	@Pointcut("execution(public * spring..*(..))")
	public void publicTarget() {

	}

	@Around("publicTarget()")
	public Object calFactorialTime(ProceedingJoinPoint joinPoint) throws Throwable {
        				:
```



```java
@Aspect
@Order(2)
public class CacheAspect {

	private Map<Long, Object> cache = new HashMap<Long, Object>();
	
	@Around("aspect.ExeTimeAspect.publicTarget()")
	public Object execute(ProceedingJoinPoint joinPoint) throws Throwable {
        				:
```



### 여러 Aspect에서 공통으로 사용하는 Pointcut이 있는 경우

@Pointcut을 설정한 CommonPointcut은 빈으로 등록할 필요가 없음

/ex03/src/main/java/aspect/CommonPointcut.java

```java
package aspect;

import org.aspectj.lang.annotation.Pointcut;

public class CommonPointcut {
	@Pointcut("execution(public * spring..*(..))")
    public void commonTarget() {
    }
}
```



/ex03/src/main/java/aspect/ExeTimeAspect.java

```java
@Aspect
@Order(1)
public class ExeTimeAspect {

	@Around("CommonPointcut.commonTarget()")
	public Object execute(ProceedingJoinPoint joinPoint) throws Throwable {
            :
    }
}
```



/ex03/src/main/java/aspect/CacheAspect.java

```java
@Aspect
@Order(2)
public class CacheAspect {

	private Map<Long, Object> cache = new HashMap<Long, Object>();
	
	@Around("CommonPointcut.commonTarget()")
	public Object execute(ProceedingJoinPoint joinPoint) throws Throwable {
            :
    }
}
```



http://www.yes24.com/Product/Goods/62268795?scode=032&OzSrank=1

http://www.yes24.com/Product/Goods/70893395?scode=032&OzSrank=1

