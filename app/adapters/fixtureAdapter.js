angular.module('pimaticApp.adapters').factory('fixtureAdapter', ['$http', '$q', '$rootScope', 'baseAdapter', function ($http, $q, $rootScope, baseAdapter) {

    var data = {};
    var deferedPromises = {};

    return angular.extend({}, baseAdapter, {
        /**
         * Start the provider and reset all caches
         */
        start: function () {
            var self = this;

            this.store.setUser(
                {
                    "username": "admin",
                    "role": "admin",
                    "permissions": {
                        "pages": "write",
                        "rules": "write",
                        "variables": "write",
                        "messages": "write",
                        "events": "write",
                        "devices": "write",
                        "groups": "write",
                        "plugins": "write",
                        "updates": "write",
                        "controlDevices": true,
                        "restart": true
                    }
                }
            );
            // This triggers a redirect
            $rootScope.setState('done');

            // Simulate by loading fixtures
            $http.get('assets/fixtures/devices.json').then(function (response) {
                self.addData('devices', response.data);
            }, function () {
                self.addData('devices', []);
            });
            $http.get('assets/fixtures/groups.json').then(function (response) {
                self.addData('groups', response.data);
            }, function () {
                self.addData('groups', []);
            });
            $http.get('assets/fixtures/pages.json').then(function (response) {
                self.addData('pages', response.data);
            }, function () {
                self.addData('pages', []);
            });
            $http.get('assets/fixtures/rules.json').then(function (response) {
                self.addData('rules', response.data);
            }, function () {
                self.addData('rules', []);
            });
            $http.get('assets/fixtures/variables.json').then(function (response) {
                self.addData('variables', response.data);
            }, function () {
                self.addData('variables', []);
            });
        },

        addData: function (name, objects) {
            data[name] = objects;
            this.checkPromises(name);
        },

        // Todo use cache from websocketApi
        checkPromises: function (name) {
            if (name in deferedPromises) {
                deferedPromises[name].resolve(data[name]);
                delete deferedPromises[name];
            }
        },

        load: function (name) {
            if (name in data) {
                return $q(function (resolve) {
                    resolve(data[name]);
                });
            } else {
                deferedPromises[name] = $q.defer();
                return deferedPromises[name].promise
            }

        }
    });
}]);
