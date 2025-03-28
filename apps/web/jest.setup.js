import 'jest-canvas-mock';

import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

Object.defineProperties(window.HTMLElement.prototype, {
  clientWidth: {
    get() {
      return 800;
    },
  },
  clientHeight: {
    get() {
      return 600;
    },
  },
});
