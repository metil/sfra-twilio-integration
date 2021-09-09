'use strict';

var base = module.superModule;
var urlHelper = require('*/cartridge/scripts/helpers/urlHelpers');
var collections = require('*/cartridge/scripts/util/collections');
var HashMap = require('dw/util/HashMap');
var ImageModel = require('*/cartridge/models/product/productImages');

/**
 * Determines whether a product attribute has image swatches.  Currently, the only attribute that
 *     does is Color.
 * @param {string} dwAttributeId - Id of the attribute to check
 * @returns {boolean} flag that specifies if the current attribute should be displayed as a swatch
 */
function isSwatchable(dwAttributeId) {
    var imageableAttrs = ['color'];
    return imageableAttrs.indexOf(dwAttributeId) > -1;
}

/**
 *
 * @param v
 * @param attrConfig
 * @param variationModel
 * @param byAttributeID
 * @param item
 * @param selectedOptionsQueryParams
 * @param quantity
 * @returns {*}
 */
function updateValue(v, attrConfig, variationModel, attribute, item, selectedOptionsQueryParams, quantity) {
    const value = collections.find(variationModel.getAllValues(attribute), (m) => (v.id === m.getID()));
    const toUpdate = v;
    const valueUrl = (v.selected && attrConfig.endPoint !== 'Show')
        ? variationModel.urlUnselectVariationValue('Product-' + attrConfig.endPoint, attribute)
        : variationModel.urlSelectVariationValue('Product-' + attrConfig.endPoint, attribute, value);
    toUpdate.url = urlHelper.appendQueryParams(valueUrl, [selectedOptionsQueryParams,
        'quantity=' + quantity]);
    toUpdate.selectable = true;
    if (isSwatchable(item.id)) {
        toUpdate.images = new ImageModel(value, { types: ['swatch'], quantity: 'all' });
    }
    return toUpdate;
}

/**
 * Makes all values selectable and generates to none selectable url and images
 * @param variantValues
 * @param attrConfig
 * @param variationModel
 * @param selectedOptionsQueryParams
 * @param quantity
 * @returns {*[]}
 */
function makeAllSelectable(variantValues, attrConfig, variationModel, selectedOptionsQueryParams, quantity) {
    const allAttributes = variationModel.productVariationAttributes;

    const byAttributeID = collections.reduce(allAttributes, (a, v) => {
        a.put(v.attributeID, v);
        return a;
    }, new HashMap());

    const allSelectable = [];
    variantValues.forEach(item => {
        const it = item;
        const vs = [];
        item.values.forEach(v => {
            if (!v.selectable) {
                const toUpdate = updateValue(v, attrConfig, variationModel, byAttributeID.get(item.id), item, selectedOptionsQueryParams, quantity);
                vs.push(toUpdate);
                return;
            }
            vs.push(v);
        });
        it.values = vs;
        allSelectable.push(it);
    });

    return allSelectable;
}

/**
 *
 * @param variationModel
 * @param attrConfig
 * @param selectedOptionsQueryParams
 * @param quantity
 */
function variantAttributes(variationModel, attrConfig, selectedOptionsQueryParams, quantity) {
    // Invoke the availability model on the base
    const result = [];
    base.call(result, variationModel, attrConfig, selectedOptionsQueryParams, quantity);

    const allSelectable = makeAllSelectable(result, attrConfig, variationModel, selectedOptionsQueryParams, quantity);

    allSelectable.forEach(function (item) {
        this.push(item);
    }, this);
}

variantAttributes.prototype = [];
module.exports = variantAttributes;
