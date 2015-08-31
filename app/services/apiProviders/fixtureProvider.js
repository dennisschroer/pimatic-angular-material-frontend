angular.module('pimaticApp').factory('fixtureProvider', function ($http, $q, baseProvider) {

    var data = {};

    return angular.extend({}, baseProvider, {
        /**
         * Start the provider and reset all caches
         */
        start: function(){
            data = {};

            // Simulate by loading fixtures
            $http.get('assets/fixtures/devices.json').then(function (response) {
                data.devices = response.data;
            }, function () {
                data.devices = [];
            });
            $http.get('assets/fixtures/groups.json').then(function (response) {
                data.groups = response.data;
            }, function () {
                data.groups = [];
            });
            $http.get('assets/fixtures/pages.json').then(function (response) {
                data.pages = response.data;
            }, function () {
                data.pages = [];
            });
            $http.get('assets/fixtures/rules.json').then(function (response) {
                data.rules = response.data;
            }, function () {
                data.rules = [];
            });
            $http.get('assets/fixtures/variables.json').then(function (response) {
                data.variables = response.data;
            }, function () {
                data.variables = [];
            });
        },

        load: function (name) {
            return $q(function (resolve) {
                while (!name in data) {
                }
                resolve(data[name]);
            })
        }
    });
});