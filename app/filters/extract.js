angular.module('pimaticApp').filter('extract', function () {
    /**
     * Take an array of objects, extract the value belonging to the given key and return an array containing these values.
     */
    return function (arr, key) {
        return arr.map(function (value) {
            return value[key];
        });
    };
});
