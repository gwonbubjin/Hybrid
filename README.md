# 📱 코르도바(Cordova)를 이용한 앱 개발 수업 정리

## 1. 코르도바(Cordova)란?
- Apache Cordova는 **HTML, CSS, JavaScript**로 모바일 앱을 개발할 수 있는 프레임워크.
- 하나의 코드베이스로 **안드로이드 / iOS / 윈도우** 등 멀티 플랫폼 지원.
- 웹 기술을 네이티브 앱처럼 실행할 수 있도록 **WebView + 네이티브 브리지** 구조 제공.

---

## 2. 개발 환경 준비
### 필수 설치
1. **Node.js**  
   - Cordova CLI 실행을 위해 필요.  
   - [Node.js 공식 사이트](https://nodejs.org/)에서 설치.

2. **Cordova CLI 설치**
   ```bash
   npm install -g cordova
   ```

3. **플랫폼 SDK**
   - 안드로이드 개발: [Android Studio](https://developer.android.com/studio)
   - iOS 개발: Xcode (Mac 전용)

---

## 3. 프로젝트 생성
```bash
cordova create myApp com.example.myapp MyApp
cd myApp
cordova platform add android
cordova platform add ios
```

- `myApp`: 프로젝트 폴더명  
- `com.example.myapp`: 패키지명  
- `MyApp`: 앱 이름  

---

## 4. 앱 실행 및 빌드
### 실행
```bash
cordova run android
cordova run ios
```

### 빌드
```bash
cordova build android
cordova build ios
```

---

## 5. 주요 폴더 구조
```
myApp/
 ├── config.xml         # 앱 환경설정
 ├── hooks/             # 빌드 이벤트 스크립트
 ├── platforms/         # 추가한 플랫폼별 코드
 ├── plugins/           # 설치된 Cordova 플러그인
 └── www/               # HTML, CSS, JS 리소스 (실제 앱 내용)
```

---

## 6. 플러그인 사용
- Cordova는 네이티브 기능을 **플러그인**을 통해 제공.
- 예: 카메라, GPS, 파일 접근, 알림 등.

```bash
cordova plugin add cordova-plugin-camera
```

```javascript
navigator.camera.getPicture(onSuccess, onFail, { 
    quality: 50,
    destinationType: Camera.DestinationType.DATA_URL 
});
```

---

## 7. 장단점
### ✅ 장점
- 하나의 코드로 여러 플랫폼 지원
- 웹 기술만 알아도 모바일 앱 제작 가능
- 다양한 플러그인으로 네이티브 기능 활용 가능

### ❌ 단점
- 퍼포먼스가 네이티브 앱에 비해 떨어질 수 있음
- 복잡한 UI/UX 구현에 제약
- 플러그인 의존도가 높음

---

## 8. 수업 흐름 예시
1. **OT & 환경설정**
   - Cordova 개요 및 설치
   - Node.js, Android Studio 설정
2. **프로젝트 생성 & 실행**
   - Cordova 프로젝트 만들기
   - 안드로이드/아이폰 실행
3. **기본 앱 제작**
   - HTML/CSS/JS로 화면 구성
   - 버튼, 입력창, 리스트 등 UI 작성
4. **플러그인 활용**
   - 카메라, 위치, 파일 접근 API 실습
   - Push 알림 실습
5. **최종 프로젝트**
   - 조별 또는 개인 앱 제작
   - APK/iOS 빌드 및 발표

---

## 9. 참고 자료
- [Apache Cordova 공식 문서](https://cordova.apache.org/docs/en/latest/)
- [플러그인 검색](https://cordova.apache.org/plugins/)
- [MDN Web Docs - Web APIs](https://developer.mozilla.org/)

---

