angular.module('pimaticApp.settings').controller('PagesController', ["$scope", "$location", function ($scope, $location) {
    $scope.edit = function (id) {
        $location.path('/settings/pages/' + id);
    };
}]);