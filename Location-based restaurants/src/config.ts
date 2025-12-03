// 카카오맵 API 설정
//
// 카카오 개발자 사이트에서 발급받은 API 키를 아래에 입력하세요:
// 1. https://developers.kakao.com/ 접속
// 2. "내 애플리케이션" 메뉴에서 앱 생성
// 3. "앱 키" 탭에서 "JavaScript 키"와 "REST API 키" 복사
// 4. 플랫폼 설정에서 Web 플랫폼 추가 (http://localhost:3000)

// 빌드 시점에 환경변수를 직접 문자열로 치환
const MAP_API_KEY = '90392116c8307dcd11e51cdc92f9627b';
const REST_API_KEY = '4dddc1aa26d0a643c3b24d98db5cb81f';

export const KAKAO_CONFIG = {
  MAP_API_KEY,
  REST_API_KEY,
};

console.log('KAKAO_CONFIG loaded:', KAKAO_CONFIG);


// 개발 환경에서는 위 키를 직접 입력하여 사용하세요.
// 프로덕션 환경에서는 환경변수로 관리하는 것을 권장합니다.