const Site = require('dw/system/Site');
const CustomObjectMgr = require('dw/object/CustomObjectMgr');
const HashMap = require('dw/util/HashMap');
const system = require('dw/system');
const Logger = require('dw/system/Logger');
const ArrayList = require('dw/util/ArrayList');
const SMSService = require('*/cartridge/services/twilio/sendSMS');
const ProductMgr = require('dw/catalog/ProductMgr');
const Transaction = require('dw/system/Transaction');
const collections = require('*/cartridge/scripts/util/collections');

/**
 * Job execution script that send sms to customers who has subscribed for notification
 */

/**
 * check if the product is in stock
 * @param product
 * @returns {boolean}
 */

const isInStock = (product) => {
    return product && product.getAvailabilityModel().isInStock();
};

/**
 * Send SMS
 * @param recipients - list with recipients
 * @param product - product that is back in stock
 */
const sendSMS = (recipients, product) => {
    const productName = product.getName();
    recipients.toArray().forEach((r)=>{
        const status = SMSService.sendSMS.call(productName, r.custom.phone);
        if (status.status === 'OK') {
            Transaction.wrap(() => {
                CustomObjectMgr.remove(r);
            });
        } else {
            Logger.error(status.errorMessage);
        }
    });
};
/**
 * Process on chunks
 * @param {dw.util.Iterator} iterator  - iterator
 * @param {number} chunkSize  - chunks size
 */
const processOnChunks = (iterator, chunkSize) => {
    let chunks = Math.ceil(iterator.count % chunkSize);
    let start = 0;

    while (chunks > 0) {
        const list = iterator.asList(start, chunkSize);
        const byProduct = collections.reduce(list, (a, v) => {
            if (!a.containsKey(v.custom.product)) {
                a.put(v.custom.product, new ArrayList());
            }
            a.get(a.custom.product).push(v);
            return a;
        }, new HashMap());

        collections.forEach(byProduct.entrySet(), (e) => {
            const product = ProductMgr.getProduct(e.key);
            if (isInStock(product)) {
                sendSMS(e.value, product);
            }
        });

        start += chunkSize;
        chunks--;
    }
};

/**
 * main job execution
 * @param _parameters - not used
 * @param _stepExecution - not used
 * @returns {dw.system.Status}
 */
const sendNotifications = (_parameters, _stepExecution) => {
    let iterator;
    try {
        const site = Site.getCurrent();
        iterator = CustomObjectMgr.queryCustomObjects(
            'twilio-back-online-notification',
            'custom.site = {0} and custom.status = {1}',
            'custom.composedKey asc',
            site.ID,
            'TO_SEND'
        );

        processOnChunks(iterator, 500);

        return new system.Status(system.Status.OK, 'FINISHED');
    } catch (e) {
        if (Logger.isErrorEnabled()) {
            Logger.error(e);
        }
        return new system.Status(system.Status.ERROR, 'ERROR');
    } finally {
        if (iterator) iterator.close();
    }
};

sendNotifications.public = true;

module.exports.sendNotifications = sendNotifications;
