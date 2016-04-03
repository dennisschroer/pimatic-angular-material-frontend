angular.module('pimaticApp').controller('LoginController', ["$scope", "auth", function ($scope, auth) {
    if (auth.user !== null) {
        // This triggers a redirect
        $scope.setState('done');
    }

    $scope.form = {};

    $scope.login = function () {
        $scope.form.message = null;
        $scope.form.busy = true;

        auth.login($scope.form.username, $scope.form.password, $scope.form.rememberMe).then(function () {
            $scope.form.busy = false;
            $scope.setState('done');
        }, function (message) {
            $scope.form.message = message;
            $scope.form.busy = false;
        });
    };
}]);