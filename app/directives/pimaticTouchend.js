/**
 * Directive like md-mouseup which will execute a function when the user stopped touching (touchend event)
 */
angular.module('pimaticApp').directive('pimaticTouchend', function () {
    return function (scope, element, attr) {
        element.on('touchend', function () {
            scope.$apply(function () {
                scope.$eval(attr.pimaticTouchend);
            });
        });
    };
});
