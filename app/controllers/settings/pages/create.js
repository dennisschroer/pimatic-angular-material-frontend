angular.module('pimaticApp.settings').controller('PagesCreateController', ["$scope", "$location", function ($scope, $location) {
    $scope.page = {};

    $scope.cancel = function ($event) {
        $event.preventDefault();
        $location.path('/settings/pages');
    };

    $scope.save = function () {
        $scope.store.add('pages', $scope.page).then(function () {
            $location.path('/settings/pages');
        });
    };
}]);