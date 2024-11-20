module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint', // TypeScript용 플러그인
    'prettier', // Prettier와의 통합
    'nestjs', // NestJS 관련 플러그인
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // 타입 검사 필요한 규칙 추가
    'plugin:prettier/recommended', // Prettier 통합 규칙
    'plugin:nestjs/recommended', // NestJS 관련 규칙
  ],
  root: true,
  env: {
    node: true,
    jest: true,
    es6 : true,

  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn', // 'any' 사용을 경고
    '@typescript-eslint/explicit-function-return-type': 'warn', // 함수 반환 타입 명시 권장
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // _로 시작하는 인자는 무시
    '@typescript-eslint/no-floating-promises': 'error', // Promise 처리하지 않는 경우 오류
    // NestJS 규칙
    'nestjs/no-unnecessary-dependencies': 'warn', // 불필요한 의존성 사용 경고
    'nestjs/consistent-dependencies': 'warn', // 일관성 있는 의존성 주입 강제
    'nestjs/no-empty-methods': 'warn', // 빈 메소드 사용 경고

    // 추가적인 규칙
    "no-invalid-this": "error",
    'no-duplicate-imports': 'error', // 중복된 import 금지
    'arrow-body-style': ['warn', 'as-needed'], // 화살표 함수 중괄호 사용 최소화
  },
};
