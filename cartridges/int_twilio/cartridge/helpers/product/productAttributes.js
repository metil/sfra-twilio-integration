const urlHelper = require('*/cartridge/scripts/helpers/urlHelpers');
const collections = require('*/cartridge/scripts/util/collections');
const HashMap = require('dw/util/HashMap');
const ImageModel = require('*/cartridge/models/product/productImages');

/**
 * Determines whether a product attribute has image swatches.  Currently, the only attribute that
 *     does is Color.
 * @param {string} dwAttributeId - Id of the attribute to check
 * @returns {boolean} flag that specifies if the current attribute should be displayed as a swatch
 */
function isSwatchable(dwAttributeId) {
    const imageableAttrs = ['color'];
    return imageableAttrs.indexOf(dwAttributeId) > -1;
}

/**
 * update value to be selectable and adjusts the images
 * @param {Object} v - variation attribute
 * @param {Object} attrConfig - attributes to select
 * @param {Array} attrConfig.attributes - an array of strings,representing the
 *                                        id's of product attributes.
 * @param {string} attrConfig.attributes - If this is a string and equal to '*' it signifies
 *                                         that all attributes should be returned.
 *                                         If the string is 'selected', then this is coming
 *                                         from something like a product line item, in that
 *                                         all the attributes have been selected.
 *
 * @param {string} attrConfig.endPoint - the endpoint to use when generating urls for
 *                                       product attributes
 * @param {dw.catalog.ProductVariationModel} variationModel - model
 * @param {dw.catalog.ProductVariationAttribute} attribute - attribute
 * @param {Object} item - variant
 * @param {string} selectedOptionsQueryParams - Selected options query params
 * @param {string} quantity - Quantity selected
 * @returns {*} - updated value
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
 * @param {Array} variantValues - variants
 * @param {Object} attrConfig - attributes to select
 * @param {Array} attrConfig.attributes - an array of strings,representing the
 *                                        id's of product attributes.
 * @param {string} attrConfig.attributes - If this is a string and equal to '*' it signifies
 *                                         that all attributes should be returned.
 *                                         If the string is 'selected', then this is coming
 *                                         from something like a product line item, in that
 *                                         all the attributes have been selected.
 *
 * @param {string} attrConfig.endPoint - the endpoint to use when generating urls for
 *                                       product attributes
 * @param {dw.catalog.ProductVariationModel} variationModel - product variant
 * @param {string} selectedOptionsQueryParams - Selected options query params
 * @param {string} quantity - Quantity selected
 * @returns {*[]} - variant attributes
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

makeAllSelectable.public = true;

module.exports = { makeAllSelectable: makeAllSelectable, updateValue: updateValue, isSwatchable: isSwatchable };
