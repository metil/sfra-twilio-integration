var server = require('server');

server.extend(module.superModule);
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/**
 * Product-Show - Add backInStock form data to the product view.
 * @name Product-Show
 * @function
 * @memberof Product
 * @param {middleware} -  csrfProtection.generateToken
 * @param {serverfunction} - append
 */

server.append('Show', csrfProtection.generateToken, function (req, res, next) {
    const viewData = res.getViewData();
    viewData.backInStock = server.forms.getForm('back-in-stock');
    viewData.backInStock.clear();
    viewData.backInStock.backInStockSubscribe.product.value = viewData.product.id;
    res.setViewData(viewData);
    next();
});
module.exports = server.exports();
