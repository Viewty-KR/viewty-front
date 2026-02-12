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



  // 효능별 리스트

  moisturizingList: string[]; // 보습

  soothingList: string[];     // 진정

  protectionList: string[];   // 보호

  brighteningList: string[];  // 미백

}



// 분석 대상 성분 인터페이스 (백엔드 DTO와 일치)

export interface SimpleIngredient {

  name: string;

  isHarmful: boolean; // 법적 규제

  isCaution?: boolean; // 20가지 주의 (백엔드에서 줌)

  isAllergy?: boolean; // 알레르기 (백엔드에서 줌)

  division?: string;

  effectiveness?: string; // [추가] 성분 효능

}



// 분석 함수

export const analyzeIngredients = (ingredients: SimpleIngredient[]): IngredientAnalysisResult => {

  // 데이터가 없으면 초기값 리턴

  if (!ingredients || ingredients.length === 0) {

    return { 

      totalCount: 0, safeCount: 0, warningCount: 0, dangerCount: 0, 

      caution20List: [], allergyList: [], 

      moisturizingList: [], soothingList: [], protectionList: [], brighteningList: [] 

    };

  }



  let safe = 0;

  let warning = 0;

  let danger = 0;

  

  const caution20List: string[] = [];

  const allergyList: string[] = [];

  const moisturizingList: string[] = [];

  const soothingList: string[] = [];

  const protectionList: string[] = [];

  const brighteningList: string[] = [];



  ingredients.forEach(ing => {

    const isHarmful = ing.isHarmful || (ing as any).harmful;

    const isCaution = ing.isCaution || (ing as any).caution;

    const isAllergy = ing.isAllergy || (ing as any).allergy;



    if (isHarmful) danger++;

    else if (isCaution || isAllergy) warning++;

    else safe++;



    if (isCaution) caution20List.push(ing.name);

    if (isAllergy) allergyList.push(ing.name);



    // 효능별 분류 수집

    if (ing.effectiveness === "피부 보습") moisturizingList.push(ing.name);

    if (ing.effectiveness === "수렴 진정") soothingList.push(ing.name);

    if (ing.effectiveness === "피부 보호") protectionList.push(ing.name);

    if (ing.effectiveness === "피부 미백") brighteningList.push(ing.name);

  });



  return {

    totalCount: ingredients.length,

    safeCount: safe,

    warningCount: warning,

    dangerCount: danger,

    caution20List,

    allergyList,

    moisturizingList,

    soothingList,

    protectionList,

    brighteningList

  };

};
