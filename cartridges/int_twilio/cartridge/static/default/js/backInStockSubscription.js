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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const backToStock = __webpack_require__(1);
$(document).ready(function () {
    backToStock.submitNotification();
    backToStock.updateAvailability();
    backToStock.cleanUp();
});


/***/ }),
/* 1 */
/***/ (function(module, exports) {

const clearFormErrors = (form) => {
    $(form).find('.form-control.is-invalid').removeClass('is-invalid');
};

/**
 * Apply form validation results from the backend
 * @param form - reference to the form
 * @param response - from  backend
 */
const validate = (form, response) => {
    clearFormErrors(form);
    if (response && !response.success) {
        Object.keys(response.fields).forEach(function (key) {
            if (response.fields[key]) {
                var feedbackElement = $(form)
                    .find('[name="' + key + '"]')
                    .parent()
                    .children('.invalid-feedback');
                feedbackElement.html(response.fields[key]);
                feedbackElement.siblings('.form-control').addClass('is-invalid');
            }
        });
    }
};

/**
 * On success hide form and show message!
 * @param form - reference to the form
 */

const success = (form) => {
    form.find('.back-in-stock-actions').addClass('d-none');
    form.find('.back-in-stock-action-close').removeClass('d-none');
    form.find('.back-in-stock-success').removeClass('d-none');
    form.find('.back-in-stock-content').addClass('d-none');
};

module.exports = {
    /**
     * Submit method for back in stock form;
     */
    submitNotification: function () {
        $('form.back-in-stock').submit(function (e) {
            const $form = $(this);
            e.preventDefault();
            const url = $form.attr('action');

            $form.spinner().start();
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: $form.serialize(),
                success: function (data) {
                    $form.spinner().stop();
                    if (!data.success) {
                        validate($form, data);
                    } else {
                        success($form);
                    }
                },
                error: function (err) {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    }
                    $form.spinner().stop();
                }
            });
            return false;
        });
    },

    /**
     * On product availability change show and hide the button for subscription
     */
    updateAvailability: function () {
        $('body').on('product:updateAvailability', function (e, response) {
            const inStockButton = $('button.wow', response.$productContainer);
            $('input.back-in-stock-product', response.$productContainer).val(response.product.id);
            if (response.product.available || (!response.product.available && !response.product.readyToOrder)) {
                inStockButton.addClass('d-none');
            } else {
                inStockButton.removeClass('d-none');
            }
        });
    },
    /**
     * Clean up on modal close
     */
    cleanUp: function () {
        $('#backInStockModal').on('hidden.bs.modal', ()=>{
            const $form = $('form.back-in-stock');
            $form.find('.form-control').val('');
            clearFormErrors($form);
            $form.find('.back-in-stock-actions').removeClass('d-none');
            $form.find('.back-in-stock-action-close').addClass('d-none');
            $form.find('.back-in-stock-success').addClass('d-none');
            $form.find('.back-in-stock-content').removeClass('d-none');
        });
    }
};


/***/ })
/******/ ]);
//# sourceMappingURL=backInStockSubscription.js.map