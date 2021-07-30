const server = require('server');
const csrfProtection = require('*/cartridge/scripts/middleware/csrf');
const BackInStockValidation = require('*/cartridge/scripts/validate/BackInStockValidation');
const Transaction = require('dw/system/Transaction');
const CustomObjMgr = require('dw/object/CustomObjectMgr');

/**
 * BackInStock-Submit
 * @name BackInStock-Submit
 * @function
 * @memberof BackInStock
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {serverfunction} - post
 */
server.post('Submit', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    const validated = BackInStockValidation.validate(res);
    if (validated.valid) {
        this.on('route:BeforeComplete', ()=>{
            Transaction.wrap(()=>{
                const backInStockObj = CustomObjMgr.createCustomObject('twilio-back-online-notification', validated.key);
                backInStockObj.custom.site = validated.site;
                backInStockObj.custom.catalog = validated.catalog;
                backInStockObj.custom.product = validated.product;
                backInStockObj.custom.phone = validated.phone;
                backInStockObj.custom.status = validated.status;
            });
        });
        res.json({
            success: true
        });
    }
    return next();
});

module.exports = server.exports();
