const server = require('server');

const KEY_DELIMITER = '###';
const composeKey = (site, catalog, product, phone)=>{
    return Array.of(site, catalog, product, phone).join(KEY_DELIMITER);
};

const setPhoneInvalid  = (backInStock, message)=> {
    backInStock.valid = false;
    backInStock.backInStockSubscribe.valid = false;
    backInStock.backInStockSubscribe.phone.valid = false;
    backInStock.backInStockSubscribe.phone.error = message;
}

/**
 * Performs validation of the send notifications input and process the data.
 * @param res - response object that is used to set the fields errors if any
 * @returns {{valid: boolean}|{valid: boolean, site: string, product: string, phone: string, catalog: string, key: string, status: string}}
 */
const validate = (res) => {
    const Site = require('dw/system/Site');
    const CatalogMgr = require('dw/catalog/CatalogMgr');
    const CustomObjMgr = require('dw/object/CustomObjectMgr');
    const ProductMgr = require('dw/catalog/ProductMgr');

    const backInStock = server.forms.getForm('back-in-stock');
    const formErrors = require('*/cartridge/scripts/formErrors');


    if (!backInStock.valid) {
        setPhoneInvalid(backInStock,'Incorrect Phone Format!');
        res.json({
            success: false,
            fields: formErrors.getFormErrors(backInStock)
        });
        return {
            valid: false
        };
    }

    const productId = backInStock.backInStockSubscribe.product.htmlValue;
    const phone = backInStock.backInStockSubscribe.phone.htmlValue;
    const phoneDigits = parseInt(phone.replace(/\D/g, ''), 10);

    const product = ProductMgr.getProduct(productId);

    if (!product) {
        setPhoneInvalid(backInStock, 'Missing Product!');
        res.json({
            success: false,
            fields: formErrors.getFormErrors(backInStock)
        });
        return {
            valid: false
        };
    }

    const site = Site.getCurrent();
    const catalog = CatalogMgr.getSiteCatalog();
    const key = composeKey(site.ID, catalog.getID(), productId, phoneDigits);
    const obj = CustomObjMgr.getCustomObject('twilio-back-online-notification', key);

    if (obj) {
        setPhoneInvalid(backInStock, 'Duplicate');
        res.json({
            success: false,
            fields: formErrors.getFormErrors(backInStock)
        });
        return {
            valid: false
        };
    }

    return {
        site: site.ID,
        catalog: catalog.getID(),
        product: productId,
        phone: phoneDigits.toString(),
        key: key,
        status: 'TO_SEND',
        valid: true
    };
};

module.exports.validate = validate;
