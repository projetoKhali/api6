export default {
  displayName: 'portability_example',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/portability_example',
  setupFiles: ['./jest.setup.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
};
