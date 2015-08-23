/**
 * Create the different modules.
 * The pimaticApp module is the main module.
 * The pimaticApp.devices module contains device specific controllers or directives.
 */
angular.module('pimaticApp.devices', []);
angular.module('pimaticApp', ['ngMaterial', 'ngRoute', 'pimaticApp.devices']);

/**
 * The hostname of the device running the pimatic API
 */
angular.module('pimaticApp').constant('pimaticHost', 'http://192.168.1.218');

/**
 * If true, the app will uses fixtures as responses on API calls, instead of calling the API
 */
angular.module('pimaticApp').constant('apiProvider', 'fixtureProvider');

angular.module('pimaticApp').config(function ($routeProvider) {
    $routeProvider.when('/home', {
        templateUrl: 'views/home.html',
        controller: 'HomeController'
    }).when('/home/:pageId', {
        templateUrl: 'views/home.html',
        controller: 'HomeController'
    }).otherwise({
        redirectTo: '/home'
    });


});


angular.module('pimaticApp').config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('green')
        .accentPalette('indigo');
});
angular.module('pimaticApp').factory('ApiService', function ($http, $q, $rootScope, toastService, $filter, pimaticHost, simulate) {
    /*$http({
     method: 'POST',
     url: pimaticHost + '/login',
     data: {
     username: 'admin',
     password: 'admin'
     },
     transformRequest: function(obj) {
     var str = [];
     for(var p in obj)
     str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
     return str.join("&");
     },
     headers: {
     'Content-Type': 'application/x-www-form-urlencoded'
     }
     }).success(function(data){
     console.log(data);
     });*/

    var data = {
        devices: [],
        groups: [],
        pages: [],
        rules: [],
        variables: []
    };

    var apiService = {
        socket: null,

        init: function () {
            if (simulate) {
                // Simulate by loading fixtures
                $http.get('fixtures/devices.json').success(function (devices) {
                    angular.extend(data.devices, devices);
                });
                $http.get('fixtures/groups.json').success(function (groups) {
                    angular.extend(data.groups, groups);
                });
                $http.get('fixtures/pages.json').success(function (pages) {
                    angular.extend(data.pages, pages);
                });
                $http.get('fixtures/rules.json').success(function (rules) {
                    angular.extend(data.rules, rules);
                });
                $http.get('fixtures/variables.json').success(function (variables) {
                    angular.extend(data.variables, variables);
                });
            } else {
                this.setupSocket();
            }
        },

        setupSocket: function () {
            var service = this;
            this.socket = io(pimaticHost);

            this.socket.on('connect', function () {
                console.log('connect');
            });

            this.socket.on('callResult', function (msg) {
                console.log('callResult', msg);
            });

            this.socket.on('hello', function (msg) {
                console.log('hello', msg);
            });


            // Models
            this.socket.on('devices', function (devices) {
                console.log('devices', devices);
                $rootScope.$apply(function () {
                    angular.extend(data.devices, devices);
                });
                service.watchDeviceAttributes();
            });

            this.socket.on('rules', function (rules) {
                console.log('rules', rules);
                $rootScope.$apply(function () {
                    angular.extend(data.rules, rules);
                });
            });

            this.socket.on('variables', function (variables) {
                console.log('variables', variables);
                $rootScope.$apply(function () {
                    angular.extend(data.variables, variables);
                });
            });

            this.socket.on('pages', function (pages) {
                console.log('pages', pages);
                // TODO remove pages first
                $rootScope.$apply(function () {
                    angular.extend(data.pages, pages);
                });

            });

            this.socket.on('groups', function (groups) {
                console.log('groups', groups);
                $rootScope.$apply(function () {
                    angular.extend(data.groups, groups);
                });
            });


            // Change
            this.socket.on('deviceAttributeChanged', function (attrEvent) {
                console.log('deviceAttributeChanged', attrEvent);
                $rootScope.$apply(function () {
                    var device = apiService.getDevice(attrEvent.deviceId);
                    if (device != null) {
                        // Find attribute
                        angular.forEach(device.attributes, function (attribute) {
                            if (attribute.name == attrEvent.attributeName) {
                                attribute.$skipUpload = true;
                                attribute.value = attrEvent.value;
                                attribute.lastUpdate = attrEvent.time;
                            }
                        });
                    }
                });
            });

            this.socket.on("deviceOrderChanged", function (order) {
                console.log("deviceOrderChanged", order);
            });

            this.socket.on("deviceChanged", function (device) {
                console.log("deviceChanged", device)
            });
            this.socket.on("deviceRemoved", function (device) {
                console.log("deviceRemoved", device.id)
            });
            this.socket.on("deviceAdded", function (device) {
                console.log("deviceAdded", device)
            });


            this.socket.on("pageChanged", function (page) {
                console.log("pageChanged", page)
            });
            this.socket.on("pageRemoved", function (page) {
                console.log("pageRemoved", page.id)
            });
            this.socket.on("pageAdded", function (page) {
                console.log("pageAdded", page)
            });
            this.socket.on("pageOrderChanged", function (order) {
                console.log("pageOrderChanged", order)
            });


            this.socket.on("groupChanged", function (group) {
                console.log("groupChanged", group)
            });
            this.socket.on("groupRemoved", function (group) {
                console.log("groupRemoved", group.id)
            });
            this.socket.on("groupAdded", function (group) {
                console.log("groupAdded", group)
            });
            this.socket.on("groupOrderChanged", function (order) {
                console.log("groupOrderChanged", order)
            });

            this.socket.on("ruleAdded", function (rule) {
                console.log("ruleAdded", rule)
            });
            this.socket.on("ruleChanged", function (rule) {
                console.log("ruleChanged", rule)
            });
            this.socket.on("ruleRemoved", function (rule) {
                console.log("ruleRemoved", rule.id)
            });
            this.socket.on("ruleOrderChanged", function (order) {
                console.log("ruleOrderChanged", order)
            });

            this.socket.on("variableAdded", function (variable) {
                console.log("variableAdded", variable)
            });
            this.socket.on("variableChanged", function (variable) {
                console.log("variableChanged", variable)
            });
            this.socket.on("variableValueChanged", function (varValEvent) {
                console.log("variableValueChanged", varValEvent);
                $rootScope.$apply(function () {
                    var v = apiService.getVariable(varValEvent.variableName);
                    if (v != null) v.value = varValEvent.variableValue;
                });
            });
            this.socket.on("variableRemoved", function (variable) {
                console.log("variableRemoved", variable.name)
            });
            this.socket.on("variableOrderChanged", function (order) {
                console.log("variableOrderChanged", order)
            });

            this.socket.on("updateProcessStatus", function (statusEvent) {
                console.log("updateProcessStatus", statusEvent.status)
            });
            this.socket.on("updateProcessMessage", function (msgEvent) {
                console.log("updateProcessMessage", msgEvent);
            });

            this.socket.on('messageLogged', function (entry) {
                console.log("messageLogged", entry);
                if (entry.level != 'debug') {
                    // Show toast
                    toastService.show(entry.msg);
                }
                if (entry.level == 'error') {

                }
            });
        },

        /**
         * Add a watch to each variable. This watch watches the value of the variable.
         * If it is changed and it is not readonly, we need to send the value to the backend
         */
        watchDeviceAttributes: function () {
            /*var self = this;
             angular.forEach(data.devices, function(device){
             angular.forEach(device.attributes, function(attribute){
             // Assign the unregister function to the variable, so we can use it later
             attribute.$watcher = $rootScope.$watch(function(){return attribute.value}, function(oldValue, newValue){
             if(oldValue === newValue) return;
             if(!attribute.$skipUpload){
             // Upload change
             //console.log('updateDeviceAttribute', attribute, newValue);
             //self.updateVariable(variable, newValue);
             }
             attribute.$skipUpload = false;
             });
             });
             })*/
        },

        deviceAction: function (deviceId, actionName, params) {
            return $q(function (resolve, reject) {
                $http.get('/api/device/' + deviceId + '/' + actionName)
                    .success(function (data) {
                        if (data.success) {
                            resolve();
                        } else {
                            toastService.show('Failed to exectute ' + actionName + ' of ' + deviceId + ': ' + data.message);
                            reject();
                        }
                    }).error(function (data) {
                        toastService.show('Failed to exectute ' + actionName + ' of ' + deviceId + ': ' + data.message);
                        reject();
                    });
            });
        },

        getDevices: function () {
            return data.devices;
        },
        getDevice: function (id) {
            var found = $filter('filter')(data.devices, {id: id}, true);
            return found.length ? found[0] : null;
        },
        getGroups: function () {
            return data.groups;
        },
        getPages: function () {
            return data.pages;
        },
        getRules: function () {
            return data.rules;
        },
        getVariables: function () {
            return data.variables;
        },

        getVariable: function (name) {
            var found = $filter('filter')(data.variables, {name: name}, true);
            return found.length ? found[0] : null;
        },

        /**
         * Send the variable update to the backend
         * @param variable
         * @param value
         */
        updateVariable: function (variable, value) {
            this.socket.emit('updateVariable', {
                name: variable.name,
                type: variable.type,
                value: value
            });
        }
    };

    return apiService;
});
/**
 * Base for an ApiProvider, specifies dummy methods the ApiProvider could override.
 */
angular.module('pimaticApp').factory('baseProvider', function ($q) {
    return {
        init: function () {
        },

        /**
         * Execute an action for a device.
         * @param deviceId string The id of the device.
         * @param actionName string The name of the action to execute.
         * @param params object Additional parameters of the action.
         */
        deviceAction: function (deviceId, actionName, params) {
            return $q(function (resolve, reject) {
                reject();
            });
        }
    }
});
angular.module('pimaticApp').factory('fixtureProvider', function ($http, $q, baseProvider) {

    var data = {};

    return angular.extend({}, baseProvider, {

        init: function () {
            // Simulate by loading fixtures
            $http.get('fixtures/devices.json').then(function (response) {
                data.devices = response.data;
            }, function () {
                data.devices = [];
            });
            $http.get('fixtures/groups.json').then(function (response) {
                data.groups = response.data;
            }, function () {
                data.groups = [];
            });
            $http.get('fixtures/pages.json').then(function (response) {
                data.pages = response.data;
            }, function () {
                data.pages = [];
            });
            $http.get('fixtures/rules.json').then(function (response) {
                data.rules = response.data;
            }, function () {
                data.rules = [];
            });
            $http.get('fixtures/variables.json').then(function (response) {
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
/**
 * The store is responsible for keeping the references to the different models or requesting them via the specified
 * ApiProvider. Users can request models from the store. If the models are in the store, the models are directly returned.
 * If the models are not in the store, the models are requested via the specified ApiProvider
 */

angular.module('pimaticApp').factory('store', function (apiProvider, $injector) {
    return {
        // Retrieve the provider instance from the injector
        provider: $injector.get(apiProvider),

        store: {
            devices: {timestamp: 0, data: []},
            groups: {timestamp: 0, data: []},
            pages: {timestamp: 0, data: []},
            rules: {timestamp: 0, data: []},
            variables: {timestamp: 0, data: []}
        },

        init: function () {
            this.provider.init();
        },

        /**
         * Retrieve a list of models or a single model. If the requested models are not yet loaded, either
         * an empty list or an empty object is returned which is filled when the models are provided by the apiProvider.
         * @param name The name of the model to load.
         * @param id Optional the id of the model to load. If undefined, all instances will be returned.
         * @returns list|object A list of models or a single instance.
         */
        get: function (name, id) {
            var self = this;
            if (name in self.store) {
                // Check if data is already fetched
                if (self.store[name].timestamp == 0) {
                    // Fetch data via the API
                    self.provider.load(name).then(function (data) {
                        angular.merge(self.store[name].data, data);
                        var date = new Date();
                        self.store[name].timestamp = date.getTime();

                        // Remove dummy flag
                        angular.forEach(self.store[name].data, function (value) {
                            value['$dummy'] = false;
                        })
                    });
                }

                if (angular.isUndefined(id)) {
                    // Return all data
                    return self.store[name].data;
                } else {
                    // Return single item, or null
                    var item = null;
                    angular.forEach(self.store[name].data, function (value) {
                        if (value.id == id) item = value;
                    });

                    if (item == null) {
                        item = self.createDummy(name, id);
                        self.store[name].data[id] = item;
                    }
                    return item;
                }
            } else {
                // Not valid, return null
                return null;
            }
        },

        createDummy: function (name, id) {
            var dummy = {
                $dummy: true,
                id: id
            };
            switch (name) {
                case 'devices':
                    dummy['template'] = 'dummy';
                    break;
                default:
                    break;
            }

            return dummy;
        }
    };
});
angular.module('pimaticApp').factory('toast', function ($mdToast) {
    return {
        show: function (message) {
            $mdToast.show($mdToast.simple().content(message));
        },

        deviceActionDone: function (device, action) {
            this.show('Done: ' + action + ' ' + device.id);
        },

        deviceActionFail: function (device, action) {
            this.show('Fail: ' + action + ' ' + device.id);
        }
    };
});
angular.module('pimaticApp.devices').controller('SwitchController', function ($scope, store, toast) {
    $scope.updateValue = function (attribute) {
        var action = attribute.value ? 'turnOn' : 'turnOff';

        store.provider.deviceAction($scope.device.id, action).then(function () {
            toast.deviceActionDone($scope.device, action);
        }, function () {
            // Reset value
            attribute.value = !attribute.value;
            toast.deviceActionFail($scope.device, action);
        });
    };
});
angular.module('pimaticApp.devices').controller('ThermostatController', function ($scope, store, toast) {

});
angular.module('pimaticApp').controller('HomeController', function ($scope) {
    $scope.selectedTab = 0;

    /*$scope.selectPage = function(){
     console.log('selectPage', $routeParams.pageId);
     if(!angular.isUndefined($routeParams.pageId)){
     angular.forEach($scope.pages, function(value, key){
     if(value.id == $routeParams.pageId){
     $scope.selectedTab = key;
     }
     });
     }
     };

     $scope.tabSelected = function(page){
     console.log('tabSelected', page);
     $location.path('home/' + page.id);
     }

     $scope.$watch($scope.pages, function(newVal, oldVal){
     $scope.selectPage();
     }, true);*/
});
angular.module('pimaticApp').controller('MainController', function ($scope, $mdSidenav, store) {
    $scope.init = function () {
        store.init();
        /*var socket = io.connect('http://localhost:8080', {
         query: 'username=admin&password=admin'
         });

         socket.on('connect', function(){
         console.log('connect');
         socket.emit('test', {query:1});
         })*/


        /*apiService.init();
         $scope.pages = apiService.getPages();
         $scope.devices = apiService.getDevices();
         $scope.variables = apiService.getVariables();*/
    };

    $scope.store = store;

    /*$scope.getDevice = function(id){
     var device = null
     angular.forEach($scope.devices, function(value){
     if(value.id == id) device = value;
     });
     return device;
     };*/


    $scope.toggleMenu = function () {
        $mdSidenav('left').toggle();
    };

    $scope.init();
});
angular.module('pimaticApp').directive('deviceCard', function (toast) {
    return {
        scope: {
            device: '='
        },
        template: '<ng-include src="\'views/devices/\' + device.template + \'.html\'"></ng-include>',
        //template: '<ng-include src="\'views/devices/device.html\'"></ng-include>',
        controller: function ($scope) {
            $scope.getAttribute = function (name) {
                var attribute = null;
                angular.forEach($scope.device.attributes, function (value) {
                    if (value.name == name) attribute = value;
                });
                return attribute;
            };

            /*$scope.initAttributeWatchers = function(){
             $scope.$watch(function(){ return $scope.device; }, function(newVal){
             angular.forEach($scope.device.attributes, function(attribute){
             $scope.$watch(function(){return attribute.value}, function(newVal, oldVal){
             // Do nothing on startup
             if(newVal === oldVal) return;

             // If this is a rollback or an update from the backend, do nothing
             if(attribute.$skipUpload){
             attribute.$skipUpload = false;
             return;
             }

             // Broadcast an event
             var event = $scope.$broadcast('deviceAttributeChange', attribute, newVal, oldVal);
             /*if(event.defaultPrevented){
             console.log('rollback');
             // Rollback
             // Changing the value will recursively call this listener. To avoid re-emiting, we have
             // to set a flag that a rollback is occuring
             attribute.$skipUpload = true;
             attribute.value = oldVal;
             }else{
             toast.show('Done');
             }*
             });
             });
             });
             };

             $scope.initAttributeWatchers();*/
        }
    };
});