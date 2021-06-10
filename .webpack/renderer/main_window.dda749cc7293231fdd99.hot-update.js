/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdateipxact_elec"]("main_window",{

/***/ "./node_modules/react-hot-loader/root.js":
/*!***********************************************!*\
  !*** ./node_modules/react-hot-loader/root.js ***!
  \***********************************************/
/***/ ((module, exports, __webpack_require__) => {

eval("/* module decorator */ module = __webpack_require__.nmd(module);\nif (true) {\n  var hot = __webpack_require__(/*! ./index */ \"./node_modules/react-hot-loader/index.js\").hot;\n  if (true) {\n    var cache = require.cache;\n\n    if (!module.parents || module.parents.length === 0) {\n      throw new Error(\n        'React-Hot-Loader: `react-hot-loader/root` is not supported on your system. ' +\n        'Please use `import {hot} from \"react-hot-loader\"` instead'\n      );\n    }\n    // access parent\n    var parent = cache[module.parents[0]];\n    if (!parent) {\n      throw new Error(\n        'React-Hot-Loader: `react-hot-loader/root` is not supported on your system. ' +\n        'Please use `import {hot} from \"react-hot-loader\"` instead'\n      );\n    }\n\n    // remove self from a cache\n    delete cache[module.id];\n\n    // setup hot for caller\n    exports.hot = hot(parent);\n  } else {}\n} else {}\n\nfunction fallbackHot() {\n  exports.hot = function (a) {\n    return a;\n  };\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9pcHhhY3QtZWxlYy8uL25vZGVfbW9kdWxlcy9yZWFjdC1ob3QtbG9hZGVyL3Jvb3QuanM/YzEyYiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnQkFHZ0IsT0FBTyIsImZpbGUiOiIuL25vZGVfbW9kdWxlcy9yZWFjdC1ob3QtbG9hZGVyL3Jvb3QuanMuanMiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./node_modules/react-hot-loader/root.js\n");

/***/ }),

/***/ "./src/App.tsx":
/*!*********************!*\
  !*** ./src/App.tsx ***!
  \*********************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* module decorator */ module = __webpack_require__.nmd(module);\n\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || function (mod) {\n    if (mod && mod.__esModule) return mod;\n    var result = {};\n    if (mod != null) for (var k in mod) if (k !== \"default\" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\n    __setModuleDefault(result, mod);\n    return result;\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nvar root_1 = __webpack_require__(/*! react-hot-loader/root */ \"./node_modules/react-hot-loader/root.js\");\nvar React = __importStar(__webpack_require__(/*! react */ \"./node_modules/react/index.js\"));\nvar App = function () { return React.createElement(\"div\", { className: \"absolute inset-0 bg-white text-center h-full flex flex-col justify justify-center\" }, \"TAILWIND = \\u2764\"); };\nexports.default = root_1.hot(module)(App);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9pcHhhY3QtZWxlYy8uL3NyYy9BcHAudHN4PzFjNmQiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHlHQUE0QztBQUM1Qyw0RkFBK0I7QUFFL0IsSUFBTSxHQUFHLEdBQUcsY0FBTSxvQ0FBSyxTQUFTLEVBQUMsbUZBQW1GLHdCQUFtQixFQUFySCxDQUFxSDtBQUV2SSxrQkFBZSxVQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMiLCJmaWxlIjoiLi9zcmMvQXBwLnRzeC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXIvcm9vdCc7XG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmNvbnN0IEFwcCA9ICgpID0+IDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgaW5zZXQtMCBiZy13aGl0ZSB0ZXh0LWNlbnRlciBoLWZ1bGwgZmxleCBmbGV4LWNvbCBqdXN0aWZ5IGp1c3RpZnktY2VudGVyXCI+VEFJTFdJTkQgPSDinaQ8L2Rpdj5cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoQXBwKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/App.tsx\n");

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ "use strict";
/******/ 
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("adaa39a3ef0687044a3a")
/******/ })();
/******/ 
/******/ }
);