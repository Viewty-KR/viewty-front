/**
 * 라우트 보호 설정
 * 
 * - PUBLIC_ROUTES: 인증 없이 접근 가능한 공개 페이지
 * - PROTECTED_ROUTES: 인증이 필요한 보호된 페이지
 */

/**
 * 공개 페이지 경로
 * 토큰 없이도 자유롭게 접근 가능
 */
export const PUBLIC_ROUTES = [
  'auth/login',
  'auth/signup',
  'product',
] as const;

/**
 * 보호된 페이지 경로
 * 토큰이 필요하며, 없을 경우 로그인 페이지로 리다이렉트
 */
export const PROTECTED_ROUTES = [
  '(tabs)',
  'auth/profile',
  'auth/survey',
] as const;

/**
 * 주어진 segments가 공개 경로인지 확인
 * @param segments - 현재 라우트 segments 배열
 * @returns 공개 경로이면 true
 */
export function isPublicRoute(segments: string[]): boolean {
  if (!segments || segments.length === 0) return false;
  
  const currentPath = segments.join('/');
  
  return PUBLIC_ROUTES.some(route => {
    // 정확히 일치하거나, 시작 부분이 일치하는 경우 (하위 경로 포함)
    return currentPath === route || currentPath.startsWith(route + '/');
  });
}

/**
 * 주어진 segments가 보호된 경로인지 확인
 * @param segments - 현재 라우트 segments 배열
 * @returns 보호된 경로이면 true
 */
export function isProtectedRoute(segments: string[]): boolean {
  if (!segments || segments.length === 0) return false;
  
  const currentPath = segments.join('/');
  
  return PROTECTED_ROUTES.some(route => {
    return currentPath === route || currentPath.startsWith(route + '/');
  });
}
