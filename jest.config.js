export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'], // ここを .ts に変更
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    // import.meta のモックは不要になったため削除
  },
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.app.json', // tsconfig.app.json を使用
        babelConfig: { // Babelの設定は残すが、import.meta変換プラグインは不要
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
            '@babel/preset-react',
            '@babel/preset-typescript',
          ],
          // plugins: [] // babel-plugin-transform-import-meta は不要
        },
      },
    ],
  },
};
