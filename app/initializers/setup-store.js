angular.module('pimaticApp').run(["store", function (store) {
    // Start the store
    store.reload();
}]);
