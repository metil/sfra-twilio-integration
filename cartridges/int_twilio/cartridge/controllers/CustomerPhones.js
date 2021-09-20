const server = require('server');
const collections = require('*/cartridge/scripts/util/collections');

server.get('Show', server.middleware.https, function (req, res, next) {
    const customerPhonesForm = server.forms.getForm('customer-phones');
    customerPhonesForm.clear();
    if (session.isCustomerAuthenticated()) {
        const customer = session.getCustomer();
        const customerAddresses = customer.getAddressBook().getAddresses();
        const phones = collections.map(customerAddresses, (address) => {
            return address.phone;
        });
        res.render('product/components/customerPhones', {
            customerPhones: customerPhonesForm,
            phones: phones
        });
    }
    next();
});

module.exports = server.exports();
