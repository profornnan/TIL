# Spring

객체를 만들고 제공해주는 것을 Container라고 한다.

필요한 객체를 만들고 주입하는 역할. IoC Container. 의존성 역전

Assembler를 통해 우리가 필요로 하는 객체 3가지에 한정해서 만들고 주입하고 제공하는 것을 했다.

Spring은 범용 컨테이너이다. 객체를 만들고 의존성을 주입하고 필요한 곳에 제공해주는 역할

범용 컨테이너 => 설정 정보가 필요하다. 어떤 객체가 우리가 관리해야 하는 객체이고, 객체와 객체 사이에 어떤 관계가 있는지 정리해야 한다. 설정 파일을 기반으로 해서 Assembler와 같은 역할을 하는 것이 Spring Container이다.



스프링 ⇒ 필요한 객체를 생성하고 생성한 객체에 의존을 주입하고 생성한 객체를 제공하는 **범용 조립기**



### 스프링 설정 클래스를 작성

스프링이 어떤 객체를 생성하고, 의존을 어떻게 주입할지 정의해 놓은 파일



/ex03/src/main/java/config/AppCtx.java

```java
package config;

// Ctrl + Shift + O
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import spring.ChangePasswordService;
import spring.MemberDao;
import spring.MemberRegisterService;

// 스프링 설정 클래스를 의미
@Configuration
public class AppCtx {
	
	// 메서드가 반환하는 객체가 스프링 빈 객체인 것을 나타내는 어노테이션
	// 스프링 빈 = 스프링이 관리(생성, 제공, 소멸, ...)하는 객체
	// 빈 이름 => 메서드의 이름
	// 빈 타입 => 메서드 반환 타입
	@Bean
	public MemberDao memberDao() {
		return new MemberDao();
	}
	
	@Bean
	public MemberRegisterService memberRegisterService() {
		return new MemberRegisterService(memberDao());
	}
	
	@Bean
	public ChangePasswordService changePasswordService() {
		ChangePasswordService cps = new ChangePasswordService();
		cps.setMemberDao(memberDao());
		return cps;
	}
}
```



### 스프링 컨테이너를 생성

/ex03/src/main/java/main/MainForSpring.java

```java
package main;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import config.AppCtx;
import spring.ChangePasswordService;
import spring.DuplicateMemberException;
import spring.MemberNotFoundException;
import spring.MemberRegisterService;
import spring.RegisterRequest;
import spring.WrongIdPasswordException;

public class MainForSpring {
	
	private static ApplicationContext ctx = null;
	
	public static void main(String[] args) throws IOException {
		// 스프링 컨테이너를 생성
		ctx = new AnnotationConfigApplicationContext(AppCtx.class);
		
		// 화면 입력을 받아서 명령어에 따라 처리를 분기
		BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
		while(true) {  // 무한 루프
			System.out.println("명령어를 입력하세요.");
			String command = reader.readLine();
			if (command.equalsIgnoreCase("exit")) {
				System.out.println("프로그램을 종료합니다.");
				break;
			}
			
			// new 이메일 이름 패스워드 패스워드확인
			if (command.startsWith("new ")) {
				doMemberRegister(command.split(" "));
				continue;
			}
			// change 이메일 현재패스워드 새패스워드
			else if (command.startsWith("change ")) {
				doChangePassword(command.split(" "));
				continue;
			}
			else {
				System.out.println("정의되지 않은 명령입니다.");
				printHelp();
			}
		}
	}
	
	private static void doMemberRegister(String[] args) {
		if(args.length != 5) {
			printHelp();
			return;
		}
		
		MemberRegisterService regSvr = ctx.getBean("memberRegisterService", MemberRegisterService.class);
		
		RegisterRequest req = new RegisterRequest();
		req.setEmail(args[1]);
		req.setName(args[2]);
		req.setPassword(args[3]);
		req.setConfirmPassword(args[4]);
		
		if (!req.isPasswordEqualToConfirmPassword()) {
			System.out.println("패스워드와 패스워드 확인이 일치하지 않습니다.");
			return;
		}
		try {
			regSvr.regist(req);		
		} catch (DuplicateMemberException e) {
			System.out.println("이미 존재하는 이메일입니다.");
		}
	}
	
	private static void doChangePassword(String[] args) {
		if(args.length != 4) {
			printHelp();
			return;
		}
		
		ChangePasswordService chpSvr = ctx.getBean("changePasswordService", ChangePasswordService.class);
		
		try {
			chpSvr.changePassword(args[1], args[2], args[3]);
		} catch (MemberNotFoundException mnfe) {
			System.out.println("일치하는 이메일 주소가 없습니다.");
		} catch (WrongIdPasswordException wipe) {
			System.out.println("사용자 패스워드가 일치하지 않습니다.");
		}
	}
	
	private static void printHelp() {
		System.out.println("프로그램 사용법 안내");
		System.out.println("new 이메일 이름 패스워드 패스워드확인");
		System.out.println("change 이메일 현재패스워드 새패스워드");
		System.out.println();
	}
}
```



### 테스트

```
4월 10, 2020 9:51:36 오전 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@41906a77: startup date [Fri Apr 10 09:51:36 KST 2020]; root of context hierarchy
명령어를 입력하세요.
abcd
정의되지 않은 명령입니다.
프로그램 사용법 안내
new 이메일 이름 패스워드 패스워드확인
change 이메일 현재패스워드 새패스워드

명령어를 입력하세요.
new aaa aaa aaa
프로그램 사용법 안내
new 이메일 이름 패스워드 패스워드확인
change 이메일 현재패스워드 새패스워드

명령어를 입력하세요.
change aaa bbb
프로그램 사용법 안내
new 이메일 이름 패스워드 패스워드확인
change 이메일 현재패스워드 새패스워드

명령어를 입력하세요.
new abc@test.com abc pw pw2
패스워드와 패스워드 확인이 일치하지 않습니다.
명령어를 입력하세요.
new abc@test.com abc pw pw
명령어를 입력하세요.
new abc@test.com xyz pswd pswd
이미 존재하는 이메일입니다.
명령어를 입력하세요.
change xyz@test.com aaa bbb
일치하는 이메일 주소가 없습니다.
명령어를 입력하세요.
change abc@test.com xyz abc
사용자 패스워드가 일치하지 않습니다.
명령어를 입력하세요.
change abc@test.com pw pwsd
명령어를 입력하세요.
exit
프로그램을 종료합니다.
```



### 회원 목록을 출력하는 기능을 추가

/ex03/src/main/java/spring/MemberPrinter.java

```java
package spring;

// 회원 정보를 출력
public class MemberPrinter {
	
	// 파라미터로 전달된 회원 정보를 형식에 맞춰서 출력
	public void print(Member member) {
		System.out.printf(
			"회원 정보 : 아이디 = %d\t 이메일 = %s\t 이름 = %s\t 등록일 = %tF\n",
			member.getId(), member.getEmail(), member.getName(), member.getRegisterDateTime()
		);
	}
}
```



/ex03/src/main/java/spring/MemberListPrinter.java

```java
package spring;

import java.util.Collection;
// 1) 저장소에 저장된 회원 목록을 읽어와서(가져와서)	MemberDao
// 2) 하나씩 출력하는 기능을 제공					 MemberPrinter
public class MemberListPrinter {
	
	private MemberDao memberDao;
	private MemberPrinter memberPrinter;
	
	// 생성자를 이용해서 의존객체를 주입
	public MemberListPrinter(MemberDao memberDao, MemberPrinter memberPrinter) {
		this.memberDao = memberDao;
		this.memberPrinter = memberPrinter;
	}
	
	public void printAll() {
		// 1)
		Collection<Member> members = memberDao.selectAll();
		// 2)
		members.forEach(member -> memberPrinter.print(member));
	}
}
```



**스프링 설정 클래스를 수정**

/ex03/src/main/java/config/AppCtx.java

```java
package config;

// Ctrl + Shift + O
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import spring.ChangePasswordService;
import spring.MemberDao;
import spring.MemberListPrinter;
import spring.MemberPrinter;
import spring.MemberRegisterService;

// 스프링 설정 클래스를 의미
@Configuration
public class AppCtx {
	
	// 메서드가 반환하는 객체가 스프링 빈 객체인 것을 나타내는 어노테이션
	// 스프링 빈 = 스프링이 관리(생성, 제공, 소멸, ...)하는 객체
	// 빈 이름 => 메서드의 이름
	// 빈 타입 => 메서드 반환 타입
	@Bean
	public MemberDao memberDao() {
		return new MemberDao();
	}
	
	// Constructor DI
	@Bean
	public MemberRegisterService memberRegisterService() {
		return new MemberRegisterService(memberDao());
	}
	
	// Setter DI
	@Bean
	public ChangePasswordService changePasswordService() {
		ChangePasswordService cps = new ChangePasswordService();
		cps.setMemberDao(memberDao());
		return cps;
	}
	
	@Bean
	public MemberPrinter memberPrinter() {
		return new MemberPrinter();
	}
	
	@Bean
	public MemberListPrinter memberListPrinter() {
		return new MemberListPrinter(memberDao(), memberPrinter());
	}
}
```

설정 정보를 update 해야한다. MemberPrinter, MemberListPrinter를 빈으로 추가



**스프링 컨테이너를 수정** ⇒ 회원 목록 출력 기능을 추가

/ex03/src/main/java/main/MainForSpring.java

```java
package main;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import config.AppCtx;
import spring.ChangePasswordService;
import spring.DuplicateMemberException;
import spring.MemberListPrinter;
import spring.MemberNotFoundException;
import spring.MemberRegisterService;
import spring.RegisterRequest;
import spring.WrongIdPasswordException;

public class MainForSpring {
	
	private static ApplicationContext ctx = null;
	
	public static void main(String[] args) throws IOException {
		// 스프링 컨테이너를 생성
		ctx = new AnnotationConfigApplicationContext(AppCtx.class);
		
		// 화면 입력을 받아서 명령어에 따라 처리를 분기
		BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
		while(true) {  // 무한 루프
			System.out.println("명령어를 입력하세요.");
			String command = reader.readLine();
			if (command.equalsIgnoreCase("exit")) {
				System.out.println("프로그램을 종료합니다.");
				break;
			}
			
			// new 이메일 이름 패스워드 패스워드확인
			if (command.startsWith("new ")) {
				doMemberRegister(command.split(" "));
				continue;
			}
			// change 이메일 현재패스워드 새패스워드
			else if (command.startsWith("change ")) {
				doChangePassword(command.split(" "));
				continue;
			}
			// list
			else if (command.equals("list")) {
				doList();
				continue;
			}
			else {
				System.out.println("정의되지 않은 명령입니다.");
				printHelp();
			}
		}
	}
	
	private static void doList() {
		MemberListPrinter mlp = ctx.getBean("memberListPrinter", MemberListPrinter.class);
		mlp.printAll();
	}
	
	private static void doMemberRegister(String[] args) {
		if(args.length != 5) {
			printHelp();
			return;
		}
		
		MemberRegisterService regSvr = ctx.getBean("memberRegisterService", MemberRegisterService.class);
		
		RegisterRequest req = new RegisterRequest();
		req.setEmail(args[1]);
		req.setName(args[2]);
		req.setPassword(args[3]);
		req.setConfirmPassword(args[4]);
		
		if (!req.isPasswordEqualToConfirmPassword()) {
			System.out.println("패스워드와 패스워드 확인이 일치하지 않습니다.");
			return;
		}
		try {
			regSvr.regist(req);		
		} catch (DuplicateMemberException e) {
			System.out.println("이미 존재하는 이메일입니다.");
		}
	}
	
	private static void doChangePassword(String[] args) {
		if(args.length != 4) {
			printHelp();
			return;
		}
		
		ChangePasswordService chpSvr = ctx.getBean("changePasswordService", ChangePasswordService.class);
		
		try {
			chpSvr.changePassword(args[1], args[2], args[3]);
		} catch (MemberNotFoundException mnfe) {
			System.out.println("일치하는 이메일 주소가 없습니다.");
		} catch (WrongIdPasswordException wipe) {
			System.out.println("사용자 패스워드가 일치하지 않습니다.");
		}
	}
	
	private static void printHelp() {
		System.out.println("프로그램 사용법 안내");
		System.out.println("new 이메일 이름 패스워드 패스워드확인");
		System.out.println("change 이메일 현재패스워드 새패스워드");
		System.out.println("list");
		System.out.println();
	}
}
```



### 테스트

```
4월 10, 2020 11:03:31 오전 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@41906a77: startup date [Fri Apr 10 11:03:31 KST 2020]; root of context hierarchy
명령어를 입력하세요.
new aaa@test.com aaa paaa paaa
명령어를 입력하세요.
list
회원 정보 : 아이디 = 1	 이메일 = aaa@test.com	 이름 = aaa	 등록일 = 2020-04-10
명령어를 입력하세요.
new bbb@test.com bbb pbbb pbbb
명령어를 입력하세요.
list
회원 정보 : 아이디 = 2	 이메일 = bbb@test.com	 이름 = bbb	 등록일 = 2020-04-10
회원 정보 : 아이디 = 1	 이메일 = aaa@test.com	 이름 = aaa	 등록일 = 2020-04-10
명령어를 입력하세요.
listup
정의되지 않은 명령입니다.
프로그램 사용법 안내
new 이메일 이름 패스워드 패스워드확인
change 이메일 현재패스워드 새패스워드
list

명령어를 입력하세요.
exit
프로그램을 종료합니다.
```



### 회원 정보를 출력하는 기능을 추가

/ex03/src/main/java/spring/MemberInfoPrinter.java

```java
package spring;

// 저장소에 일치하는 회원 정보를 조회해서 조회된 회원 정보를 출력
public class MemberInfoPrinter {
	
	private MemberDao memberDao;
	private MemberPrinter memberPrinter;
	
	/*
		setter를 이용해서 의존 객체를 주입
		
		자바 빈 명세에 기술된 setter의 규칙
		 - 메서드 이름이 set으로 시작
		 - set 뒤에 첫 글자는 대문자로 시작
		 - 파라미터가 1개
		 - 리턴 타입이 void
	*/
	
	public void setMemberDao(MemberDao memberDao) {
		this.memberDao = memberDao;
	}
	
	public void setMemberPrinter(MemberPrinter memberPrinter) {
		this.memberPrinter = memberPrinter;
	}
	
	public void printMemberInfo(String email) {
		Member member = memberDao.selectByEmail(email);
		if (member == null) {
			System.out.println("일치하는 회원 정보 없음");
			return;
		}
		memberPrinter.print(member);
	}
}
```



스프링 설정 클래스를 수정

/ex03/src/main/java/config/AppCtx.java

```java
	@Bean
	public MemberInfoPrinter memberInfoPrinter() {
		MemberInfoPrinter mip = new MemberInfoPrinter();
		mip.setMemberDao(memberDao());
		mip.setMemberPrinter(memberPrinter());
		return mip;
	}
							:
```



스프링 컨테이너를 수정 ⇒ 회원 정보 출력 기능을 추가

/ex03/src/main/java/main/MainForSpring.java

```java
	public static void main(String[] args) throws IOException {
		// 스프링 컨테이너를 생성
		ctx = new AnnotationConfigApplicationContext(AppCtx.class);
		
		// 화면 입력을 받아서 명령어에 따라 처리를 분기
		BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
		while(true) {  // 무한 루프
			System.out.println("명령어를 입력하세요.");
			String command = reader.readLine();
			if (command.equalsIgnoreCase("exit")) {
				System.out.println("프로그램을 종료합니다.");
				break;
			}
			
			// new 이메일 이름 패스워드 패스워드확인
			if (command.startsWith("new ")) {
				doMemberRegister(command.split(" "));
				continue;
			}
			// change 이메일 현재패스워드 새패스워드
			else if (command.startsWith("change ")) {
				doChangePassword(command.split(" "));
				continue;
			}
			// list
			else if (command.equals("list")) {
				doList();
				continue;
			}
			// info 이메일
			else if (command.startsWith("info ")) {
				doInfo(command.split(" "));
				continue;
			}
			else {
				System.out.println("정의되지 않은 명령입니다.");
				printHelp();
			}
		}
	}
	
	private static void doList() {
		MemberListPrinter mlp = ctx.getBean("memberListPrinter", MemberListPrinter.class);
		mlp.printAll();
	}
	
	private static void doInfo(String[] args) {
		if (args.length != 2) {
			printHelp();
			return;
		}
		
		MemberInfoPrinter mip = ctx.getBean("memberInfoPrinter", MemberInfoPrinter.class);
		mip.printMemberInfo(args[1]);
	}
							:
```



### 테스트

```
4월 10, 2020 11:34:19 오전 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@41906a77: startup date [Fri Apr 10 11:34:19 KST 2020]; root of context hierarchy
명령어를 입력하세요.
new aaa@test.com aaa 123 123
명령어를 입력하세요.
info aaa@test.com
회원 정보 : 아이디 = 1	 이메일 = aaa@test.com	 이름 = aaa	 등록일 = 2020-04-10
명령어를 입력하세요.
new bbb@test.com bbb 789 789
명령어를 입력하세요.
list
회원 정보 : 아이디 = 2	 이메일 = bbb@test.com	 이름 = bbb	 등록일 = 2020-04-10
회원 정보 : 아이디 = 1	 이메일 = aaa@test.com	 이름 = aaa	 등록일 = 2020-04-10
명령어를 입력하세요.
info bbb@test.com
회원 정보 : 아이디 = 2	 이메일 = bbb@test.com	 이름 = bbb	 등록일 = 2020-04-10
명령어를 입력하세요.
info
정의되지 않은 명령입니다.
프로그램 사용법 안내
new 이메일 이름 패스워드 패스워드확인
change 이메일 현재패스워드 새패스워드
list

명령어를 입력하세요.
info ccc@test.com
일치하는 회원 정보 없음
명령어를 입력하세요.
```



### 프로그램 버전 정보를 출력하는 기능을 추가

버전 정보 출력 기능을 추가

/ex03/src/main/java/spring/VersionPrinter.java

```java
package spring;

// 다음과 같은 버전 정보를 출력하는 기능을 제공
// 이 프로그램의 버전은 OOO.OOO 입니다. (ooo.ooo = majorVersion.minerVersion)
public class VersionPrinter {
	private int majorVersion;
	private int minerVersion;
	
	// 버전 정보를 형식에 맞춰 출력하는 메서드
	public void print() {
		System.out.printf("이 프로그램의 버전은 %d.%d 입니다.\n", majorVersion, minerVersion);
	}

	// majorVersion, minerVersion 필드값 설정에 필요한 setter 메서드
	public void setMajorVersion(int majorVersion) {
		this.majorVersion = majorVersion;
	}

	public void setMinerVersion(int minerVersion) {
		this.minerVersion = minerVersion;
	}
}
```



스프링 설정 클래스를 수정 ⇒ 버전 출력에 필요한 빈을 생성하고 버전을 5.0으로 설정

/ex03/src/main/java/config/AppCtx.java

```java
	@Bean
	public VersionPrinter versionPrinter() {
		VersionPrinter vp = new VersionPrinter();
		vp.setMajorVersion(5);
		vp.setMinerVersion(0);
		return vp;
	}
					:
```



스프링 컨테이너를 수정 ⇒ 사용자가 version 명령어를 입력하면 설정된 버전 정보를 출력하는 기능을 추가

/ex03/src/main/java/main/MainForSpring.java

```java
	public static void main(String[] args) throws IOException {
		// 스프링 컨테이너를 생성
		ctx = new AnnotationConfigApplicationContext(AppCtx.class);
		
		// 화면 입력을 받아서 명령어에 따라 처리를 분기
		BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
		while(true) {  // 무한 루프
			System.out.println("명령어를 입력하세요.");
			String command = reader.readLine();
			if (command.equalsIgnoreCase("exit")) {
				System.out.println("프로그램을 종료합니다.");
				break;
			}
			
			// new 이메일 이름 패스워드 패스워드확인
			if (command.startsWith("new ")) {
				doMemberRegister(command.split(" "));
				continue;
			}
			// change 이메일 현재패스워드 새패스워드
			else if (command.startsWith("change ")) {
				doChangePassword(command.split(" "));
				continue;
			}
			// list
			else if (command.equals("list")) {
				doList();
				continue;
			}
			// info 이메일
			else if (command.startsWith("info ")) {
				doInfo(command.split(" "));
				continue;
			}
			// version
			else if (command.equals("version")) {
				doVersion();
				continue;
			}
			else {
				System.out.println("정의되지 않은 명령입니다.");
				printHelp();
			}
		}
	}
	
	private static void doVersion() {
		VersionPrinter vp = ctx.getBean("versionPrinter", VersionPrinter.class);
		vp.print();
	}
						:
```

AppCtx에 정의해 놓은 Bean을 생성



---



기본적으로 빈 객체는 싱글톤 범위를 가진다.

```java
	@Bean
	public MemberDao memberDao() {
		return new MemberDao();
	}
	
	@Bean
	public MemberRegisterService memberRegisterService() {
		return new MemberRegisterService(memberDao());
	}
	
	@Bean
	public ChangePasswordService changePasswordService() {
		ChangePasswordService cps = new ChangePasswordService();
		cps.setMemberDao(memberDao());
		return cps;
	}
```



memberRegisterService(), changePasswordService() 여러 메서드에서 memberDao() 메서드를 여러 번 호출하더라도 항상 같은 객체를 반환

⇒ 스프링 내부적으로 아래와 같은 형태로 스프링 설정이 처리된다. 



[의사코드]

```java
public class AppCtxEx extends AppCtx {

	private Map<String, Object> beans = … ;

	@Override 
	public MemeberDao memberDao() {
		if (!beans.containsKey("memberDao")) 
			beans.put("memberDao", super.memberDao());
		return (MemberDao)beans.get("memberDao");
	}
						:
}
```



### 스프링 설정 클래스(파일)이 여러 개인 경우

Rename : `Alt` + `Shift` + `R`

클래스 명, 메서드 명, 필드 명을 변경할 때 사용. 바꾼 것을 reference하고 있는 것들을 다 찾아서 eclipse가 바꿔준다.



AppCtx에서 `Alt` + `Shift` + `R` => AppConf => `Enter`



/ex03/src/main/java/config/AppConf1.java

```java
package config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import spring.MemberDao;
import spring.MemberPrinter;

@Configuration
public class AppConf1 {
	@Bean
	public MemberDao memberDao() {
		return new MemberDao();
	}
	
	@Bean
	public MemberPrinter memberPrinter() {
		return new MemberPrinter();
	}
}
```



/ex03/src/main/java/config/AppConf2.java

```java
package config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import spring.ChangePasswordService;
import spring.MemberDao;
import spring.MemberInfoPrinter;
import spring.MemberListPrinter;
import spring.MemberPrinter;
import spring.MemberRegisterService;
import spring.VersionPrinter;

@Configuration
public class AppConf2 {
	// 스프링 빈에 의존하는 다른 빈을 자동으로 주입할 때 사용하는 어노테이션
	@Autowired
	private MemberDao memberDao;
	
	@Autowired
	private MemberPrinter memberPrinter;

	@Bean
	public MemberRegisterService memberRegisterService() {
		return new MemberRegisterService(memberDao);
	}
	
	@Bean
	public ChangePasswordService changePasswordService() {
		ChangePasswordService cps = new ChangePasswordService();
		cps.setMemberDao(memberDao);
		return cps;
	}
	
	@Bean
	public MemberListPrinter memberListPrinter() {
		return new MemberListPrinter(memberDao, memberPrinter);
	}
	
	@Bean
	public MemberInfoPrinter memberInfoPrinter() {
		MemberInfoPrinter mip = new MemberInfoPrinter();
		mip.setMemberDao(memberDao);
		mip.setMemberPrinter(memberPrinter);
		return mip;
	}
	
	@Bean
	public VersionPrinter versionPrinter() {
		VersionPrinter vp = new VersionPrinter();
		vp.setMajorVersion(5);
		vp.setMinerVersion(0);
		return vp;
	}
}
```

@Autowired는 Bean을 자동으로 주입해주는 어노테이션이다.



**스프링 컨테이너 생성**

/ex03/src/main/java/main/MainForSpring.java

```java
public class MainForSpring {
	
	private static ApplicationContext ctx = null;
	
	public static void main(String[] args) throws IOException {
		// 스프링 컨테이너를 생성
		// ctx = new AnnotationConfigApplicationContext(AppConf.class);
		ctx = new AnnotationConfigApplicationContext(AppConf1.class, AppConf2.class);
									:
```

여러개의 설정 파일을 콤마(`,`)로 연결



### @Autowired

스프링 빈에 의존하는 다른 빈을 자동으로 주입하고 싶을 때 사용하는 어노테이션

⇒ 스프링 설정 클래스의 필드에 @Autowired 애노테이션을 붙이면 해당 타입의 빈을 찾아서 필드에 할당

⇒ 스프링 설정 클래스의 메서드에서는 이 필드를 사용해서 필요한 빈을 사용 가능



/ex03/src/main/java/spring/MemberInfoPrinter.java

```java
package spring;

import org.springframework.beans.factory.annotation.Autowired;

// 저장소에 일치하는 회원 정보를 조회해서 조회된 회원 정보를 출력
public class MemberInfoPrinter {
	@Autowired
	private MemberDao memberDao;
	@Autowired
	private MemberPrinter memberPrinter;
	
	/*
		setter를 이용해서 의존 객체를 주입
		
		자바 빈 명세에 기술된 setter의 규칙
		 - 메서드 이름이 set으로 시작
		 - set 뒤에 첫 글자는 대문자로 시작
		 - 파라미터가 1개
		 - 리턴 타입이 void
	*/
	
//	public void setMemberDao(MemberDao memberDao) {
//		this.memberDao = memberDao;
//	}
//	
//	public void setMemberPrinter(MemberPrinter memberPrinter) {
//		this.memberPrinter = memberPrinter;
//	}
	
	public void printMemberInfo(String email) {
		Member member = memberDao.selectByEmail(email);
		if (member == null) {
			System.out.println("일치하는 회원 정보 없음");
			return;
		}
		memberPrinter.print(member);
	}
}
```

MemberInfoPrinter는 Bean이다.

Bean 안에서 다른 Bean을 @Autowired 하면 setter 메서드를 쓰지 않아도 정상적으로 사용 가능하다. 해당 타입의 Bean을 찾아서 필드에 할당한다.



/ex03/src/main/java/config/AppConf2.java

```java
	@Bean
	public MemberInfoPrinter memberInfoPrinter() {
		MemberInfoPrinter mip = new MemberInfoPrinter();
//		mip.setMemberDao(memberDao);
//		mip.setMemberPrinter(memberPrinter);
		return mip;
	}
```



/ex03/src/main/java/config/AppConf.java

```java
	@Bean
	public MemberInfoPrinter memberInfoPrinter() {
		MemberInfoPrinter mip = new MemberInfoPrinter();
//		mip.setMemberDao(memberDao());
//		mip.setMemberPrinter(memberPrinter());
		return mip;
	}
```



의존 주입 대상에 @Autowired 애노테이션을 붙이면 의존성 주입을 위한 setter 메서드를 사용하지 않고도 자동으로 의존성이 주입됨



### @Import

```java
public class MainForSpring {
	
	private static ApplicationContext ctx = null;
	
	public static void main(String[] args) throws IOException {
		// 스프링 컨테이너를 생성
		// ctx = new AnnotationConfigApplicationContext(AppConf.class);
		ctx = new AnnotationConfigApplicationContext(AppConf1.class, AppConf2.class);
									:
```

설정 클래스가 많은 경우 어떻게 할까?



/ex03/src/main/java/config/AppConf1.java

```java
@Configuration
@Import(AppConf2.class)
public class AppConf1 {
		:
}
```



/ex03/src/main/java/main/MainForSpring.java

```java
public class MainForSpring {
	private static ApplicationContext ctx = null;
	public static void main(String[] args) throws IOException {
		ctx = new AnnotationConfigApplicationContext(AppConf1.class);
									:
```



@Import 애노테이션에 두 개 이상의 설정 클래스를 전달할 때는 배열 형태로 전달

```java
@Configuration
@Import({ AppConf2.class, AppConf3.class })
public class AppConf1 {
		:
}
```





### getBean(bean_name, bean_type)

존재하지 않는 빈 이름을 사용하는 경우



/ex03/src/main/java/main/MainForSpring.java

```java
	public static void main(String[] args) throws IOException {
		// 스프링 컨테이너를 생성
		// ctx = new AnnotationConfigApplicationContext(AppConf.class);
		ctx = new AnnotationConfigApplicationContext(AppConf1.class);
		
		// 존재하지 않는 빈 이름을 사용하는 경우
		VersionPrinter vp = ctx.getBean("nonexistent", VersionPrinter.class);
		vp.print();
```



```
4월 10, 2020 3:30:16 오후 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@41906a77: startup date [Fri Apr 10 15:30:16 KST 2020]; root of context hierarchy
Exception in thread "main" org.springframework.beans.factory.NoSuchBeanDefinitionException: No bean named 'nonexistent' available
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.getBeanDefinition(DefaultListableBeanFactory.java:687)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getMergedLocalBeanDefinition(AbstractBeanFactory.java:1205)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:292)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:205)
	at org.springframework.context.support.AbstractApplicationContext.getBean(AbstractApplicationContext.java:1091)
	at main.MainForSpring.main(MainForSpring.java:31)
```

NoSuchBeanDefinitionException: No bean named 'nonexistent' available

⇒ "noexistent" 이름의 빈이 존재하지 않거나, 또는 이름을 잘못 입력했거나



---

빈의 실제 타입과 지정한 타입이 다른 경우



/ex03/src/main/java/main/MainForSpring.java

```java
		// 빈의 실제 타입과 지정한 타입이 다른 경우
		VersionPrinter vp = ctx.getBean("versionPrinter", MemberInfoPrinter.class);
		vp.print();
```



```
Exception in thread "main" java.lang.Error: Unresolved compilation problem: 
	Type mismatch: cannot convert from MemberInfoPrinter to VersionPrinter

	at main.MainForSpring.main(MainForSpring.java:31)
```



```java
// 빈의 실제 타입과 지정한 타입이 다른 경우
		MemberInfoPrinter vp = ctx.getBean("versionPrinter", MemberInfoPrinter.class);
```



```
4월 10, 2020 3:43:09 오후 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@41906a77: startup date [Fri Apr 10 15:43:09 KST 2020]; root of context hierarchy
Exception in thread "main" org.springframework.beans.factory.BeanNotOfRequiredTypeException: Bean named 'versionPrinter' is expected to be of type 'spring.MemberInfoPrinter' but was actually of type 'spring.VersionPrinter'
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:384)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:205)
	at org.springframework.context.support.AbstractApplicationContext.getBean(AbstractApplicationContext.java:1091)
	at main.MainForSpring.main(MainForSpring.java:31)
```



빈의 타입이 유일하면 타입만으로 빈을 구할 수 있다

```java
		VersionPrinter vp = ctx.getBean(VersionPrinter.class);
```



빈 타입이 존재하지 않으면

```java
		VersionPrinter vp = ctx.getBean(NonExistent.class);
```



```
Exception in thread "main" java.lang.Error: Unresolved compilation problems: 
	Type mismatch: cannot convert from NonExistent to VersionPrinter
	NonExistent cannot be resolved to a type

	at main.MainForSpring.main(MainForSpring.java:31)
```



---



같은 타입의 빈이 두 개 이상 존재하는 경우?



VersionPrinter 타입의 빈을 두 개 정의 (versionPrinter, newVersionPrinter)

/ex03/src/main/java/config/AppConf2.java

```java
	@Bean
	public VersionPrinter versionPrinter() {
		VersionPrinter vp = new VersionPrinter();
		vp.setMajorVersion(5);
		vp.setMinerVersion(0);
		return vp;
	}
	
	@Bean
	public VersionPrinter newVersionPrinter() {
		VersionPrinter vp = new VersionPrinter();
		vp.setMajorVersion(6);
		vp.setMinerVersion(0);
		return vp;
	}
```



/ex03/src/main/java/main/MainForSpring.java

```java
		VersionPrinter vp = ctx.getBean(VersionPrinter.class);
```



```
4월 10, 2020 3:54:29 오후 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@41906a77: startup date [Fri Apr 10 15:54:29 KST 2020]; root of context hierarchy
Exception in thread "main" org.springframework.beans.factory.NoUniqueBeanDefinitionException: No qualifying bean of type 'spring.VersionPrinter' available: expected single matching bean but found 2: versionPrinter,newVersionPrinter
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveNamedBean(DefaultListableBeanFactory.java:1036)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.getBean(DefaultListableBeanFactory.java:340)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.getBean(DefaultListableBeanFactory.java:335)
	at org.springframework.context.support.AbstractApplicationContext.getBean(AbstractApplicationContext.java:1103)
	at main.MainForSpring.main(MainForSpring.java:31)
```

NoUniqueBeanDefinitionException



### 주입 대상 객체를 모두 빈 객체로 설정해야만 하나?

AppConf.java와 AppConf2.java의 setter 메서드 주석 해제



/ex03/src/main/java/spring/MemberInfoPrinter.java

```java
package spring;

import org.springframework.beans.factory.annotation.Autowired;

// 저장소에 일치하는 회원 정보를 조회해서 조회된 회원 정보를 출력
public class MemberInfoPrinter {
	@Autowired
	private MemberDao memberDao;
	@Autowired
	private MemberPrinter memberPrinter;
	
	/*
		setter를 이용해서 의존 객체를 주입
		
		자바 빈 명세에 기술된 setter의 규칙
		 - 메서드 이름이 set으로 시작
		 - set 뒤에 첫 글자는 대문자로 시작
		 - 파라미터가 1개
		 - 리턴 타입이 void
	*/
	
	public void setMemberDao(MemberDao memberDao) {
		this.memberDao = memberDao;
	}
	
	public void setMemberPrinter(MemberPrinter memberPrinter) {
		this.memberPrinter = memberPrinter;
	}
	
	public void printMemberInfo(String email) {
		Member member = memberDao.selectByEmail(email);
		if (member == null) {
			System.out.println("일치하는 회원 정보 없음");
			return;
		}
		memberPrinter.print(member);
	}
}
```



/ex03/src/main/java/main/MainForSpring.java

```java
public class MainForSpring {
	
	private static ApplicationContext ctx = null;
	
	public static void main(String[] args) throws IOException {
		// 스프링 컨테이너를 생성
		ctx = new AnnotationConfigApplicationContext(AppConf.class);
        						:
```



/ex03/src/main/java/config/AppConf.java

```java
	//@Bean
	public MemberPrinter memberPrinter() {
		return new MemberPrinter();
	}
					:
```



```
4월 10, 2020 4:17:19 오후 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@41906a77: startup date [Fri Apr 10 16:17:19 KST 2020]; root of context hierarchy
4월 10, 2020 4:17:19 오후 org.springframework.context.support.AbstractApplicationContext refresh
경고: Exception encountered during context initialization - cancelling refresh attempt: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'memberInfoPrinter': Unsatisfied dependency expressed through field 'memberPrinter'; nested exception is org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'spring.MemberPrinter' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
Exception in thread "main" org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'memberInfoPrinter': Unsatisfied dependency expressed through field 'memberPrinter'; nested exception is org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'spring.MemberPrinter' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.inject(AutowiredAnnotationBeanPostProcessor.java:586)
	at org.springframework.beans.factory.annotation.InjectionMetadata.inject(InjectionMetadata.java:91)
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor.postProcessPropertyValues(AutowiredAnnotationBeanPostProcessor.java:372)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.populateBean(AbstractAutowireCapableBeanFactory.java:1344)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:582)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:502)
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:312)
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:228)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:310)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:200)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.preInstantiateSingletons(DefaultListableBeanFactory.java:758)
	at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:868)
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:549)
	at org.springframework.context.annotation.AnnotationConfigApplicationContext.<init>(AnnotationConfigApplicationContext.java:88)
	at main.MainForSpring.main(MainForSpring.java:27)
Caused by: org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'spring.MemberPrinter' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.raiseNoMatchingBeanFound(DefaultListableBeanFactory.java:1504)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1101)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1062)
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.inject(AutowiredAnnotationBeanPostProcessor.java:583)
	... 14 more
```



---



### 의존 주입 방법 1.

설정 클래스에서 주입할 의존 대상을 생성자 또는 setter 메서드를 이용해서 직접 주입하는 방법



```java
@Configuration
public class AppConf {

	@Bean
	public MemberDao memberDao() {
		return new MemberDao();
	}

	@Bean
	public ChangePasswordService changePasswordService() {
		ChangePasswordService cps = new ChangePasswordService();
		cps.setMemberDao(memberDao());
		return cps;
	}
			:
```



### 의존 주입 방법2.

의존을 자동으로 주입 ⇒ 스프링이 자동으로 의존하는 빈 객체를 주입해 주는 기능 ⇒ @Autowired



#### 2-1. @Autowired 애노테이션을 필드에 붙이는 방법

```java
public class ChangePasswordService {

	@Autowired
	private MemberDao memberDao;
				:
}
```



```java
@Configuration
public class AppConf {

	@Bean
	public MemberDao memberDao() {
		return new MemberDao();
	}

	@Bean
	public ChangePasswordService changePasswordService() {
//		ChangePasswordService cps = new ChangePasswordService();
//		cps.setMemberDao(memberDao());
//		return cps;
		return new ChangePasswordService();
	}
			:
}
```



#### 2-2. @Autowired 애노테이션을 setter 메서드에 사용하는 방법



```java
public class MemberInfoPrinter {
	private MemberDao memberDao;
	private MemberPrinter memberPrinter;

	@Autowired
	public void setMemberDao(MemberDao memberDao) {
		this.memberDao = memberDao;
	}

	@Autowired
	public void setMemberPrinter(MemberPrinter memberPrinter) {
		this.memberPrinter = memberPrinter;
	}

	public void printMemberInfo(String email) {
		Member member = memberDao.selectByEmail(email);
		if (member == null) {
			System.out.println("일치하는 회원 정보 없음");
			return;
		}
		memberPrinter.print(member);
	}
}
```



```java
@Configuration
public class AppConf {
			:
	@Bean
	public MemberInfoPrinter memberInfoPrinter() {
		MemberInfoPrinter mip = new MemberInfoPrinter();
//		mip.setMemberDao(memberDao());
//		mip.setMemberPrinter(memberPrinter);
		return mip;
	}
			:
}
```



---



일치하는 빈이 없는 경우



/ex03/src/main/java/config/AppConf.java

```java
@Configuration
public class AppConf {
	
//	@Bean
//	public MemberDao memberDao() {
//		return new MemberDao();
//	}
    			:
}
```



```
4월 10, 2020 5:15:12 오후 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@41906a77: startup date [Fri Apr 10 17:15:12 KST 2020]; root of context hierarchy
4월 10, 2020 5:15:13 오후 org.springframework.context.support.AbstractApplicationContext refresh
경고: Exception encountered during context initialization - cancelling refresh attempt: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'memberRegisterService': Unsatisfied dependency expressed through field 'memberDao'; nested exception is org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'spring.MemberDao' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
Exception in thread "main" org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'memberRegisterService': Unsatisfied dependency expressed through field 'memberDao'; nested exception is org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'spring.MemberDao' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.inject(AutowiredAnnotationBeanPostProcessor.java:586)
	at org.springframework.beans.factory.annotation.InjectionMetadata.inject(InjectionMetadata.java:91)
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor.postProcessPropertyValues(AutowiredAnnotationBeanPostProcessor.java:372)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.populateBean(AbstractAutowireCapableBeanFactory.java:1344)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:582)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:502)
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:312)
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:228)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:310)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:200)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.preInstantiateSingletons(DefaultListableBeanFactory.java:758)
	at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:868)
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:549)
	at org.springframework.context.annotation.AnnotationConfigApplicationContext.<init>(AnnotationConfigApplicationContext.java:88)
	at main.MainForSpring.main(MainForSpring.java:27)
Caused by: org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'spring.MemberDao' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.raiseNoMatchingBeanFound(DefaultListableBeanFactory.java:1504)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1101)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1062)
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.inject(AutowiredAnnotationBeanPostProcessor.java:583)
	... 14 more
```

memberDao 메서드 주석 해제



---



/ex03/src/main/java/config/AppConf.java

```java
	@Bean
	public MemberPrinter memberPrinter1() {
		return new MemberPrinter();
	}
					:
```

이름을 변경해도 정상적으로 동작한다.

이름을 가지고 Autowire 하지 않는다.

해당하는 Bean의 타입을 가지고 Autowire 한다.



---

/ex03/src/main/java/config/AppConf.java

```java
	@Bean
	public MemberPrinter memberPrinter() {
		return new MemberPrinter();
	}
	
	@Bean
	public MemberPrinter memberPrinter1() {
		return new MemberPrinter();
	}
```

정상적으로 작동



```java
	@Bean
	public MemberPrinter memberPrinter1() {
		return new MemberPrinter();
	}
	
	@Bean
	public MemberPrinter memberPrinter2() {
		return new MemberPrinter();
	}
```

오류 발생

```
4월 10, 2020 5:34:59 오후 org.springframework.context.support.AbstractApplicationContext prepareRefresh
정보: Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@41906a77: startup date [Fri Apr 10 17:34:59 KST 2020]; root of context hierarchy
4월 10, 2020 5:34:59 오후 org.springframework.context.support.AbstractApplicationContext refresh
경고: Exception encountered during context initialization - cancelling refresh attempt: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'memberListPrinter': Unsatisfied dependency expressed through field 'memberPrinter'; nested exception is org.springframework.beans.factory.NoUniqueBeanDefinitionException: No qualifying bean of type 'spring.MemberPrinter' available: expected single matching bean but found 2: memberPrinter1,memberPrinter2
Exception in thread "main" org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'memberListPrinter': Unsatisfied dependency expressed through field 'memberPrinter'; nested exception is org.springframework.beans.factory.NoUniqueBeanDefinitionException: No qualifying bean of type 'spring.MemberPrinter' available: expected single matching bean but found 2: memberPrinter1,memberPrinter2
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.inject(AutowiredAnnotationBeanPostProcessor.java:586)
	at org.springframework.beans.factory.annotation.InjectionMetadata.inject(InjectionMetadata.java:91)
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor.postProcessPropertyValues(AutowiredAnnotationBeanPostProcessor.java:372)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.populateBean(AbstractAutowireCapableBeanFactory.java:1344)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:582)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:502)
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:312)
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:228)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:310)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:200)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.preInstantiateSingletons(DefaultListableBeanFactory.java:758)
	at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:868)
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:549)
	at org.springframework.context.annotation.AnnotationConfigApplicationContext.<init>(AnnotationConfigApplicationContext.java:88)
	at main.MainForSpring.main(MainForSpring.java:27)
Caused by: org.springframework.beans.factory.NoUniqueBeanDefinitionException: No qualifying bean of type 'spring.MemberPrinter' available: expected single matching bean but found 2: memberPrinter1,memberPrinter2
	at org.springframework.beans.factory.config.DependencyDescriptor.resolveNotUnique(DependencyDescriptor.java:215)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1113)
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1062)
	at org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor$AutowiredFieldElement.inject(AutowiredAnnotationBeanPostProcessor.java:583)
	... 14 more
```

해당하는 타입의 빈이 유일할 경우 해당하는 빈을 가져온다.

해당하는 타입의 빈이 다른 이름으로 여러개 있는 경우 타입도 일치하고 이름도 일치해야 가져온다.


