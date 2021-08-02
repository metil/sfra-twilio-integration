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
            if (response.product.available || (response.product.productType === 'master')) {
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
