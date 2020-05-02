# Spring Boot

## 구글 클라우드 플랫폼 가입

https://console.cloud.google.com/



## 스프링 시큐리티, OAuth2.0으로 로그인 기능 구현

### 구글 서비스 등록(생성)

홈 => 프로젝트 만들기

프로젝트 이름 : springboot-webservice => 만들기

API 및 서비스 => OAuth 동의 화면 => 외부 => 만들기

애플리케이션 이름 : springboot-webservice => 저장 => OAuth 동의 화면 확인

사용자 인증 정보 => 사용자 인증 정보 만들기 => OAuth 2.0 클라이언트 ID

애플리케이션 유형 : 웹 애플리케이션

이름 : springboot-webservice

승인된 리디렉션 URI : http://localhost:8080/login/oauth2/code/google

생성

클라이언트 ID, 클라이언트 보안 비밀번호



### oauth 설정 파일 생성

![image-20200502095557804](images/image-20200502095557804.png)



/springboot/src/main/resources/application-oauth.properties

```properties
# OAuth 클라이언트 ID
spring.security.oauth2.client.registration.google.client-id=
# OAuth 클라이언트 보안 비밀번호
spring.security.oauth2.client.registration.google.client-secret=
# OAuth 서비스를 이용해서 제공받을 정보의 범위
# 기본값 : profile,email,openid 
# openid를 요청하면 정보를 제공받을 서비스를 구분해야 함
# 하나의 OAuth2Service로 구현하기 위해서 openid를 scope에서 제외
spring.security.oauth2.client.registration.google.scope=profile,email
```



application.properties에 application-oauth.properties를 포함

/springboot/src/main/resources/application.properties

```properties
spring.profiles.include=oauth

spring.jpa.show-sql=true
spring.h2.console.enabled=true
```



### Role 열거형 클래스 생성

![image-20200502102729132](images/image-20200502102729132.png)



/springboot/src/main/java/springboot/domain/user/Role.java

```java
package springboot.domain.user;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {
	GUEST("ROLE_GUEST", "손님"), 
	USER("ROLE_USER", "일반사용자");
	
	private final String key;
	private final String title;
}
```



### 사용자 정보를 담을 엔티티 클래스를 생성

![image-20200502103354241](images/image-20200502103354241.png)



/springboot/src/main/java/springboot/domain/user/User.java

```java
package springboot.domain.user;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import springboot.domain.BaseTimeEntity;

@NoArgsConstructor
@Getter
@Entity
public class User extends BaseTimeEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false)
	private String name;
	
	@Column(nullable = false)
	private String email;
	
	@Column
	private String picture;
	
	// @Enumerated : Enum 값을 저장
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Role role;
	
	@Builder
	public User(String name, String email, String picture, Role role) {
		this.name = name;
		this.email = email;
		this.picture = picture;
		this.role = role;
	}
	
	public User update(String name, String picture) {
		this.name = name;
		this.picture = picture;
		return this;
	}
	
	public String getRoleKey() {
		return this.role.getKey();
	}
}
```



### 사용자 정보를 CRUD하는 Repository를 생성

![image-20200502104638693](images/image-20200502104638693.png)



/springboot/src/main/java/springboot/domain/user/UserRepository.java

```java
package springboot.domain.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
	// 이메일 정보가 일치하는 사용자 정보를 조회
	Optional<User> findByEmail(String email);
}
```



### oauth2 의존성 추가

/springboot/build.gradle

```gradle
			:
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-web'
	providedRuntime 'org.springframework.boot:spring-boot-starter-tomcat'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
	testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
	
	compile 'org.projectlombok:lombok'
	compile 'org.springframework.boot:spring-boot-starter-data-jpa'
    compile 'com.h2database:h2'
    compile 'org.springframework.boot:spring-boot-starter-mustache'
    compile 'org.springframework.boot:spring-boot-starter-oauth2-client'
}
			:
```



Refresh Gradle Project



### SecurityConfig 클래스 생성

![image-20200502105456831](images/image-20200502105456831.png)



/springboot/src/main/java/springboot/config/auth/SecurityConfig.java

```java
package springboot.config.auth;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

import lombok.RequiredArgsConstructor;
import springboot.domain.user.Role;

// Spring Security 설정들을 활성
@EnableWebSecurity 
@RequiredArgsConstructor
public class SecurityConfig extends WebSecurityConfigurerAdapter {

	// 구글 로그인을 통해 가져온 정보(email, name, picture 등)를 기반으로
	// 가입, 정보 수정, 세션에 저장하는 등의 기능을 제공
	private final CustomOAuth2UserService customOAuth2UserService;
	
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
			// h2-console 화면을 사용하기 위해서 설정을 해제 (개발 용도)
			.csrf().disable()
			.headers().frameOptions().disable()
			.and()
				// URL별로 권한 관리를 지정
				.authorizeRequests()
				// 권한 관리 대상을 지정
				.antMatchers("/", "/css/**", "/images/**", "/js/**", "/h2-console/**").permitAll()
				.antMatchers("/api/v1/**").hasRole(Role.USER.name())
				// 설정된 값을 제외한 나머지에 대해서는 인증 받은 사용자만 허용
				.anyRequest().authenticated()
			.and()
				// logout 기능에 대해서 정의
				.logout()
					.logoutSuccessUrl("/")
			.and()
				// oauth2Login 기능에 대해서 정의
				.oauth2Login()
					// OAuth2 로그인에 성공했을 때 사용자 정보를 가져오는 방법을 설정
					.userInfoEndpoint()
						// 소셜 로그인에 성공했을 때 후속 조치를 구현한 구현체를 등록
						.userService(customOAuth2UserService);
	}
}
```



### OAuth2UserService를 통해 가져온 정보를 담을 클래스를 생성

![image-20200502113731368](images/image-20200502113731368.png)



/springboot/src/main/java/springboot/config/auth/dto/OAuthAttributes.java

```java
package springboot.config.auth.dto;

import java.util.Map;

import lombok.Builder;
import lombok.Getter;
import springboot.domain.user.Role;
import springboot.domain.user.User;

@Getter
public class OAuthAttributes {

	private Map<String, Object> attributes;
	
	private String nameAttributeKey;
	private String name;
	private String email;
	private String picture;
	
	@Builder
	public OAuthAttributes(Map<String, Object> attributes, String nameAttributeKey, String name, String email,
			String picture) {
		this.attributes = attributes;
		this.nameAttributeKey = nameAttributeKey;
		this.name = name;
		this.email = email;
		this.picture = picture;
	}
	
	// registrationId : 소셜 로그인(google, naver, facebook ...) 구분을 위한 용도
	public static OAuthAttributes of(String registrationId, 
			String userNameAttributeName, Map<String, Object> attributes) {
		return ofGoogle(userNameAttributeName, attributes);
	}
	
	public static OAuthAttributes ofGoogle(String userNameAttributeName, Map<String, Object> attributes) {
		return OAuthAttributes.builder()
				.name((String)attributes.get("name"))
				.email((String)attributes.get("email"))
				.picture((String)attributes.get("picture"))
				.attributes(attributes)
				.nameAttributeKey(userNameAttributeName)
				.build();
	}
	
	public User toEntity() {
		return User.builder()
				.name(this.name)
				.email(this.email)
				.picture(this.picture)
				.role(Role.GUEST)
				.build();
	}
}
```



### 인증된 사용자 정보를 저장할 객체를 생성

![image-20200502115539347](images/image-20200502115539347.png)



/springboot/src/main/java/springboot/config/auth/dto/SessionUser.java

```java
package springboot.config.auth.dto;

import java.io.Serializable;

import lombok.Getter;
import springboot.domain.user.User;

// 직렬화
// 자바 시스템 내부에서 사용되는 객체(또는 데이터)를 
// 외부의 자바 시스템에서도 사용할 수 있도록 바이트(byte) 형태로 데이터를 변환하는 기술

@Getter
public class SessionUser implements Serializable {
	private String name;
	private String email;
	private String picture;
	
	public SessionUser(User user) {
		this.name = user.getName();
		this.email = user.getEmail();
		this.picture = user.getPicture();
	}
}
```



### 소셜 로그인을 통해서 가져온 사용자 정보를 처리하는 서비스를 구현

/springboot/src/main/java/springboot/config/auth/CustomOAuth2UserService.java

```java
package springboot.config.auth;

import java.util.Collections;

import javax.servlet.http.HttpSession;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import springboot.config.auth.dto.OAuthAttributes;
import springboot.config.auth.dto.SessionUser;
import springboot.domain.user.User;
import springboot.domain.user.UserRepository;

@RequiredArgsConstructor
@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

	private final UserRepository userRepository;
	private final HttpSession httpSession;
	
	@Override
	public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
		OAuth2UserService delegate = new DefaultOAuth2UserService();
		OAuth2User oauth2User = delegate.loadUser(userRequest);
		
		String registrationId = userRequest.getClientRegistration().getRegistrationId();
		String userNameAttributeName = userRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();
		
		OAuthAttributes attributes = OAuthAttributes.of(registrationId, userNameAttributeName, oauth2User.getAttributes());
		
		User user = saveOrUpdate(attributes);
		httpSession.setAttribute("user", new SessionUser(user));
		
		return new DefaultOAuth2User(
				Collections.singleton(new SimpleGrantedAuthority(user.getRoleKey())), 
				attributes.getAttributes(), 
				attributes.getNameAttributeKey()
		);
	}

	private User saveOrUpdate(OAuthAttributes attributes) {
		User user = userRepository.findByEmail(attributes.getEmail())
				.map(entity -> entity.update(attributes.getName(), attributes.getPicture()))
				.orElse(attributes.toEntity());
		return userRepository.save(user);
	}
}
```



### 로그인 버튼을 추가

/springboot/src/main/resources/templates/index.mustache

```mustache
		:
	<h1>스프링 부트로 시작하는 웹 서비스</h1>
	<div class="col-md-12">
		<div class="row">
			<div class="col-md-6">
				<a href="/posts/save" role="button" class="btn btn-primary">글 등록</a>
				
				<!-- userName 존재하는 경우 -->
				{{#loginUserName}} 
					Logged in as: <span id="user">{{loginUserName}}</span>
					<img src={{loginUserPicture}} height=30px width=30px>
					<a href="/logout" class="btn btn-info active" role="button">Logout</a>
				{{/loginUserName}}
				
				<!-- userName 존재하지 않는 경우 -->
				{{^loginUserName}} 
					<a href="/oauth2/authorization/google" class="btn btn-success active" role="button">Google</a>
				{{/loginUserName}}
				
			</div>
		</div>
	</div>
		:
```



스프링 시큐리티에서 기본적으로 제공하는 로그인/로그아웃 URL 

⇒ 별도의 컨트롤러를 생성하지 않아도 됩니다.

/oauth2/authorization/google

/logout



Session : 상대편과 연결되어 있는 상태



### IndexController에 userName을 추가

/springboot/src/main/java/springboot/web/IndexController.java

```java
@RequiredArgsConstructor
@Controller
public class IndexController {
	
	private final PostsService postsService;
	private final HttpSession httpSession;
	
	@GetMapping("/")
	public String index(Model model) {
		model.addAttribute("posts", postsService.findAllDesc());
		
		// 로그인한 사용자(세션 유무)이면 userName을 템플릿으로 전달
		SessionUser user = (SessionUser)httpSession.getAttribute("user");
		if (user != null) {
			model.addAttribute("loginUserName", user.getName());
			if(user.getPicture() == null)
				model.addAttribute("loginUserPicture", "https://dummyimage.com/50x50/007bff/000000.jpg&text=%5E..%5E");
			else
				model.addAttribute("loginUserPicture", user.getPicture());
		}
		
		return "index";
	}
    		:
}
```



더미 이미지 생성 사이트 : https://dummyimage.com/



### 테스트

http://localhost:8080/

Google 버튼 클릭 => Google 계정으로 로그인 => User 이름 확인 => Logout



### H2-Console을 이용해서 회원 정보를 조회

http://localhost:8080/h2-console

```sql
select * from user;
```

Run 버튼 클릭 => 결과 확인



### 게시글 등록 시 오류

![image-20200502152731261](images/image-20200502152731261.png)



### H2-Console에서 직접 데이터를 추가 후 조회 및 수정

```sql
insert into posts (title, content, author, created_date, modified_date) values ('title', 'content', 'na', now(), now());
select * from posts;
```



![image-20200502152946117](images/image-20200502152946117.png)



![image-20200502153057490](images/image-20200502153057490.png)



게시글 수정 시 오류 발생



### 로그인한 사용자의 롤을 DB에서 확인

http://localhost:8080/h2-console

```sql
select * from user;
```



ROLE이 GUEST인 것을 확인할 수 있다.



### 로그인한 사용자의 롤을 USER로 변경

```sql
update user set role = 'USER';
```



### (재로그인 후) 게시글 등록 및 수정 가능 여부 확인

![image-20200502154752745](images/image-20200502154752745.png)



