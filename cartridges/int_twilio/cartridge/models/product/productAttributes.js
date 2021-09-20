'use strict';

var base = module.superModule;
var helper = require('~/cartridge/helpers/product/productAttributes');

/**
 * @constructor
 * @classdesc Get a list of available attributes that matches provided config
 *
 * @param {dw.catalog.ProductVariationModel} variationModel - current product variation
 * @param {Object} attrConfig - attributes to select
 * @param {Array} attrConfig.attributes - an array of strings,representing the
 *                                        id's of product attributes.
 * @param {string} attrConfig.attributes - If this is a string and equal to '*' it signifies
 *                                         that all attributes should be returned.
 *                                         If the string is 'selected', then this is comming
 *                                         from something like a product line item, in that
 *                                         all the attributes have been selected.
 *
 * @param {string} attrConfig.endPoint - the endpoint to use when generating urls for
 *                                       product attributes
 * @param {string} selectedOptionsQueryParams - Selected options query params
 * @param {string} quantity - Quantity selected
 */
function VariantAttributes(variationModel, attrConfig, selectedOptionsQueryParams, quantity) {
    // Invoke the availability model on the base
    const result = [];
    base.call(result, variationModel, attrConfig, selectedOptionsQueryParams, quantity);

    const allSelectable = helper.makeAllSelectable(result, attrConfig, variationModel, selectedOptionsQueryParams, quantity);

    allSelectable.forEach(function (item) {
        this.push(item);
    }, this);
}

VariantAttributes.prototype = [];
module.exports = VariantAttributes;
