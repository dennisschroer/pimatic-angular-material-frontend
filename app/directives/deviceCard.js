angular.module('pimaticApp').directive('deviceCard', function () {
    return {
        scope: {
            device: '='
        },
        template: '<ng-include src="\'partials/devices/\' + device.template + \'.html\'"></ng-include>',
        controller: ['$scope', function ($scope) {
            /** Get the attribute with the given name. */
            $scope.getAttribute = function(name) {
                var attribute = null;
                angular.forEach($scope.device.attributes, function(value){
                    if(value.name == name) {
                        attribute = value;
                    }
                });
                return attribute;
            };
            /** Get the value for the given config name, or return defaultValue if it is not set. */
            $scope.getConfig = function(name, defaultValue) {
                // Get the value from the config, or from the defaults, or return defaultValue
                if(name in $scope.device.config){
                    return $scope.device.config;
                }else if(name in $scope.device.configDefaults){
                    return $scope.device.configDefaults[name];
                }else{
                    return defaultValue;
                }
            };
        }]
    };
});