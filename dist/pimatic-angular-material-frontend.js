/*! 
 * Name:        pimatic-angular-material-frontend 
 * Description: Provides an AngularJS webinterface for Pimatic with material design. 
 * Version:     0.2.1 
 * Homepage:    http://github.com/denniss17/pimatic-angular-material-frontend 
 * Date:        2016-04-22 
 */
/**
 * Create the different modules.
 * The pimaticApp module is the main module.
 * The pimaticApp.devices module contains device specific controllers or directives.
 */
angular.module('pimaticApp.configuration', []);
angular.module('pimaticApp.devices', []);
angular.module('pimaticApp.settings', []);
angular.module('pimaticApp.adapters', ['pimaticApp.configuration']);
angular.module('pimaticApp.services', ['pimaticApp.adapters', 'pimaticApp.configuration']);

/** The main module */
angular.module('pimaticApp', [
    'ngMaterial',
    'ngRoute',
    'ngMessages',
    'pimaticApp.configuration',
    'pimaticApp.devices',
    'pimaticApp.services',
    'pimaticApp.settings',
    'pascalprecht.translate',
    'mdThemeColors'
]);

angular.module('pimaticApp.configuration').provider('config', function () {
    this.environment = 'development';

    this.production = {
        title: '',
        version: 'production',
        pimaticHost: '',
        adapterName: 'websocketAdapter',
        debug: false
    };

    this.development = {
        title: 'Pimatic frontend - DEV',
        version: 'develop',
        pimaticHost: '',
        adapterName: 'fixtureAdapter',
        debug: true
    };

    this.testing = this.development;

    this.$get = function () {
        switch (this.environment){
            case 'testing':
                return this.testing;
            case 'development':
                return this.development;
            case 'production':
                return this.production;
        }
    }
});

angular.module('pimaticApp').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/home', {
        templateUrl: 'partials/home.html',
        controller: 'HomeController'
    }).when('/landing', {}).when('/about', {
        templateUrl: 'partials/about.html'
    }).when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginController'
    }).when('/home/:pageId', {
        templateUrl: 'partials/home.html',
        controller: 'HomeController'
    }).when('/settings/groups', {
        templateUrl: 'partials/settings/groups/index.html',
        controller: 'GroupsController'
    }).when('/settings/groups/create', {
        templateUrl: 'partials/settings/groups/create.html',
        controller: 'GroupsCreateController'
    }).when('/settings/groups/:id', {
        templateUrl: 'partials/settings/groups/edit.html',
        controller: 'GroupsEditController'
    }).when('/settings/devices', {
        templateUrl: 'partials/settings/devices/index.html',
        controller: 'DevicesController'
    }).otherwise({
        redirectTo: '/landing'
    });
}]);

angular.module('pimaticApp').config(['$mdThemingProvider', function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('orange');
}]);

/**
 * Base API adapter, specifies dummy methods each adapter could override.
 */
angular.module('pimaticApp.adapters').factory('baseAdapter', [
    '$q',
    function ($q) {
        return {
            store: null,

            toQueryString: function (data, prefix) {
                var self = this;
                var strings = [];
                angular.forEach(data, function (value, key) {
                    var name = angular.isUndefined(prefix) ? encodeURIComponent(key) : prefix + '[' + encodeURIComponent(key) + ']';
                    strings.push(angular.isObject(value) ? self.toQueryString(value, name) : (name) + '=' + encodeURIComponent(value));
                });
                return strings.join('&');
            },

            setStore: function (store) {
                this.store = store;
            },

            /**
             * Execute an action for a device.
             * @param deviceId string The id of the device.
             * @param actionName string The name of the action to execute.
             * @param params object Additional parameters of the action.
             * @return promise A promise.
             */
            deviceAction: function () {
                return $q(function (resolve, reject) {
                    reject();
                });
            },

            /**
             * Attempt to login with the given credentials
             * @param username string The username
             * @param password string The password
             * @param rememberMe bool Whether the user should be remembered. Defaults to false.
             * @returns promise A promise which will be resolved with the user object, or rejected with a message
             */
            login: function () {
                return $q(function (resolve, reject) {
                    reject('Not implemented');
                });
            },

            /**
             * Attempt to logout
             * @returns promise A promise which will be resolved, or rejected with a message
             */
            logout: function () {
                return $q(function (resolve, reject) {
                    reject('Not implemented');
                });
            },

            /**
             * Start the provider and reset all caches
             */
            start: function () {

            },

            /**
             * Load all objects of a certain type.
             * @param type The type to load the objects of.
             * @return promise A promise which is resolved when the data is loaded.
             */
            load: function () {
                return $q(function (resolve, reject) {
                    reject('Not implemented');
                });
            },

            /**
             * Add a new object.
             * @param type The type of the object (e.g. 'groups').
             * @param object The object to add.
             * @return promise A promise. When resolved, the final object should be passed as parameter. When rejected, an
             * error message should be passed as parameter.
             */
            add: function () {
                return $q(function (resolve, reject) {
                    reject('Not implemented');
                });
            },

            /**
             * Update an existing object.
             * @param type The type of the object (e.g. 'groups').
             * @param object The object to update.
             * @return promise A promise. When resolved, the final object should be passed as parameter. When rejected, an
             * error message should be passed as parameter.
             */
            update: function () {
                return $q(function (resolve, reject) {
                    reject('Not implemented');
                });
            },

            /**
             * Remove an existing object.
             * @param type The type of the object (e.g. 'groups').
             * @param object The object to remove.
             * @return promise A promise. When resolved, the removed should be passed as parameter. When rejected, an
             * error message should be passed as parameter.
             */
            remove: function () {
                return $q(function (resolve, reject) {
                    reject('Not implemented');
                });
            }
        };
    }
]);

angular.module('pimaticApp.adapters').factory('fixtureAdapter', [
    '$http',
    '$q',
    '$rootScope',
    'baseAdapter',
    function ($http, $q, $rootScope, baseAdapter) {

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
                        'username': 'admin',
                        'role': 'admin',
                        'permissions': {
                            'pages': 'write',
                            'rules': 'write',
                            'variables': 'write',
                            'messages': 'write',
                            'events': 'write',
                            'devices': 'write',
                            'groups': 'write',
                            'plugins': 'write',
                            'updates': 'write',
                            'controlDevices': true,
                            'restart': true
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
    }
]);

angular.module('pimaticApp.adapters').factory('websocketAdapter', [
    '$http',
    '$q',
    '$rootScope',
    '$log',
    'baseAdapter',
    'config',
    'toast',
    function ($http, $q, $rootScope, $log, baseAdapter, config, toast) {

        /*
         * Data via this provider comes asynchronously via a websocket, while the data is requested by the application
         * via the load method. This can lead to 2 situations:
         * 1. The application requests data, but the data is not there yet. A promise is returned and saved in the cache
         *    When the data is available, the promise is resolved.
         * 2. The data comes in, but there is no promise to be resolved. The data is temporarily stored in the cache.
         *    When the load() method is called while the data is already in the cache, the returned promise is resolved
         *    immediately and the cache is cleaned.
         */
        var cache = {};

        var singulars = {
            'groups': 'group'
        };

        return angular.extend({}, baseAdapter, {
            socket: null,

            /**
             * Start the provider and reset all caches
             */
            start: function () {
                cache = {};
                this.setupSocket();
            },

            /**
             * Apply changes by executing the given function
             * @param fn
             */
            apply: function (fn) {
                // This is a little hack which makes sure that $digest is only called if it is not already running
                // This is based on the solution found here:
                // http://stackoverflow.com/questions/14700865/node-js-angularjs-socket-io-connect-state-and-manually-disconnect
                //
                // It seems that sometimes after executing a device action (for example by calling GET api/device/dummy/turnOn),
                // the response of this call comes at the same time (or in the same cycle) as the received updated via the
                // socket, resulting in errors if you call $apply there. I'm not sure if it also happens in other cases.
                if ($rootScope.$$phase) {
                    fn();
                } else {
                    $rootScope.$apply(fn);
                }
            },

            setupSocket: function () {
                var store = this.store;
                var self = this;

                if (this.socket !== null) {
                    this.socket.disconnect();
                }

                this.socket = io(config.pimaticHost, {
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 3000,
                    timeout: 20000,
                    forceNew: true
                });

                // Handshaking messages
                this.socket.on('connect', function () {
                    $log.debug('websocketApi', 'connect');

                    self.socket.emit('call', {
                        id: 'errorMessageCount',
                        action: 'queryMessagesCount',
                        params: {
                            criteria: {
                                level: 'error'
                            }
                        }
                    });

                    self.socket.emit('call', {
                        id: 'guiSettings',
                        action: 'getGuiSettings',
                        params: {}
                    });

                    self.socket.emit('call', {
                        id: 'updateProcessStatus',
                        action: 'getUpdateProcessStatus',
                        params: {}
                    });
                });

                this.socket.on('error', function (error) {
                    $log.debug('websocketApi', 'error', error);
                    self.apply(function () {
                        // This triggers a redirect
                        $rootScope.setState('unauthenticated');
                    });
                });

                this.socket.on('disconnect', function () {
                    $log.debug('websocketApi', 'disconnect');
                });


                this.socket.on('hello', function (msg) {
                    $log.debug('websocketApi', 'hello', msg);
                    self.apply(function () {
                        self.store.setUser(msg);
                        // This triggers a redirect
                        $rootScope.setState('done');
                    });
                });

                // Call result
                this.socket.on('callResult', function (msg) {
                    $log.debug('websocketApi', 'callResult', msg);

                    switch (msg.id) {
                        case 'errorMessageCount':
                            break;
                        case 'guiSettings':
                            break;
                        case 'updateProcessStatus':
                            break;
                    }
                });


                // Incoming models
                this.socket.on('devices', function (devices) {
                    $log.debug('websocketApi', 'devices', devices);
                    self.handleIncomingData('devices', devices);
                });

                this.socket.on('rules', function (rules) {
                    $log.debug('websocketApi', 'rules', rules);
                    self.handleIncomingData('rules', rules);
                });

                this.socket.on('variables', function (variables) {
                    $log.debug('websocketApi', 'variables', variables);
                    self.handleIncomingData('variables', variables);
                });

                this.socket.on('pages', function (pages) {
                    $log.debug('websocketApi', 'pages', pages);
                    self.handleIncomingData('pages', pages);
                });

                this.socket.on('groups', function (groups) {
                    $log.debug('websocketApi', 'groups', groups);
                    self.handleIncomingData('groups', groups);
                });


                // Changes
                this.socket.on('deviceAttributeChanged', function (attrEvent) {
                    $log.debug('websocketApi', 'deviceAttributeChanged', attrEvent);
                    self.apply(function () {
                        var device = store.get('devices', attrEvent.deviceId);
                        if (device !== null) {
                            // Find attribute
                            angular.forEach(device.attributes, function (attribute) {
                                if (attribute.name == attrEvent.attributeName) {
                                    attribute.value = attrEvent.value;
                                    attribute.lastUpdate = attrEvent.time;
                                }
                            });
                        }
                    });
                });
                this.socket.on('variableValueChanged', function (varValEvent) {
                    $log.debug('websocketApi', 'variableValueChanged', varValEvent);
                    self.apply(function () {
                        var v = store.get('variables', varValEvent.variableName);
                        if (v !== null) {
                            v.value = varValEvent.variableValue;
                        }
                    });
                });

                // Devices
                this.socket.on('deviceChanged', function (device) {
                    $log.debug('websocketApi', 'deviceChanged', device);
                    self.apply(function () {
                        store.update('devices', device, true);
                    });
                });
                this.socket.on('deviceRemoved', function (device) {
                    $log.debug('websocketApi', 'deviceRemoved', device);
                    self.apply(function () {
                        store.remove('devices', device, true);
                    });
                });
                this.socket.on('deviceAdded', function (device) {
                    $log.debug('websocketApi', 'deviceAdded', device);
                    self.apply(function () {
                        store.add('devices', device, true);
                    });
                });
                this.socket.on('deviceOrderChanged', function (order) {
                    $log.debug('websocketApi', 'deviceOrderChanged', order);
                });

                // Pages
                this.socket.on('pageChanged', function (page) {
                    $log.debug('websocketApi', 'pageChanged', page);
                    self.apply(function () {
                        store.update('pages', page, true);
                    });
                });
                this.socket.on('pageRemoved', function (page) {
                    $log.debug('websocketApi', 'pageRemoved', page);
                    self.apply(function () {
                        store.remove('pages', page, true);
                    });
                });
                this.socket.on('pageAdded', function (page) {
                    $log.debug('websocketApi', 'pageAdded', page);
                    self.apply(function () {
                        store.add('pages', page, true);
                    });
                });
                this.socket.on('pageOrderChanged', function (order) {
                    $log.debug('websocketApi', 'pageOrderChanged', order);
                });


                // Groups
                this.socket.on('groupChanged', function (group) {
                    $log.debug('websocketApi', 'groupChanged', group);
                    self.apply(function () {
                        store.update('groups', group, true);
                    });
                });
                this.socket.on('groupRemoved', function (group) {
                    $log.debug('websocketApi', 'groupRemoved', group);
                    self.apply(function () {
                        store.remove('groups', group, true);
                    });
                });
                this.socket.on('groupAdded', function (group) {
                    $log.debug('websocketApi', 'groupAdded', group);
                    self.apply(function () {
                        store.add('groups', group, true);
                    });
                });
                this.socket.on('groupOrderChanged', function (order) {
                    $log.debug('websocketApi', 'groupOrderChanged', order);
                });


                // Rules
                this.socket.on('ruleChanged', function (rule) {
                    $log.debug('websocketApi', 'ruleChanged', rule);
                    self.apply(function () {
                        store.update('rules', rule, true);
                    });
                });
                this.socket.on('ruleAdded', function (rule) {
                    $log.debug('websocketApi', 'ruleAdded', rule);
                    self.apply(function () {
                        store.add('rules', rule, true);
                    });
                });
                this.socket.on('ruleRemoved', function (rule) {
                    $log.debug('websocketApi', 'ruleRemoved', rule);
                    self.apply(function () {
                        store.remove('rules', rule, true);
                    });
                });
                this.socket.on('ruleOrderChanged', function (order) {
                    $log.debug('websocketApi', 'ruleOrderChanged', order);
                });

                // Variables
                this.socket.on('variableChanged', function (variable) {
                    $log.debug('websocketApi', 'variableChanged', variable);
                    self.apply(function () {
                        store.update('variables', variable, true);
                    });
                });
                this.socket.on('variableAdded', function (variable) {
                    $log.debug('websocketApi', 'variableAdded', variable);
                    self.apply(function () {
                        store.add('variables', variable, true);
                    });
                });
                this.socket.on('variableRemoved', function (variable) {
                    $log.debug('websocketApi', 'variableRemoved', variable);
                    self.apply(function () {
                        store.remove('variables', variable, true);
                    });
                });
                this.socket.on('variableOrderChanged', function (order) {
                    $log.debug('websocketApi', 'variableOrderChanged', order);
                });

                this.socket.on('updateProcessStatus', function (statusEvent) {
                    $log.debug('websocketApi', 'updateProcessStatus', statusEvent);
                });
                this.socket.on('updateProcessMessage', function (msgEvent) {
                    $log.debug('websocketApi', 'updateProcessMessage', msgEvent);
                });

                this.socket.on('messageLogged', function (entry) {
                    $log.debug('websocketApi', 'messageLogged', entry);
                    if (entry.level != 'debug') {
                        toast.show(entry.msg);
                    }
                });
            },

            /**
             * Attempt to login with the given credentials
             * @param username string The username
             * @param password string The password
             * @param rememberMe bool Whether the user should be remembered. Defaults to false.
             * @returns promise A promise which will be resolved with the user object, or rejected with a message
             */
            login: function (username, password, rememberMe) {
                return $q(function (resolve, reject) {
                    var data = {
                        username: username,
                        password: password
                    };
                    if (rememberMe) {
                        data.rememberMe = true;
                    }

                    $http.post(pimaticHost + '/login', data)
                        .success(function (data) {
                            if (data.success) {
                                resolve({
                                    username: data.username,
                                    rememberMe: data.rememberMe,
                                    role: data.role
                                });
                            } else {
                                reject(data.message);
                            }
                        }).error(function (data) {
                        reject(data.message);
                    });
                });
            },

            /**
             * Attempt to logout
             * @returns promise A promise which will be resolved, or rejected with a message
             */
            logout: function () {
                return $q(function (resolve) {
                    $http.get(pimaticHost + '/logout')
                        .success(function () {
                            resolve();
                        }).error(function () {
                        // Succesfull logout gives a 401
                        resolve();
                    });
                });
            },

            handleIncomingData: function (type, data) {
                if (type in cache && 'promises' in cache[type]) {
                    // Resolve promises
                    angular.forEach(cache[type].promises, function (deffered) {
                        deffered.resolve(data);
                    });

                    // Clear cache
                    delete cache[type];
                } else {
                    // Cache data
                    cache[type] = {};
                    cache[type].data = data;
                }
            },

            deviceAction: function (deviceId, actionName, params) {
                var self = this;
                return $q(function (resolve, reject) {
                    var url = pimaticHost + '/api/device/' + deviceId + '/' + actionName;
                    if (!angular.isUndefined(params) && angular.isObject(params)) {
                        url += '?' + self.toQueryString(params);
                    }

                    $http.get(url)
                        .success(function (data) {
                            if (data.success) {
                                resolve();
                            } else {
                                reject();
                            }
                        }).error(function () {
                        reject();
                    });
                });
            },

            /**
             * Add a new object.
             * @param type The type of the object (e.g. 'groups').
             * @param object The object to add.
             * @return promise A promise which is resolved when the object is added.
             */
            add: function (type, object) {
                return $q(function (resolve, reject) {
                    var singular = singulars[type];
                    var data = {};
                    data[singular] = object;
                    $http.post(pimaticHost + '/api/' + type + '/' + object.id, data).then(function (response) {
                        resolve(response[singular]);
                    }, function (response) {
                        reject(response.message);
                    });
                });
            },

            /**
             * Update an existing object.
             * @param type The type of the object (e.g. 'groups').
             * @param object The object to update.
             * @return promise A promise. When resolved, the final object should be passed as parameter. When rejected, an
             * error message should be passed as parameter.
             */
            update: function (type, object) {
                return $q(function (resolve, reject) {
                    var singular = singulars[type];
                    var data = {};
                    data[singular] = object;
                    $http.patch(pimaticHost + '/api/' + type + '/' + object.id, data).then(function (response) {
                        resolve(response[singular]);
                    }, function (response) {
                        reject(response.message);
                    });
                });
            },

            /**
             * Remove an existing object.
             * @param type The type of the object (e.g. 'groups').
             * @param object The object to remove.
             * @return promise A promise. When resolved, the removed should be passed as parameter. When rejected, an
             * error message should be passed as parameter.
             */
            remove: function (type, object) {
                return $q(function (resolve, reject) {
                    $http.delete(pimaticHost + '/api/' + type + '/' + object.id).then(function (response) {
                        resolve(response.removed);
                    }, function (response) {
                        reject(response.message);
                    });
                });
            },

            /**
             * Load all objects of a certain type.
             * @param type The type to load the objects of.
             * @return promise promise A promise which is resolved when the data is loaded.
             */
            load: function (type) {
                var promise;
                var defered;

                // Check if the data is cached
                if (type in cache && 'data' in cache[type]) {
                    promise = $q(function (resolve) {
                        // Resolve immediately
                        resolve(cache[type].data);
                    });

                    // Clear cache
                    delete cache[type];

                    // Return the promise
                    return promise;
                } else {
                    // Data is not cached. We will create a promise and store this promise

                    // Create a promise
                    defered = $q.defer();

                    // Add the promise
                    if (angular.isUndefined(cache[type])) {
                        cache[type] = {};
                    }
                    if (angular.isUndefined(cache[type].promises)) {
                        cache[type].promises = [];
                    }
                    cache[type].promises.push(defered);

                    // Return the promise
                    return defered.promise;
                }
            }
        });
    }
]);

/**
 * The store is responsible for keeping the references to the different models or requesting them via the specified
 * ApiProvider. Users can request models from the store. If the models are in the store, the models are directly returned.
 * If the models are not in the store, the models are requested via the specified ApiProvider
 */

angular.module('pimaticApp.services').factory('auth', [
    'store',
    '$injector',
    '$location',
    '$q',
    function (store, $injector, $location, $q) {
        var auth = {
            store: store,

            isLoggedIn: function () {
                return store.getUser() !== null;
            },

            /**
             * Attempt to login with the given credentials
             * @param username string The username
             * @param password string The password
             * @param rememberMe bool Whether the user should be remembered. Defaults to false.
             * @returns promise A promise which will be resolved with the user object, or rejected with a message
             */
            login: function (username, password, rememberMe) {
                var self = this;
                return $q(function (resolve, reject) {
                    self.store.api.login(username, password, rememberMe).then(function (user) {
                        store.reload();
                        store.setUser(user);
                        //store.add('user',user);
                        //self.setUser(user, true);
                        resolve(user);
                    }, reject);
                });
            },

            logout: function () {
                var self = this;
                return $q(function (resolve, reject) {
                    self.store.api.logout().then(function () {
                        // Remove user
                        store.setUser(null);
                        // Reset store
                        store.reset();
                        // Resolve
                        resolve();
                    }, reject);

                });
            }
        };

        return auth;
    }
]);

angular.module('pimaticApp.services').factory('events', [
    'toast',
    function (toast) {
        return {
            onDeviceActionDone: function (device, action/*, params*/) {
                toast.show('Done: ' + action + ' ' + device.id);
            },

            onDeviceActionFail: function (device, action/*, params*/) {
                toast.error('Fail: ' + action + ' ' + device.id);
            }
        };
    }
]);

/**
 * The store is responsible for keeping the references to the different models or requesting them via the specified
 * Api. Users can request models from the store. If the models are in the store, the models are directly returned.
 * If the models are not in the store, the models are requested via the specified Api
 */

angular.module('pimaticApp.services').provider('store', function () {
    var self = this;

    this.$get = [
        '$q',
        '$log',
        '$injector',
        'config',
        function ($q, $log, $injector, config) {
            self.store.$q = $q;
            self.store.$log = $log;
            self.store.adapter = $injector.get(config.adapterName);
            return self.store;
        }
    ];

    this.store = {
        adapter: null,
        store: {},

        /**
         * Reset the store and retrieve all objects from the API provider again
         */
        reset: function () {
            this.$log.debug('=== STORE RESET ===');

            this.store = {
                user: {timestamp: 0, loading: false, data: null},
                devices: {timestamp: 0, loading: false, data: []},
                groups: {timestamp: 0, loading: false, data: []},
                pages: {timestamp: 0, loading: false, data: []},
                rules: {timestamp: 0, loading: false, data: []},
                variables: {timestamp: 0, loading: false, data: []}
            };

            this.adapter.setStore(this);
        },

        reload: function () {
            this.reset();
            this.adapter.start();
        },

        isLoading: function (type) {
            return this.store[type].loading;
        },

        getUser: function () {
            return this.store.user.data;
        },

        setUser: function (user) {
            this.store.user.data = user;
        },

        /**
         * Retrieve a list of models or a single model. If the requested models are not yet loaded, either
         * an empty list or an empty object is returned which is filled when the models are provided by the adapterProvider.
         * @param type The type of the model to load.
         * @param id Optional the id of the model to load. If undefined, all instances will be returned.
         * @param skipApi Optional indicates if the call to the API should be skipped. Defaults to false;
         * @returns list|object A list of models or a single instance.
         */
        get: function (type, id, skipApi) {
            var self = this;
            var item;
            var date;

            if (type in self.store) {
                // Check if data is already fetched
                if (self.store[type].timestamp === 0 && !self.store[type].loading) {
                    self.store[type].loading = true;

                    // Fetch data via the API
                    if (!skipApi) {
                        self.adapter.load(type).then(function (data) {
                            // Merge the objects
                            self.store[type].data = data;

                            date = new Date();
                            self.store[type].timestamp = date.getTime();

                            self.store[type].loading = false;
                        }, function () {
                            // Set to false, so it can be retried
                            self.store[type].loading = false;
                        });
                    }
                }

                if (angular.isUndefined(id)) {
                    // Return all data
                    return self.store[type].data;
                } else {
                    // Return single item, or null
                    item = null;
                    angular.forEach(self.store[type].data, function (value) {
                        if (value.id == id) {
                            item = value;
                        }
                    });
                    
                    return item;
                }
            } else {
                // Not valid, return null or empty list
                return angular.isUndefined(id) ? [] : null;
            }
        },

        /**
         * Add a new object of the given type
         * @param type The type of the object to add
         * @param object The object to add
         * @param skipApi bool Optional, whether to skip the call to the api or not. Typical use case for this is when
         * the addition is originated from the server. Defaults to false
         */
        add: function (type, object, skipApi) {
            var adapter = this.adapter;
            var self = this;
            var add;

            this.$log.debug('store', 'add()', 'type=', type, 'object=', object, 'skipApi=', skipApi);

            // Help function
            // This function is needed because otherwise creating a new object would result in a double addition (first
            // by calling the API and adding it on success, the by the message passed from the server via the websocket)
            add = function () {
                var current = self.get(type, object.id, skipApi);
                if (current === null) {
                    // Really new
                    return self.$q(function (resolve) {
                        self.get(type, undefined, skipApi).push(object);
                        resolve(object);
                    });
                } else {
                    // Not new, update instead
                    return self.update(type, object, skipApi);
                }
            };

            return self.$q(function (resolve, reject) {
                if (skipApi) {
                    // Add directly
                    add(object).then(function (result) {
                        resolve(result);
                    });
                } else {
                    // Call the API provider
                    adapter.add(type, object).then(function (resultingObject) {
                        // Succesfully added -> add to store
                        add(resultingObject).then(function (result) {
                            resolve(result);
                        });
                    }, function (message) {
                        // Not added
                        reject(message);
                    });
                }
            });
        },

        /**
         * Update an existing object of the given type. The updating can also be done partially: only the attributes present
         * in the data object are updated, other attributes remain untouched.
         * @param type The type of the object which is updated
         * @param object The updated object
         * @param skipApi bool Optional, whether to skip the call to the api or not. Typical use case for this is when
         * the addition is originated from the server. Defaults to false
         */
        update: function (type, object, skipApi) {
            var adapter = this.adapter;
            var self = this;

            this.$log.debug('store', 'update()', 'type=', type, 'object=', object, 'skipApi=', skipApi);


            return self.$q(function (resolve, reject) {
                var current = self.get(type, object.id);
                if (current === null) {
                    reject('Fatal: update called, but object does not exist');
                    return;
                }

                if (skipApi) {
                    // Update directly
                    angular.merge(current, object);
                    resolve(current);
                } else {
                    // Call the API provider
                    adapter.update(type, object).then(function (resultingObject) {
                        // Succesfully updated -> update in store
                        angular.merge(current, resultingObject);
                        resolve(current);
                    }, function (message) {
                        // Not updated
                        reject(message);
                    });
                }
            });
        },

        /**
         * Remove an existing object of the given type
         * @param type The type of the object which is removed
         * @param object The to be removed object
         * @param skipApi bool Optional, whether to skip the call to the api or not. Typical use case for this is when
         * the addition is originated from the server. Defaults to false
         */
        remove: function (type, object, skipApi) {
            var self = this;
            var remove;

            this.$log.debug('store', 'remove()', 'type=', type, 'object=', object, 'skipApi=', skipApi);

            if (!(type in self.store)) {
                return self.$q(function (resolve, reject) {
                    reject('Type is not valid');
                });
            }

            // Help function
            remove = function () {
                // Find index
                var index = -1;
                angular.forEach(self.store[type].data, function (value, i) {
                    index = value.id == object.id ? i : index;
                });

                // Remove object
                if (index >= 0) {
                    self.store[type].data.splice(index, 1);
                }
            };

            return self.$q(function (resolve, reject) {
                if (skipApi) {
                    // Update directly
                    remove(object);
                    resolve(object);
                } else {
                    // Call the API provider
                    self.adapter.remove(type, object).then(function (resultingObject) {
                        // Succesfully removed -> remove in store
                        remove(object);
                        resolve(resultingObject);
                    }, function (message) {
                        // Not removed
                        reject(message);
                    });
                }
            });
        }
    };
});

angular.module('pimaticApp.services').factory('toast', [
    '$mdToast',
    function ($mdToast) {
        return {
            show: function (message) {
                $mdToast.show($mdToast.simple().content(message));
            },

            error: function (message) {
                $mdToast.show($mdToast.simple().content(message));
            }
        };
    }
]);

angular.module('pimaticApp.services').factory('utils', [
    'store',
    function (store) {
        return {
            /**
             * Get a list of ids of devices which are not in a group
             * @return array An array containing the ids of the devices which are not in a group
             */
            getUngroupedDeviceIds: function () {
                var groups = store.get('groups');
                var devices = store.get('devices');
                var ungrouped = [];

                // First add all ids
                angular.forEach(devices, function (value) {
                    ungrouped.push(value.id);
                });

                // Remove ids of devices which are in a group
                angular.forEach(groups, function (group) {
                    angular.forEach(group.devices, function (deviceId) {
                        var index = ungrouped.indexOf(deviceId);
                        if (index >= 0) {
                            ungrouped.splice(index, 1);
                        }
                    });
                });

                // Return the result
                return ungrouped;
            }
        };
    }
]);

angular.module('pimaticApp').filter('elapsed', function () {
    return function (time) {
        var hours, output, minutes;

        hours = Math.floor(time / 3600);
        output = hours > 9 ? hours : '0' + hours;
        time -= hours * 3600;

        minutes = Math.floor(time / 60);
        output += ':' + (minutes > 9 ? minutes : '0' + minutes);
        time -= minutes * 60;

        output += ':' + (time > 9 ? time : '0' + time);

        return output;
    };
});

angular.module('pimaticApp').filter('extract', function () {
    /**
     * Take an array of objects, extract the value belonging to the given key and return an array containing these values.
     */
    return function (arr, key) {
        return arr.map(function (value) {
            return value[key];
        });
    };
});

angular.module('pimaticApp').filter('intersect', function () {
    /**
     * Calculate the intersection of 2 arrays.
     */
    return function (arr1, arr2) {
        return arr1.filter(function (n) {
            return arr2.indexOf(n) != -1;
        });
    };
});

angular.module('pimaticApp').controller('ApplicationController', [
    '$scope',
    '$mdSidenav',
    '$mdMedia',
    'auth',
    'config',
    function ($scope, $mdSidenav, $mdMedia, auth, config) {
    $scope.auth = auth;
    $scope.config = config;

    $scope.$mdMedia = $mdMedia;

    $scope.toggleMenu = function () {
        $mdSidenav('left').toggle();
    };

    $scope.logout = function () {
        $scope.toggleMenu();
        auth.logout().then(function () {
            $scope.setState('unauthenticated');
        });
    };
}]);

angular.module('pimaticApp.devices').controller('ButtonsController', [
    '$scope',
    'store',
    'events',
    function ($scope, store, events) {
        $scope.buttonPressed = function (button) {
            var action = 'buttonPressed';
            store.api.deviceAction($scope.device.id, action, {'buttonId': button.id}).then(function () {
                events.onDeviceActionDone($scope.device, action);
            }, function () {
                events.onDeviceActionFail($scope.device, action);
            });
        };
    }
]);

angular.module('pimaticApp.devices').controller('DimmerController', [
    '$scope',
    'store',
    'events',
    function ($scope, store, events) {
        $scope.updateDimlevel = function (attribute) {
            var action = 'changeDimlevelTo';

            store.api.deviceAction($scope.device.id, action, {'dimlevel': attribute.value}).then(function () {
                events.onDeviceActionDone($scope.device, action, {'dimlevel': attribute.value});
            }, function () {
                // Reset value
                events.onDeviceActionFail($scope.device, action, {'dimlevel': attribute.value});
                attribute.value = !attribute.value;
            });
        };
    }
]);

angular.module('pimaticApp.devices').controller('ShutterController', [
    '$scope',
    'store',
    'events',
    function ($scope, store, events) {
        $scope.moveUp = function () {
            var attribute = $scope.getAttribute('position');
            var action = attribute.value == 'up' ? 'stop' : 'moveUp';

            store.api.deviceAction($scope.device.id, action).then(function () {
                events.onDeviceActionDone($scope.device, action);
            }, function () {
                events.onDeviceActionFail($scope.device, action);
            });
        };

        $scope.moveDown = function () {
            var attribute = $scope.getAttribute('position');
            var action = attribute.value == 'down' ? 'stop' : 'moveDown';

            store.api.deviceAction($scope.device.id, action).then(function () {
                events.onDeviceActionDone($scope.device, action);
            }, function () {
                events.onDeviceActionFail($scope.device, action);
            });
        };
    }
]);

angular.module('pimaticApp.devices').controller('SwitchController', [
    '$scope',
    'store',
    'events',
    function ($scope, store, events) {
        $scope.updateValue = function (attribute) {
            var action = attribute.value ? 'turnOn' : 'turnOff';

            store.api.deviceAction($scope.device.id, action).then(function () {
                events.onDeviceActionDone($scope.device, action);
            }, function () {
                // Reset value
                attribute.value = !attribute.value;
                events.onDeviceActionFail($scope.device, action);
            });
        };
    }
]);

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

angular.module('pimaticApp.devices').controller('TimerController', [
    '$scope',
    'store',
    'events',
    function ($scope, store, events) {
        $scope.start = function () {
            var action = 'startTimer';
            store.api.deviceAction($scope.device.id, action).then(function () {
                events.onDeviceActionDone($scope.device, action);
            }, function () {
                events.onDeviceActionFail($scope.device, action);
            });
        };

        $scope.stop = function () {
            var action = 'stopTimer';
            store.api.deviceAction($scope.device.id, action).then(function () {
                events.onDeviceActionDone($scope.device, action);
            }, function () {
                events.onDeviceActionFail($scope.device, action);
            });
        };

        $scope.reset = function () {
            var action = 'resetTimer';
            store.api.deviceAction($scope.device.id, action).then(function () {
                events.onDeviceActionDone($scope.device, action);
            }, function () {
                events.onDeviceActionFail($scope.device, action);
            });
        };
    }
]);

angular.module('pimaticApp').controller('HomeController', [
    '$scope',
    '$filter',
    'utils',
    'store',
    function ($scope, $filter, utils, store) {
        $scope.selectedTab = 0;
        $scope.getUngroupedDeviceIds = utils.getUngroupedDeviceIds;

        /**
         * Get the ids of the device which are on the given page and in the given group.
         * If group is undefined, the ids of the ungrouped devices will be returned.
         * @param page The page displayed
         * @param group The group to display
         * @returns array A list of device ids
         */
        $scope.getDeviceIds = function (page, group) {
            if (angular.isUndefined(group)) {
                return $filter('intersect')($filter('extract')(page.devices, 'deviceId'), $scope.getUngroupedDeviceIds());
            } else {
                return $filter('intersect')($filter('extract')(page.devices, 'deviceId'), group.devices);
            }
        };

        $scope.getPages = function () {
            return store.get('pages');
        };

        $scope.getGroups = function () {
            return store.get('grpups');
        };

        $scope.getDevice = function (deviceId) {
            return store.get('devices', deviceId)
        };
    }
]);

angular.module('pimaticApp').controller('LoginController', [
    '$scope',
    'auth',
    function ($scope, auth) {
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
    }
]);

angular.module('pimaticApp.settings').controller('DevicesController', [
    '$scope',
    'utils',
    'store',
    function ($scope, utils, store) {
        $scope.getUngroupedDeviceIds = utils.getUngroupedDeviceIds;

        $scope.getGroups = function () {
            return store.get('grpups');
        };

        $scope.getDevice = function (deviceId) {
            return store.get('devices', deviceId)
        };
    }
]);

angular.module('pimaticApp.settings').controller('GroupsCreateController', [
    '$scope',
    '$location',
    'toast',
    'store',
    function ($scope, $location, toast, store) {
        $scope.group = {};

        $scope.cancel = function ($event) {
            $event.preventDefault();
            $location.path('settings/groups');
        };

        $scope.save = function () {
            store.add('groups', $scope.group).then(function () {
                $location.path('settings/groups');
            }, function (message) {
                toast.error('Saving group failed: ' + message);
            });
        };
    }
]);

angular.module('pimaticApp.settings').controller('GroupsEditController', [
    '$scope',
    '$location',
    '$routeParams',
    '$mdDialog',
    'toast',
    'store',
    function ($scope, $location, $routeParams, $mdDialog, toast, store) {
        $scope.group = angular.copy(store.get('groups', $routeParams.id));

        if ($scope.group === null) {
            $location.path('settings/groups');
        }

        $scope.cancel = function ($event) {
            $event.preventDefault();
            $location.path('settings/groups');
        };

        $scope.delete = function ($event) {
            var confirm;

            $event.preventDefault();
            // Appending dialog to document.body to cover sidenav in docs app
            confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete this group?')
                .content($scope.group.id)
                .ariaLabel('Delete group')
                .ok('Yes')
                .cancel('No')
                .targetEvent($event);
            $mdDialog.show(confirm).then(function () {
                // Delete group
                store.remove('groups', $scope.group).then(function () {
                    $location.path('settings/groups');
                }, function (message) {
                    toast.error('Deleting group failed: ' + message);
                });
            });
        };

        $scope.save = function () {
            store.update('groups', $scope.group).then(function () {
                $location.path('settings/groups');
            }, function (message) {
                toast.error('Saving group failed: ' + message);
            });
        };
    }
]);

angular.module('pimaticApp.settings').controller('GroupsController', [
    '$scope',
    '$location',
    'store',
    function ($scope, $location, store) {
        $scope.edit = function (id) {
            $location.path('settings/groups/' + id);
        };

        $scope.getGroups = function () {
            return store.get('groups');
        };
    }
]);

/**
 * Simple directive for showing an attribute in a horizontal display.
 */
angular.module('pimaticApp').directive('attributeValue', function () {
    return {
        scope: {
            /** A reference to the attribute object. */
            attribute: '=',
            /** If true, use attribute.name for the label instead of attribute.label. */
            useName: '='
        },
        template: '<div layout="row">' +
            '<div flex layout="row" layout-align="start center" class="md-body-1">' +
            '{{useName ? attribute.name : attribute.label}}' +
            '</div>' +
            '<div><span>' +
            '{{attribute.value}} {{attribute.unit}}' +
            '</span></div>' +
            '</div>'
    };
});

angular.module('pimaticApp').directive('deviceCard', function () {
    return {
        scope: {
            device: '='
        },
        template: '<ng-include src="\'partials/devices/\' + device.template + \'.html\'"></ng-include>',
        controller: ['$scope', function ($scope) {
            /** Get the attribute with the given name. */
            $scope.getAttribute = function (name) {
                var attribute = null;
                angular.forEach($scope.device.attributes, function (value) {
                    if (value.name == name) {
                        attribute = value;
                    }
                });
                return attribute;
            };
            /** Get the value for the given config name, or return defaultValue if it is not set. */
            $scope.getConfig = function (name, defaultValue) {
                // Get the value from the config, or from the defaults, or return defaultValue
                if (name in $scope.device.config) {
                    return $scope.device.config[name];
                } else if (name in $scope.device.configDefaults) {
                    return $scope.device.configDefaults[name];
                } else {
                    return defaultValue;
                }
            };
        }]
    };
});

/**
 * Directive like md-mouseup which will execute a function when the user stopped touching (touchend event)
 */
angular.module('pimaticApp').directive('pimaticTouchend', function () {
    return function (scope, element, attr) {
        element.on('touchend', function () {
            scope.$apply(function () {
                scope.$eval(attr.pimaticTouchend);
            });
        });
    };
});

angular.module('pimaticApp').run([
    '$rootScope',
    '$location',
    '$injector',
    '$log',
    'store',
    'auth',
    function ($rootScope, $location, $injector, $log, store, auth) {
        $rootScope.state = 'starting';
        $rootScope.redirectedFrom = null;

        $rootScope.setState = function (state) {
            $rootScope.state = state;
            if (state == 'done' || state == 'unauthenticated') {
                if (!angular.isUndefined($rootScope.redirectedFrom) && $rootScope.redirectedFrom !== null) {
                    $location.path($rootScope.redirectedFrom);
                    $log.debug('New state:', state, 'Redirecting to ', $rootScope.redirectedFrom);
                    $rootScope.redirectedFrom = null;
                } else {
                    $log.debug('New state:', state, 'Redirecting to ', state == 'unauthenticated' ? '/login' : '/home');
                    $location.path(state == 'unauthenticated' ? '/login' : '/home');
                }
            }
        };

        // register listener to watch route changes
        $rootScope.$on('$routeChangeStart', function (event, next/*, current*/) {
            if ($rootScope.state == 'starting') {
                if (next.originalPath != '/landing') {
                    $log.debug('App', 'Application is loading, redirecting to the landing page');
                    $rootScope.redirectedFrom = next.originalPath;
                    $location.path('/landing');
                }
            } else {
                if (!auth.isLoggedIn()) {
                    // no logged user, we should be going to #login
                    if (next.originalPath !== '/login') {
                        // not going to #login, we should redirect now
                        $log.debug('pimaticApp', 'Redirecting to login...');
                        $rootScope.redirectedFrom = next.originalPath;
                        $location.path('/login');
                    }
                }
            }

        });
    }
]);

angular.module('pimaticApp').run([
    'store',
    function (store) {
        store.reload();
    }
]);
