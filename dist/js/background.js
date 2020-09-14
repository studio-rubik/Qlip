/******/ (function(modules) { // webpackBootstrap
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
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/app/background.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/app/background.ts":
/*!*******************************!*\
  !*** ./src/app/background.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(/*! ./hot-reload */ "./src/app/hot-reload.js");
function publish(msg) {
    chrome.windows.getAll({ populate: true }, function (window_list) {
        for (let i = 0; i < window_list.length; i++) {
            const window = window_list[i];
            for (let j = 0; j < window.tabs.length; j++) {
                const tab = window.tabs[j];
                chrome.tabs.sendMessage(tab.id, msg);
            }
        }
    });
}
chrome.browserAction.onClicked.addListener((tab) => {
    chrome.storage.local.get(({ enabled }) => {
        console.log(enabled);
        const newVal = !(enabled == null || enabled === true);
        publish({ type: 'enabled', value: newVal });
        chrome.storage.local.set({ enabled: newVal });
    });
});


/***/ }),

/***/ "./src/app/hot-reload.js":
/*!*******************************!*\
  !*** ./src/app/hot-reload.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

const filesInDirectory = dir => new Promise (resolve =>

  dir.createReader ().readEntries (entries =>

      Promise.all (entries.filter (e => e.name[0] !== '.').map (e =>

          e.isDirectory
              ? filesInDirectory (e)
              : new Promise (resolve => e.file (resolve))
      ))
      .then (files => [].concat (...files))
      .then (resolve)
  )
)

const timestampForFilesInDirectory = dir =>
      filesInDirectory (dir).then (files =>
          files.map (f => f.name + f.lastModifiedDate).join ())

const reload = () => {

  chrome.tabs.query ({ active: true, currentWindow: true }, tabs => { // NB: see https://github.com/xpl/crx-hotreload/issues/5

      if (tabs[0]) { chrome.tabs.reload (tabs[0].id) }

      chrome.runtime.reload ()
  })
}

const watchChanges = (dir, lastTimestamp) => {

  timestampForFilesInDirectory (dir).then (timestamp => {

      if (!lastTimestamp || (lastTimestamp === timestamp)) {

          setTimeout (() => watchChanges (dir, timestamp), 1000) // retry after 1s

      } else {

          reload ()
      }
  })

}

chrome.management.getSelf (self => {

  if (self.installType === 'development') {

      chrome.runtime.getPackageDirectoryEntry (dir => watchChanges (dir))
  }
})

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC9iYWNrZ3JvdW5kLnRzIiwid2VicGFjazovLy8uL3NyYy9hcHAvaG90LXJlbG9hZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDJCQUEyQiwwQkFBMEIsRUFBRTtRQUN2RCxpQ0FBaUMsZUFBZTtRQUNoRDtRQUNBO1FBQ0E7O1FBRUE7UUFDQSxzREFBc0QsK0RBQStEOztRQUVySDtRQUNBOzs7UUFHQTtRQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUNsRkEsbUVBQXFCO0FBRXJCLFNBQVMsT0FBTyxDQUFDLEdBQVE7SUFDckIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBQyxRQUFRLEVBQUcsSUFBSSxFQUFDLEVBQUUsVUFBVSxXQUFXO1FBQzFELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3pDLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3pDLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDeEM7U0FDSjtJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUdELE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBQy9DLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRTtRQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxJQUFJLE9BQU8sS0FBSyxJQUFJLENBQUM7UUFDckQsT0FBTyxDQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUMxQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztJQUNoRCxDQUFDLENBQUMsQ0FBRTtBQUNSLENBQUMsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7QUN0Qkg7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsc0JBQXNCLG9DQUFvQyxXQUFXOztBQUVyRSxvQkFBb0I7O0FBRXBCO0FBQ0EsR0FBRztBQUNIOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLE9BQU87O0FBRVA7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLENBQUMsQyIsImZpbGUiOiJiYWNrZ3JvdW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvYXBwL2JhY2tncm91bmQudHNcIik7XG4iLCJpbXBvcnQgJy4vaG90LXJlbG9hZCdcblxuZnVuY3Rpb24gcHVibGlzaChtc2c6IGFueSkge1xuICAgIGNocm9tZS53aW5kb3dzLmdldEFsbCh7cG9wdWxhdGUgOiB0cnVlfSwgZnVuY3Rpb24gKHdpbmRvd19saXN0KSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd2luZG93X2xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHdpbmRvdyA9IHdpbmRvd19saXN0W2ldO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB3aW5kb3cudGFicy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRhYiA9IHdpbmRvdy50YWJzW2pdO1xuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwgbXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5cbmNocm9tZS5icm93c2VyQWN0aW9uLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcigodGFiKSA9PiB7IFxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldCgoeyBlbmFibGVkIH0pID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coZW5hYmxlZCk7XG4gICAgICAgIGNvbnN0IG5ld1ZhbCA9ICEoZW5hYmxlZCA9PSBudWxsIHx8IGVuYWJsZWQgPT09IHRydWUpXG4gICAgICAgIHB1Ymxpc2goe3R5cGU6ICdlbmFibGVkJywgdmFsdWU6IG5ld1ZhbH0pO1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoe2VuYWJsZWQ6IG5ld1ZhbH0pO1xuICAgIH0pIDtcbn0pO1xuIiwiY29uc3QgZmlsZXNJbkRpcmVjdG9yeSA9IGRpciA9PiBuZXcgUHJvbWlzZSAocmVzb2x2ZSA9PlxuXG4gIGRpci5jcmVhdGVSZWFkZXIgKCkucmVhZEVudHJpZXMgKGVudHJpZXMgPT5cblxuICAgICAgUHJvbWlzZS5hbGwgKGVudHJpZXMuZmlsdGVyIChlID0+IGUubmFtZVswXSAhPT0gJy4nKS5tYXAgKGUgPT5cblxuICAgICAgICAgIGUuaXNEaXJlY3RvcnlcbiAgICAgICAgICAgICAgPyBmaWxlc0luRGlyZWN0b3J5IChlKVxuICAgICAgICAgICAgICA6IG5ldyBQcm9taXNlIChyZXNvbHZlID0+IGUuZmlsZSAocmVzb2x2ZSkpXG4gICAgICApKVxuICAgICAgLnRoZW4gKGZpbGVzID0+IFtdLmNvbmNhdCAoLi4uZmlsZXMpKVxuICAgICAgLnRoZW4gKHJlc29sdmUpXG4gIClcbilcblxuY29uc3QgdGltZXN0YW1wRm9yRmlsZXNJbkRpcmVjdG9yeSA9IGRpciA9PlxuICAgICAgZmlsZXNJbkRpcmVjdG9yeSAoZGlyKS50aGVuIChmaWxlcyA9PlxuICAgICAgICAgIGZpbGVzLm1hcCAoZiA9PiBmLm5hbWUgKyBmLmxhc3RNb2RpZmllZERhdGUpLmpvaW4gKCkpXG5cbmNvbnN0IHJlbG9hZCA9ICgpID0+IHtcblxuICBjaHJvbWUudGFicy5xdWVyeSAoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSwgdGFicyA9PiB7IC8vIE5COiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3hwbC9jcngtaG90cmVsb2FkL2lzc3Vlcy81XG5cbiAgICAgIGlmICh0YWJzWzBdKSB7IGNocm9tZS50YWJzLnJlbG9hZCAodGFic1swXS5pZCkgfVxuXG4gICAgICBjaHJvbWUucnVudGltZS5yZWxvYWQgKClcbiAgfSlcbn1cblxuY29uc3Qgd2F0Y2hDaGFuZ2VzID0gKGRpciwgbGFzdFRpbWVzdGFtcCkgPT4ge1xuXG4gIHRpbWVzdGFtcEZvckZpbGVzSW5EaXJlY3RvcnkgKGRpcikudGhlbiAodGltZXN0YW1wID0+IHtcblxuICAgICAgaWYgKCFsYXN0VGltZXN0YW1wIHx8IChsYXN0VGltZXN0YW1wID09PSB0aW1lc3RhbXApKSB7XG5cbiAgICAgICAgICBzZXRUaW1lb3V0ICgoKSA9PiB3YXRjaENoYW5nZXMgKGRpciwgdGltZXN0YW1wKSwgMTAwMCkgLy8gcmV0cnkgYWZ0ZXIgMXNcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgIHJlbG9hZCAoKVxuICAgICAgfVxuICB9KVxuXG59XG5cbmNocm9tZS5tYW5hZ2VtZW50LmdldFNlbGYgKHNlbGYgPT4ge1xuXG4gIGlmIChzZWxmLmluc3RhbGxUeXBlID09PSAnZGV2ZWxvcG1lbnQnKSB7XG5cbiAgICAgIGNocm9tZS5ydW50aW1lLmdldFBhY2thZ2VEaXJlY3RvcnlFbnRyeSAoZGlyID0+IHdhdGNoQ2hhbmdlcyAoZGlyKSlcbiAgfVxufSkiXSwic291cmNlUm9vdCI6IiJ9