angular.module('pimaticApp').directive('deviceCard', ['toast', function (toast) {
    return {
        scope: {
            device: '='
        },
        template: '<ng-include src="\'partials/devices/\' + device.template + \'.html\'"></ng-include>',
        controller: ['$scope', function ($scope) {
            $scope.getAttribute = function(name) {
                var attribute = null;
                angular.forEach($scope.device.attributes, function(value){
                    if(value.name == name) {
                        attribute = value;
                    }
                });
                return attribute;
            };
        }]
    };
}]);