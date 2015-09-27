/*! 
 * Name:        pimatic-angular-material-frontend 
 * Description: Provides an AngularJS webinterface for Pimatic with material design. 
 * Version:     0.1.1 
 * Homepage:    http://github.com/denniss17/pimatic-angular-material-frontend 
 * Date:        2015-09-27 
 */
/**
 * Create the different modules.
 * The pimaticApp module is the main module.
 * The pimaticApp.devices module contains device specific controllers or directives.
 */
angular.module('pimaticApp.configuration', []);

/**
 * The hostname of the device running the pimatic API. Leave empty if the pimatic API is running on the same machine.
 */
angular.module('pimaticApp.configuration').constant('pimaticHost', '');
/**
 * The name of the service to use as API Provider. This makes it possible to change the API used, or use fixtures instead.
 */
angular.module('pimaticApp.configuration').constant('apiProviderName', 'apiProvider');
/**
 * If debug is true, debug messages will be
 */
//angular.module('pimaticApp.configuration').constant('debug', true);
/**
 * The title of the application.
 */
//angular.module('pimaticApp.configuration').constant('title', 'Pimatic Material');

angular.module('pimaticApp.devices', []);
angular.module('pimaticApp.settings', []);
angular.module('pimaticApp.data', ['pimaticApp.configuration']);
angular.module('pimaticApp', ['ngMaterial', 'ngRoute', 'ngMessages', 'pimaticApp.configuration', 'pimaticApp.devices', 'pimaticApp.settings', 'pimaticApp.data', 'pascalprecht.translate']);


angular.module('pimaticApp').config(['$routeProvider', '$logProvider', 'debug', function ($routeProvider, $logProvider, debug) {
    $routeProvider.when('/home', {
        templateUrl: 'partials/home.html',
        controller: 'HomeController'
    }).when('/landing', {
    }).when('/about', {
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

    debug = debug != 'false';
    $logProvider.debugEnabled(debug);
}]);

angular.module('pimaticApp').run(["$rootScope", "$location", "$injector", "$log", "store", "auth", "version", function ($rootScope, $location, $injector, $log, store, auth, version) {
    $rootScope.store = store;
    $rootScope.auth = auth;
    // Version
    $rootScope.version = version == '@@version' ? 'development' : version;

    $rootScope.state = 'starting';
    $rootScope.redirectedFrom = null;

    $rootScope.setState = function(state){
        $rootScope.state = state;
        if(state == 'done' || state == 'unauthenticated'){
            if(!angular.isUndefined($rootScope.redirectedFrom) && $rootScope.redirectedFrom !== null){
                $location.path($rootScope.redirectedFrom);
                $log.debug('New state:', state, 'Redirecting to ', $rootScope.redirectedFrom);
                $rootScope.redirectedFrom = null;
            }else{
                $log.debug('New state:', state, 'Redirecting to ', state=='unauthenticated' ? '/login' : '/home');
                $location.path(state=='unauthenticated' ? '/login' : '/home');
            }
        }
    };

    // Initialize the apiProvider, so that it can make callbacks
    //var apiProvider = $injector.get(apiProviderName);
    //apiProvider.init(store, auth);

    // Start the store
    store.reload();

    // register listener to watch route changes
    $rootScope.$on("$routeChangeStart", function (event, next/*, current*/) {
        if($rootScope.state == 'starting'){
            if (next.originalPath != "/landing") {
                $log.debug('App', 'Application is loading, redirecting to the landing page');
                $rootScope.redirectedFrom = next.originalPath;
                $location.path("/landing");
            }
        }else{
            if (!auth.isLoggedIn()) {
                // no logged user, we should be going to #login
                if (next.originalPath == "/login") {
                    // already going to #login, no redirect needed
                } else {
                    // not going to #login, we should redirect now
                    $log.debug('pimaticApp', 'Redirecting to login...');
                    $rootScope.redirectedFrom = next.originalPath;
                    $location.path("/login");
                }
            }
        }

    });
}]);


angular.module('pimaticApp').config(["$mdThemingProvider", function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('orange');
}]);
angular.module('pimaticApp.data').factory('apiProvider', ['$http', '$q', '$rootScope', '$log', 'baseProvider', 'pimaticHost', 'toast', function ($http, $q, $rootScope, $log, baseProvider, pimaticHost, toast) {

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

    return angular.extend({}, baseProvider, {
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
            if($rootScope.$$phase){
                fn();
            }else{
                $rootScope.$apply(fn);
            }
        },

        setupSocket: function () {
            var store = this.store;
            var self = this;

            if (this.socket !== null) {
                this.socket.disconnect();
            }

            this.socket = io(pimaticHost, {
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 3000,
                timeout: 20000,
                forceNew: true
            });

            // Handshaking messages
            this.socket.on('connect', function () {
                $log.debug('apiProvider', 'connect');

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
                    action: 'getGuiSetttings',
                    params: {}
                });

                self.socket.emit('call', {
                    id: 'updateProcessStatus',
                    action: 'getUpdateProcessStatus',
                    params: {}
                });
            });

            this.socket.on('error', function (error) {
                $log.debug('apiProvider', 'error', error);
                self.apply(function () {
                    //self.store.setUser(msg);
                    // This triggers a redirect
                    $rootScope.setState('unauthenticated');
                });
            });

            this.socket.on('disconnect', function () {
                $log.debug('apiProvider', 'disconnect');
            });


            this.socket.on('hello', function (msg) {
                $log.debug('apiProvider', 'hello', msg);
                self.apply(function () {
                    self.store.setUser(msg);
                    // This triggers a redirect
                    $rootScope.setState('done');
                });
            });

            // Call result
            this.socket.on('callResult', function (msg) {
                $log.debug('apiProvider', 'callResult', msg);

                switch (msg.id) {
                    case 'errorMessageCount':
                        //if(msg.success)
                        //pimatic.errorCount(msg.result.count);
                        break;
                    case 'guiSettings':
                        /*if(msg.success)
                         guiSettings = msg.result.guiSettings
                         angular.forEach(guiSettings.defaults, function(value, key){
                         unless guiSettings.config[k]?
                         guiSettings.config[k] = v
                         }
                         pimatic.guiSettings(guiSettings.config)*/
                        break;
                    case 'updateProcessStatus':
                        /*info = msg.result.info
                         pimatic.updateProcessStatus(info.status)
                         pimatic.updateProcessMessages(info.messages)*/
                        break;
                }
            });


            // Incoming models
            this.socket.on('devices', function (devices) {
                $log.debug('apiProvider', 'devices', devices);
                self.handleIncomingData('devices', devices);
            });

            this.socket.on('rules', function (rules) {
                $log.debug('apiProvider', 'rules', rules);
                self.handleIncomingData('rules', rules);
            });

            this.socket.on('variables', function (variables) {
                $log.debug('apiProvider', 'variables', variables);
                self.handleIncomingData('variables', variables);
            });

            this.socket.on('pages', function (pages) {
                $log.debug('apiProvider', 'pages', pages);
                self.handleIncomingData('pages', pages);
            });

            this.socket.on('groups', function (groups) {
                $log.debug('apiProvider', 'groups', groups);
                self.handleIncomingData('groups', groups);
            });


            // Changes
            this.socket.on('deviceAttributeChanged', function (attrEvent) {
                $log.debug('apiProvider', 'deviceAttributeChanged', attrEvent);
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
            this.socket.on("variableValueChanged", function (varValEvent) {
                $log.debug('apiProvider', "variableValueChanged", varValEvent);
                self.apply(function () {
                    var v = store.get('variables', varValEvent.variableName);
                    if (v !== null) {
                        v.value = varValEvent.variableValue;
                    }
                });
            });

            // Devices
            this.socket.on("deviceChanged", function (device) {
                $log.debug('apiProvider', "deviceChanged", device);
                self.apply(function () {
                    store.update('devices', device, true);
                });
            });
            this.socket.on("deviceRemoved", function (device) {
                $log.debug('apiProvider', "deviceRemoved", device);
                self.apply(function () {
                    store.remove('devices', device, true);
                });
            });
            this.socket.on("deviceAdded", function (device) {
                $log.debug('apiProvider', "deviceAdded", device);
                self.apply(function () {
                    store.add('devices', device, true);
                });
            });
            this.socket.on("deviceOrderChanged", function (order) {
                $log.debug('apiProvider', "deviceOrderChanged", order);
            });

            // Pages
            this.socket.on("pageChanged", function (page) {
                $log.debug('apiProvider', "pageChanged", page);
                self.apply(function () {
                    store.update('pages', page, true);
                });
            });
            this.socket.on("pageRemoved", function (page) {
                $log.debug('apiProvider', "pageRemoved", page);
                self.apply(function () {
                    store.remove('pages', page, true);
                });
            });
            this.socket.on("pageAdded", function (page) {
                $log.debug('apiProvider', "pageAdded", page);
                self.apply(function () {
                    store.add('pages', page, true);
                });
            });
            this.socket.on("pageOrderChanged", function (order) {
                $log.debug('apiProvider', "pageOrderChanged", order);
            });


            // Groups
            this.socket.on("groupChanged", function (group) {
                $log.debug('apiProvider', "groupChanged", group);
                self.apply(function () {
                    store.update('groups', group, true);
                });
            });
            this.socket.on("groupRemoved", function (group) {
                $log.debug('apiProvider', "groupRemoved", group);
                self.apply(function () {
                    store.remove('groups', group, true);
                });
            });
            this.socket.on("groupAdded", function (group) {
                $log.debug('apiProvider', "groupAdded", group);
                self.apply(function () {
                    store.add('groups', group, true);
                });
            });
            this.socket.on("groupOrderChanged", function (order) {
                $log.debug('apiProvider', "groupOrderChanged", order);
            });


            // Rules
            this.socket.on("ruleChanged", function (rule) {
                $log.debug('apiProvider', "ruleChanged", rule);
                self.apply(function () {
                    store.update('rules', rule, true);
                });
            });
            this.socket.on("ruleAdded", function (rule) {
                $log.debug('apiProvider', "ruleAdded", rule);
                self.apply(function () {
                    store.add('rules', rule, true);
                });
            });
            this.socket.on("ruleRemoved", function (rule) {
                $log.debug('apiProvider', "ruleRemoved", rule);
                self.apply(function () {
                    store.remove('rules', rule, true);
                });
            });
            this.socket.on("ruleOrderChanged", function (order) {
                $log.debug('apiProvider', "ruleOrderChanged", order);
            });

            // Variables
            this.socket.on("variableChanged", function (variable) {
                $log.debug('apiProvider', "variableChanged", variable);
                self.apply(function () {
                    store.update('variables', variable, true);
                });
            });
            this.socket.on("variableAdded", function (variable) {
                $log.debug('apiProvider', "variableAdded", variable);
                self.apply(function () {
                    store.add('variables', variable, true);
                });
            });
            this.socket.on("variableRemoved", function (variable) {
                $log.debug('apiProvider', "variableRemoved", variable);
                self.apply(function () {
                    store.remove('variables', variable, true);
                });
            });
            this.socket.on("variableOrderChanged", function (order) {
                $log.debug('apiProvider', "variableOrderChanged", order);
            });

            this.socket.on("updateProcessStatus", function (statusEvent) {
                $log.debug('apiProvider', "updateProcessStatus", statusEvent);
            });
            this.socket.on("updateProcessMessage", function (msgEvent) {
                $log.debug('apiProvider', "updateProcessMessage", msgEvent);
            });

            this.socket.on('messageLogged', function (entry) {
                $log.debug('apiProvider', "messageLogged", entry);
                if (entry.level != 'debug') {
                    // Show toast
                    toast.show(entry.msg);
                }
                if (entry.level == 'error') {

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

        deviceAction: function (deviceId, actionName/*, params*/) {
            return $q(function (resolve, reject) {
                $http.get(pimaticHost + '/api/device/' + deviceId + '/' + actionName)
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
         * @param type The type of the object (e.g. "groups").
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
         * @param type The type of the object (e.g. "groups").
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
         * @param type The type of the object (e.g. "groups").
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
            // Check if the data is cached
            if (type in cache && 'data' in cache[type]) {
                var promise = $q(function (resolve) {
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
                var deffered = $q.defer();

                // Add the promise
                if (angular.isUndefined(cache[type])) {
                    cache[type] = {};
                }
                if (angular.isUndefined(cache[type].promises)) {
                    cache[type].promises = [];
                }
                cache[type].promises.push(deffered);

                // Return the promise
                return deffered.promise;
            }
        }
    });
}]);
/**
 * Base for an ApiProvider, specifies dummy methods the ApiProvider could override.
 */
angular.module('pimaticApp.data').factory('baseProvider', ['$q', function ($q) {
    return {
        store: null,

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
                reject("Not implemented");
            });
        },

        /**
         * Attempt to logout
         * @returns promise A promise which will be resolved, or rejected with a message
         */
        logout: function () {
            return $q(function (resolve, reject) {
                reject("Not implemented");
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
                reject("Not implemented");
            });
        },

        /**
         * Add a new object.
         * @param type The type of the object (e.g. "groups").
         * @param object The object to add.
         * @return promise A promise. When resolved, the final object should be passed as parameter. When rejected, an
         * error message should be passed as parameter.
         */
        add: function () {
            return $q(function (resolve, reject) {
                reject("Not implemented");
            });
        },

        /**
         * Update an existing object.
         * @param type The type of the object (e.g. "groups").
         * @param object The object to update.
         * @return promise A promise. When resolved, the final object should be passed as parameter. When rejected, an
         * error message should be passed as parameter.
         */
        update: function () {
            return $q(function (resolve, reject) {
                reject("Not implemented");
            });
        },

        /**
         * Remove an existing object.
         * @param type The type of the object (e.g. "groups").
         * @param object The object to remove.
         * @return promise A promise. When resolved, the removed should be passed as parameter. When rejected, an
         * error message should be passed as parameter.
         */
        remove: function () {
            return $q(function (resolve, reject) {
                reject("Not implemented");
            });
        },
    };
}]);
angular.module('pimaticApp.data').factory('fixtureProvider', ['$http', '$q', 'baseProvider', function ($http, $q, baseProvider) {

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
                while (!(name in data)) {
                }
                resolve(data[name]);
            });
        }
    });
}]);
/**
 * The store is responsible for keeping the references to the different models or requesting them via the specified
 * ApiProvider. Users can request models from the store. If the models are in the store, the models are directly returned.
 * If the models are not in the store, the models are requested via the specified ApiProvider
 */

angular.module('pimaticApp').factory('auth', ['store', '$injector', '$location', '$q', function (store, $injector, $location, $q) {
    var auth = {
        store: store,

        isLoggedIn: function () {
            return store.getUser() !== null;
        },

        /*setupWatchers: function(){
            $rootScope.$watch(function(){return store.getUser()}, function(newUser, oldUser){
                if(newUser === oldUser) return;

                // New user or logout, reset the store
                if(oldUser !== null){
                    store.reload();
                }
            }, true)
        },*/

        /*setUser: function (user, reset) {
            console.log('auth', 'New user: ', user);

            // Set the user
            this.user = user;

            // Reset the store, so it can re-request all objects
            if(reset){
                store.reset();
            }

            // Redirect the user
            if (user !== null) {
                this.redirect();
            }
        },*/

        /**
         * Attempt to login with the given credentials
         * @param username string The username
         * @param password string The password
         * @param rememberMe bool Whether the user should be remembered. Defaults to false.
         * @returns promise A promise which will be resolved with the user object, or rejected with a message
         */
        login: function(username, password, rememberMe){
            var self = this;
            return $q(function(resolve, reject){
                self.store.provider.login(username, password, rememberMe).then(function(user){
                    store.reload();
                    store.setUser(user);
                    //store.add('user',user);
                    //self.setUser(user, true);
                    resolve(user);
                }, reject);
            });
        },

        logout: function(){
            var self = this;
            return $q(function(resolve, reject) {
                self.store.provider.logout().then(function(){
                    // Remove user
                    store.setUser(null);
                    // Reset store
                    store.reset();
                    // Resolve
                    resolve();
                }, reject);

            });
        },
    };

    return auth;
}]);
/**
 * The store is responsible for keeping the references to the different models or requesting them via the specified
 * ApiProvider. Users can request models from the store. If the models are in the store, the models are directly returned.
 * If the models are not in the store, the models are requested via the specified ApiProvider
 */

angular.module('pimaticApp.data').factory('store', ['$q', '$injector', '$log', 'apiProviderName', function ($q, $injector, $log, apiProviderName) {
    var store = {
        // Retrieve the provider instance from the injector
        provider: $injector.get(apiProviderName),

        store: {},

        /**
         * Reset the store and retreive all objects from the API provider again
         */
        reset: function(){
            $log.debug('=== STORE RESET ===');

            this.store = {
                user: {timestamp: 0, loading: false, data: null},
                devices: {timestamp: 0, loading: false, data: []},
                groups: {timestamp: 0, loading: false, data: []},
                pages: {timestamp: 0, loading: false, data: []},
                rules: {timestamp: 0, loading: false, data: []},
                variables: {timestamp: 0, loading: false, data: []}
            };

            this.provider.setStore(this);
        },

        reload: function(){
            this.reset();
            this.provider.start();
        },

        isLoading: function(type){
            return this.store[type].loading;
        },

        getUser: function(){
            return this.store.user.data;
        },

        setUser: function(user){
            this.store.user.data = user;
        },

        /**
         * Retrieve a list of models or a single model. If the requested models are not yet loaded, either
         * an empty list or an empty object is returned which is filled when the models are provided by the apiProvider.
         * @param type The type of the model to load.
         * @param id Optional the id of the model to load. If undefined, all instances will be returned.
         * @param skipApi Optional indicates if the call to the API should be skipped. Defaults to false;
         * @returns list|object A list of models or a single instance.
         */
        get: function (type, id, skipApi) {
            var self = this;

            if (type in self.store) {
                // Check if data is already fetched
                if (self.store[type].timestamp === 0 && !self.store[type].loading) {
                    self.store[type].loading = true;

                    // Fetch data via the API
                    if (!skipApi) {
                        self.provider.load(type).then(function (data) {
                        // Merge the objects
                        self.store[type].data = data;

                        var date = new Date();
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
                    var item = null;
                    angular.forEach(self.store[type].data, function (value) {
                        if (value.id == id) {
                            item = value;
                        }
                    });

                    //if (item == null) {
                        //item = self.createDummy(type, id);
                        //self.store[type].data.push(item);
                        //console.log("Dummy created", type, id);
                    //}
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
            var provider = this.provider;
            var self = this;

            $log.debug('store', 'add()', 'type=', type, 'object=', object, 'skipApi=', skipApi);

            // Help function
            // This function is needed because otherwise creating a new object would result in a double addition (first
            // by calling the API and adding it on success, the by the message passed from the server via the websocket)
            var add = function(){
                var current = self.get(type, object.id, skipApi);
                if(current === null){
                    // Really new
                    return $q(function(resolve){
                        self.get(type, undefined, skipApi).push(object);
                        resolve(object);
                    });
                }else{
                    // Not new, update instead
                    return self.update(type, object, skipApi);
                }
            };

            return $q(function (resolve, reject) {
                if(skipApi){
                    // Add directly
                    add(object).then(function(result){
                        resolve(result);
                    });
                }else{
                    // Call the API provider
                    provider.add(type, object).then(function (resultingObject) {
                        // Succesfully added -> add to store
                        add(resultingObject).then(function(result){
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
            var provider = this.provider;
            var self = this;

            $log.debug('store', 'update()', 'type=', type, 'object=', object, 'skipApi=', skipApi);


            return $q(function (resolve, reject) {
                var current = self.get(type, object.id);
                if(current === null){
                    reject("Fatal: update called, but object does not exist");
                    return;
                }

                if(skipApi){
                    // Update directly
                    angular.merge(current, object);
                    resolve(current);
                }else {
                    // Call the API provider
                    provider.update(type, object).then(function (resultingObject) {
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

            $log.debug('store', 'remove()', 'type=', type, 'object=', object, 'skipApi=', skipApi);

            if(!(type in self.store)){
                return $q(function(resolve, reject){
                    reject('Type is not valid');
                });
            }

            // Help function
            var remove = function(){
                // Find index
                var index = -1;
                angular.forEach(self.store[type].data, function(value, i){
                    index = value.id == object.id ? i : index;
                });

                // Remove object
                if(index>=0){
                    self.store[type].data.splice(index, 1);
                }
            };

            return $q(function (resolve, reject) {
                if(skipApi){
                    // Update directly
                    remove(object);
                    resolve(object);
                }else {
                    // Call the API provider
                    self.provider.remove(type, object).then(function (resultingObject) {
                        // Succesfully removed -> remove in store
                        remove(object);
                        resolve(resultingObject);
                    }, function (message) {
                        // Not removed
                        reject(message);
                    });
                }
            });
        },
    };

    return store;
}]);
angular.module('pimaticApp').factory('toast', ['$mdToast', function ($mdToast) {
    return {
        show: function (message) {
            $mdToast.show($mdToast.simple().content(message));
        },

        error: function (message) {
            $mdToast.show($mdToast.simple().content(message));
        },

        deviceActionDone: function (device, action) {
            this.show('Done: ' + action + ' ' + device.id);
        },

        deviceActionFail: function (device, action) {
            this.error('Fail: ' + action + ' ' + device.id);
        }
    };
}]);
angular.module('pimaticApp').factory('utils', ['store', function (store) {
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
}]);
angular.module('pimaticApp.devices').controller('SwitchController', ["$scope", "store", "toast", function ($scope, store, toast) {
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
}]);
angular.module('pimaticApp.devices').controller('ThermostatController', [/*$scope",*/ function (/*$scope*/) {

}]);
angular.module('pimaticApp').controller('HomeController', ["$scope", "utils", function ($scope, utils) {
    $scope.selectedTab = 0;
    $scope.getUngroupedDeviceIds = utils.getUngroupedDeviceIds;

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
}]);
angular.module('pimaticApp').controller('LoginController', ["$scope", "auth", function ($scope, auth) {
    if (auth.user !== null) {
        // This triggers a redirect
        $scope.setState('done');
    }

    $scope.form = {};

    $scope.login = function(){
        $scope.form.message = null;
        $scope.form.busy = true;

        auth.login($scope.form.username, $scope.form.password, $scope.form.rememberMe).then(function(){
            $scope.form.busy = false;
            $scope.setState('done');
        }, function(message){
            $scope.form.message = message;
            $scope.form.busy = false;
        });
    };
}]);
angular.module('pimaticApp').controller('MainController', ["$scope", "$mdSidenav", "$mdMedia", "auth", function ($scope, $mdSidenav, $mdMedia, auth) {
    $scope.$mdMedia = $mdMedia;

    $scope.toggleMenu = function(){
        $mdSidenav('left').toggle();
    };

    $scope.logout = function(){
        $scope.toggleMenu();
        auth.logout().then(function(){
            $scope.setState('unauthenticated');
        });
    };
}]);
angular.module('pimaticApp.settings').controller('DevicesController', ["$scope", "utils", function ($scope, utils) {
    $scope.getUngroupedDeviceIds = utils.getUngroupedDeviceIds;
}]);
angular.module('pimaticApp.settings').controller('GroupsCreateController', ["$scope", "$location", "toast", function ($scope, $location, toast) {
    $scope.group = {};

    $scope.cancel = function ($event) {
        $event.preventDefault();
        $location.path('settings/groups');
    };

    $scope.save = function () {
        $scope.store.add('groups', $scope.group).then(function () {
            $location.path('settings/groups');
        }, function (message) {
            toast.error('Saving group failed: ' + message);
        });
    };
}]);
angular.module('pimaticApp.settings').controller('GroupsEditController', ["$scope", "$location", "$routeParams", "$mdDialog", "toast", function ($scope, $location, $routeParams, $mdDialog, toast) {
    $scope.group = angular.copy($scope.store.get('groups', $routeParams.id));

    if ($scope.group === null) {
        $location.path('settings/groups');
    }

    $scope.cancel = function ($event) {
        $event.preventDefault();
        $location.path('settings/groups');
    };

    $scope.delete = function ($event) {
        $event.preventDefault();
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete this group?')
            .content($scope.group.id)
            .ariaLabel('Delete group')
            .ok('Yes')
            .cancel('No')
            .targetEvent($event);
        $mdDialog.show(confirm).then(function () {
            // Delete group
            $scope.store.remove('groups', $scope.group).then(function () {
                $location.path('settings/groups');
            }, function (message) {
                toast.error('Deleting group failed: ' + message);
            });
        });
    };

    $scope.save = function () {
        $scope.store.update('groups', $scope.group).then(function () {
            $location.path('settings/groups');
        }, function (message) {
            toast.error('Saving group failed: ' + message);
        });
    };
}]);
angular.module('pimaticApp.settings').controller('GroupsController', ["$scope", "$location", function ($scope, $location) {
    $scope.edit = function (id) {
        $location.path('settings/groups/' + id);
    };
}]);
angular.module('pimaticApp').directive('deviceCard', function () {
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
});