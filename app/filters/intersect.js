angular.module('pimaticApp').filter('intersect', function () {
    /**
     * Calculate the intersection of 2 arrays.
     */
    return function (arr1, arr2) {
        return arr1.filter(function (n) {
            return arr2.indexOf(n) != -1;
        });
    };
});