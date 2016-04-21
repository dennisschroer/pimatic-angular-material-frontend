/**
 * Simple directive for showing an attribute in a horizontal display.
 */
angular.module('pimaticApp').directive('attributeValue', function () {
    return {
        scope: {
            /** A reference to the attribute object. */
            attribute: '=',
            /** If true, use attribute.name for the label instead of attribute.label. */
            useName: '='
        },
        template: '<div layout="row">' +
            '<div flex layout="row" layout-align="start center" class="md-body-1">' +
            '{{useName ? attribute.name : attribute.label}}' +
            '</div>' +
            '<div><span>' +
            '{{attribute.value}} {{attribute.unit}}' +
            '</span></div>' +
            '</div>'
    };
});
