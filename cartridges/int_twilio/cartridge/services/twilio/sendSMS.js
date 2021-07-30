const localServiceRegistry = require('dw/svc/LocalServiceRegistry');
const HTTPRequestPart = require('dw/net/HTTPRequestPart');
const URLUtils = require('dw/web/URLUtils');
const Resource = require('dw/web/Resource')

/**
 * Sends SMS to subscriber
 * @type {dw.svc.Service}
 */
const sendSMS = localServiceRegistry.createService('sms-twilio', {
        /**
         * Compose multi-part form data request
         * @param svc - Service
         * @param product - product description that is back on-line
         * @param to - phone number of the subscriber
         * @returns {[dw.net.HTTPRequestPart, dw.net.HTTPRequestPart, dw.net.HTTPRequestPart, dw.net.HTTPRequestPart]}
         */
    createRequest: (svc, product, to) => {
        const message = Resource.msgf('msg.sms','twilio','', product);
        return [
            new HTTPRequestPart('To', to),
            new HTTPRequestPart('MessagingServiceSid', svc.getConfiguration()
                    .getCredential().custom.parameter),
            new HTTPRequestPart('Body', message)
        ];
    }
});
module.exports.sendSMS = sendSMS;
