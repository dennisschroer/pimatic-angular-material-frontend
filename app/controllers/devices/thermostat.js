angular.module('pimaticApp.devices').controller('ThermostatController', [
    '$scope',
    'store',
    'events',
    'mdThemeColors',
    function ($scope, store, events, mdThemeColors) {
        $scope.themeColors = mdThemeColors;

        /**
         * Increase the set point of the thermostat.
         */
        $scope.up = function () {
            $scope.setTemperatureSetpoint($scope.getAttribute('temperatureSetpoint').value + 0.5);
        };

        /**
         * Decrease the set point of the thermostat.
         */
        $scope.down = function () {
            $scope.setTemperatureSetpoint($scope.getAttribute('temperatureSetpoint').value - 0.5);
        };

        /**
         * Set the temperature to a specific set point
         * @param setPoint The temperature to set the set point of the thermostat to.
         */
        $scope.setTemperatureSetpoint = function (setPoint) {
            var action = 'changeTemperatureTo';

            // Execute the action
            store.api.deviceAction($scope.device.id, action, {'temperatureSetpoint': setPoint}).then(function () {
                events.onDeviceActionDone($scope.device, action);
            }, function () {
                events.onDeviceActionFail($scope.device, action);
            });
        };

        /**
         * Set the mode of the thermostat to the given mode.
         * @param mode The mode to set the thermostat to.
         */
        $scope.setMode = function (mode) {
            var action = 'changeModeTo';
            // Todo indicate that mode is selected but not confirmed by backend ?

            store.api.deviceAction($scope.device.id, action, {'mode': mode}).then(function () {
                events.onDeviceActionDone($scope.device, action);
            }, function () {
                events.onDeviceActionFail($scope.device, action);
            });
        };

        /**
         * Set the temperature set point to a certain preset value.
         * @param preset The name of the preset to set the set point to.
         */
        $scope.preset = function (preset) {
            var setPoint = $scope.getConfig(preset, false);
            if (angular.isNumber(setPoint)) {
                $scope.setTemperatureSetpoint(setPoint);
            }
        };
    }
]);
