module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(104);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 104:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

const util = __webpack_require__(669);
const execFile = util.promisify(__webpack_require__(129).execFile);

async function init() {
	await execFile('git', ['fetch', '--tags']);
	const {stdout: tagOnHead} = await execFile('git', ['tag', '-l', '--points-at', 'HEAD']);
	if (tagOnHead) {
		console.log('::set-output name=version::' + tagOnHead);
		console.log('No new commits since the last tag');
		return;
	}

	const {stdout: version} = await execFile('npx', ['daily-version']);
	console.log('::set-output name=version::' + version);
	await execFile('git', ['tag', version, '-m', version]);
	await execFile('git', ['push', 'origin', '-m', version]);
	console.log('::set-output name=created::yes');
}

init();


/***/ }),

/***/ 129:
/***/ (function(module) {

module.exports = require("child_process");

/***/ }),

/***/ 669:
/***/ (function(module) {

module.exports = require("util");

/***/ })

/******/ });