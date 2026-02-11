// app/product/ingredientUtils.tsx

// -------------------------------------------------------------------------
// 성분 분석 유틸리티 (백엔드 데이터 기반)
// -------------------------------------------------------------------------

// 분석 결과 타입 정의
export interface IngredientAnalysisResult {
  totalCount: number;
  safeCount: number;      // 안전 (그린)
  warningCount: number;   // 주의 (옐로우 - 20가지/알레르기 포함)
  dangerCount: number;    // 위험 (레드 - 법적 금지/한도)
  
  caution20List: string[]; // 발견된 20가지 주의 성분 이름
  allergyList: string[];   // 발견된 알레르기 성분 이름
}

// 분석 대상 성분 인터페이스 (백엔드 DTO와 일치)
export interface SimpleIngredient {
  name: string;
  isHarmful: boolean; // 법적 규제
  isCaution?: boolean; // 20가지 주의 (백엔드에서 줌)
  isAllergy?: boolean; // 알레르기 (백엔드에서 줌)
  division?: string;
}

// 분석 함수
export const analyzeIngredients = (ingredients: SimpleIngredient[]): IngredientAnalysisResult => {
  // 데이터가 없으면 0으로 리턴
  if (!ingredients || ingredients.length === 0) {
    return { totalCount: 0, safeCount: 0, warningCount: 0, dangerCount: 0, caution20List: [], allergyList: [] };
  }

  let safe = 0;
  let warning = 0;
  let danger = 0;
  
  const caution20List: string[] = [];
  const allergyList: string[] = [];

  ingredients.forEach(ing => {
    // 1. 위험 (법적 규제 - 식약처 금지/한도)
    if (ing.isHarmful) {
      danger++;
    } 
    // 2. 주의 (20가지 주의 성분 OR 알레르기 유발 성분)
    // 백엔드에서 이미 판단해서 isCaution, isAllergy 플래그를 보내줌
    else if (ing.isCaution || ing.isAllergy) {
      warning++;
    } 
    // 3. 안전 (아무것도 해당 안 됨)
    else {
      safe++;
    }

    // 상세 리스트 구성을 위해 이름 수집
    if (ing.isCaution) {
      caution20List.push(ing.name);
    }
    if (ing.isAllergy) {
      allergyList.push(ing.name);
    }
  });

  return {
    totalCount: ingredients.length,
    safeCount: safe,
    warningCount: warning,
    dangerCount: danger,
    caution20List, // 이미 정확한 이름들이므로 중복 제거나 가공 불필요
    allergyList
  };
};