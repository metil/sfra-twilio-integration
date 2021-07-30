const backToStock = require('./back-in-stock');
$(document).ready(function () {
    backToStock.submitNotification();
    backToStock.updateAvailability();
    backToStock.cleanUp();
});
