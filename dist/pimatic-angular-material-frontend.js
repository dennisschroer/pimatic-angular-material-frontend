/*! 
 * Name:        pimatic-angular-material-frontend 
 * Description: Provides an AngularJS webinterface for pimatic with material design. 
 * Version:     0.0.1 
 * Homepage:    http://github.com/denniss17/pimatic-angular-material-frontend 
 * Date:        2015-09-17 
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

angular.module('pimaticApp.devices', []);
angular.module('pimaticApp.settings', []);
angular.module('pimaticApp.data', ['pimaticApp.configuration']);
angular.module('pimaticApp', ['ngMaterial', 'ngRoute', 'ngMessages', 'pimaticApp.configuration', 'pimaticApp.devices', 'pimaticApp.settings', 'pimaticApp.data']);


angular.module('pimaticApp').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/home', {
        templateUrl: 'partials/home.html',
        controller: 'HomeController'
    }).when('/landing', {
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
        templateUrl: 'partials/settings/devices.html',
        controller: 'DevicesController'
    }).otherwise({
        redirectTo: '/landing'
    });
}]);

angular.module('pimaticApp').run(["$rootScope", "$location", "$injector", "store", "auth", "apiProviderName", function ($rootScope, $location, $injector, store, auth, apiProviderName) {
    $rootScope.store = store;
    $rootScope.auth = auth;

    $rootScope.state = 'starting';

    $rootScope.setState = function(state){
        $rootScope.state = state;
    };

    // Initialize the apiProvider, so that it can make callbacks
    //var apiProvider = $injector.get(apiProviderName);
    //apiProvider.init(store, auth);

    // Start the store
    store.reset();

    // register listener to watch route changes
    $rootScope.$on("$routeChangeStart", function (event, next/*, current*/) {
        if($rootScope.state == 'starting'){
            if (next.originalPath != "/landing") {
                console.log('App', 'Application is loading, redirecting to the landing page');
                $location.path("/landing");
            }
        }else{
            if (!auth.isLoggedIn()) {
                // no logged user, we should be going to #login
                if (next.originalPath == "/login") {
                    // already going to #login, no redirect needed
                } else {
                    // not going to #login, we should redirect now
                    console.log('pimaticApp', 'Redirecting to login...');
                    auth.setRedirectedFrom(next.originalPath);
                    $location.path("/login");
                }
            }
        }

    });
}]);


angular.module('pimaticApp').config(["$mdThemingProvider", function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('green')
        .accentPalette('indigo');
}]);
angular.module('pimaticApp.data').factory('apiProvider', ['$http', '$q', '$rootScope', 'baseProvider', 'pimaticHost', 'toast', function ($http, $q, $rootScope, baseProvider, pimaticHost, toast) {

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
        start: function(){
            cache = {};
            this.setupSocket();
        },

        setupSocket: function () {
            var store = this.store;
            var self = this;

            if(this.socket!==null){
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
                console.log('apiProvider', 'connect');

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
            this.socket.on('hello', function (msg) {
                console.log('apiProvider', 'hello', msg);
                $rootScope.$apply(function(){
                    $rootScope.setState('loaded');
                    // This triggers a redirect
                    self.store.setUser(msg);
                });
            });

            // Call result
            this.socket.on('callResult', function (msg) {
                console.log('apiProvider', 'callResult', msg);

                switch(msg.id) {
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
                console.log('apiProvider', 'devices', devices);
                self.handleIncomingData('devices', devices);
            });

            this.socket.on('rules', function (rules) {
                console.log('apiProvider', 'rules', rules);
                self.handleIncomingData('rules', rules);
            });

            this.socket.on('variables', function (variables) {
                console.log('apiProvider', 'variables', variables);
                self.handleIncomingData('variables', variables);
            });

            this.socket.on('pages', function (pages) {
                console.log('apiProvider', 'pages', pages);
                self.handleIncomingData('pages', pages);
            });

            this.socket.on('groups', function (groups) {
                console.log('apiProvider', 'groups', groups);
                self.handleIncomingData('groups', groups);
            });


            // Changes
            this.socket.on('deviceAttributeChanged', function (attrEvent) {
                console.log('apiProvider', 'deviceAttributeChanged', attrEvent);
                $rootScope.$apply(function () {
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
                console.log('apiProvider', "variableValueChanged", varValEvent);
                //$rootScope.$apply(function () {
                var v = store.get('variables', varValEvent.variableName);
                if (v !== null){
                    v.value = varValEvent.variableValue;
                }
                //});
            });

            // Devices
            this.socket.on("deviceChanged", function (device) {
                console.log('apiProvider', "deviceChanged", device);
                $rootScope.$apply(function () {
                    store.update('devices', device, true);
                });
            });
            this.socket.on("deviceRemoved", function (device) {
                console.log('apiProvider', "deviceRemoved", device);
                $rootScope.$apply(function () {
                    store.remove('devices', device, true);
                });
            });
            this.socket.on("deviceAdded", function (device) {
                console.log('apiProvider', "deviceAdded", device);
                $rootScope.$apply(function () {
                    store.add('devices', device, true);
                });
            });
            this.socket.on("deviceOrderChanged", function (order) {
                console.log('apiProvider', "deviceOrderChanged", order);
            });

            // Pages
            this.socket.on("pageChanged", function (page) {
                console.log('apiProvider', "pageChanged", page);
                $rootScope.$apply(function () {
                    store.update('pages', page, true);
                });
            });
            this.socket.on("pageRemoved", function (page) {
                console.log('apiProvider', "pageRemoved", page);
                $rootScope.$apply(function () {
                    store.remove('pages', page, true);
                });
            });
            this.socket.on("pageAdded", function (page) {
                console.log('apiProvider', "pageAdded", page);
                $rootScope.$apply(function () {
                    store.add('pages', page, true);
                });
            });
            this.socket.on("pageOrderChanged", function (order) {
                console.log('apiProvider', "pageOrderChanged", order);
            });


            // Groups
            this.socket.on("groupChanged", function (group) {
                console.log('apiProvider', "groupChanged", group);
                $rootScope.$apply(function () {
                    store.update('groups', group, true);
                });
            });
            this.socket.on("groupRemoved", function (group) {
                console.log('apiProvider', "groupRemoved", group);
                $rootScope.$apply(function () {
                    store.remove('groups', group, true);
                });
            });
            this.socket.on("groupAdded", function (group) {
                console.log('apiProvider', "groupAdded", group);
                $rootScope.$apply(function () {
                    store.add('groups', group, true);
                });
            });
            this.socket.on("groupOrderChanged", function (order) {
                console.log('apiProvider', "groupOrderChanged", order);
            });


            // Rules
            this.socket.on("ruleChanged", function (rule) {
                console.log('apiProvider', "ruleChanged", rule);
                $rootScope.$apply(function () {
                    store.update('rules', rule, true);
                });
            });
            this.socket.on("ruleAdded", function (rule) {
                console.log('apiProvider', "ruleAdded", rule);
                $rootScope.$apply(function () {
                    store.add('rules', rule, true);
                });
            });
            this.socket.on("ruleRemoved", function (rule) {
                console.log('apiProvider', "ruleRemoved", rule);
                $rootScope.$apply(function () {
                    store.remove('rules', rule, true);
                });
            });
            this.socket.on("ruleOrderChanged", function (order) {
                console.log('apiProvider', "ruleOrderChanged", order);
            });

            // Variables
            this.socket.on("variableChanged", function (variable) {
                console.log('apiProvider', "variableChanged", variable);
                $rootScope.$apply(function () {
                    store.update('variables', variable, true);
                });
            });
            this.socket.on("variableAdded", function (variable) {
                console.log('apiProvider', "variableAdded", variable);
                $rootScope.$apply(function () {
                    store.add('variables', variable, true);
                });
            });
            this.socket.on("variableRemoved", function (variable) {
                console.log('apiProvider', "variableRemoved", variable);
                $rootScope.$apply(function () {
                    store.remove('variables', variable, true);
                });
            });
            this.socket.on("variableOrderChanged", function (order) {
                console.log('apiProvider', "variableOrderChanged", order);
            });

            this.socket.on("updateProcessStatus", function (statusEvent) {
                console.log('apiProvider', "updateProcessStatus", statusEvent);
            });
            this.socket.on("updateProcessMessage", function (msgEvent) {
                console.log('apiProvider', "updateProcessMessage", msgEvent);
            });

            this.socket.on('messageLogged', function (entry) {
                console.log('apiProvider', "messageLogged", entry);
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
        login: function(username, password, rememberMe) {
            return $q(function (resolve, reject) {
                var data = {
                    username: username,
                    password: password
                };
                if(rememberMe){
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

        handleIncomingData: function(type, data) {
            if(type in cache && 'promises' in cache[type]){
                // Resolve promises
                angular.forEach(cache[type].promises, function(deffered){
                    deffered.resolve(data);
                });

                // Clear cache
                delete cache[type];
            }else{
                // Cache data
                cache[type] = {};
                cache[type].data = data;
            }
        },

        deviceAction: function (deviceId, actionName, params) {
            return $q(function (resolve, reject) {
                $http.get(pimaticHost + '/api/device/' + deviceId + '/' + actionName)
                    .success(function (data) {
                        if (data.success) {
                            resolve();
                        } else {
                            reject();
                        }
                    }).error(function (data) {
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
            if(type in cache && 'data' in cache[type]){
                var promise = $q(function(resolve){
                    // Resolve immediately
                    resolve(cache[type].data);
                });

                // Clear cache
                delete cache[type];

                // Return the promise
                return promise;
            }else{
                // Data is not cached. We will create a promise and store this promise

                // Create a promise
                var deffered = $q.defer();

                // Add the promise
                if(angular.isUndefined(cache[type])){
                    cache[type] = {};
                }
                if(angular.isUndefined(cache[type].promises)){
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
        deviceAction: function (deviceId, actionName, params) {
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
        login: function(username, password, rememberMe) {
            return $q(function (resolve, reject) {
                reject("Not implemented");
            });
        },

        /**
         * Start the provider and reset all caches
         */
        start: function(){

        },

        /**
         * Load all objects of a certain type.
         * @param type The type to load the objects of.
         * @return promise A promise which is resolved when the data is loaded.
         */
        load: function (type) {
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
        add: function (type, object) {
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
        update: function (type, object) {
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
        remove: function (type, object) {
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

angular.module('pimaticApp').factory('auth', ['store', '$injector', '$location', '$q', '$rootScope', function (store, $injector, $location, $q, $rootScope) {
    var auth = {
        store: store,
        redirectedFrom: null,

        isLoggedIn: function () {
            return store.getUser() !== null;
        },

        setupWatchers: function(){
            var a = this;
            $rootScope.$watch(function(){return store.getUser()}, function(newUser, oldUser){
                if(newUser === oldUser) return;

                console.log('auth', 'New user: ', newUser);

                // New user or logout, reset the store
                if(oldUser !== null){
                    store.reset();
                }

                // Redirect the user
                if (newUser !== null) {
                    a.redirect();
                }
            }, true)
        },

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
                    store.setUser(user);
                    //store.add('user',user);
                    //self.setUser(user, true);
                    resolve(user);
                }, reject);
            });
        },

        redirect: function(){
            if(this.redirectedFrom !== null){
                $location.path(this.redirectedFrom);
                console.log('auth', 'Logged in, redirecting to ', this.redirectedFrom);
                this.redirectedFrom = null;
            }else{
                $location.path("home");
                console.log('auth', 'Logged in, redirecting to /home (default)');
            }
        },

        setRedirectedFrom: function(path){
            this.redirectedFrom = path;
        },
    };

    auth.setupWatchers();

    return auth;
}]);
/**
 * The store is responsible for keeping the references to the different models or requesting them via the specified
 * ApiProvider. Users can request models from the store. If the models are in the store, the models are directly returned.
 * If the models are not in the store, the models are requested via the specified ApiProvider
 */

angular.module('pimaticApp.data').factory('store', ['$q', '$injector', 'apiProviderName', function ($q, $injector, apiProviderName) {
    var store = {
        // Retrieve the provider instance from the injector
        provider: $injector.get(apiProviderName),

        store: {},

        /**
         * Reset the store and retreive all objects from the API provider again
         */
        reset: function(){
            console.log('=== STORE RESET ===');

            this.store =  {
                user: {timestamp: 0, data: null},
                devices: {timestamp: 0, data: []},
                groups: {timestamp: 0, data: []},
                pages: {timestamp: 0, data: []},
                rules: {timestamp: 0, data: []},
                variables: {timestamp: 0, data: []}
            };

            this.provider.setStore(this);

            this.provider.start();
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
         * @param identifier string Optional, the name of the attribute which uniquely identifies the object. Defaults to 'id'.
         * @returns list|object A list of models or a single instance.
         */
        get: function (type, id, identifier) {
            var self = this;

            // Determine the name of the identifying attribute
            identifier = angular.isUndefined(identifier) ? 'id' : identifier;

            if (type in self.store) {
                // Check if data is already fetched
                if (self.store[type].timestamp === 0 && !self.store[type].loading) {
                    self.store[type].loading = true;

                    // Fetch data via the API
                    self.provider.load(type).then(function (data) {
                        console.log(type, data);

                        // Merge the objects
                        self.store[type].data =  data;

                        var date = new Date();
                        self.store[type].timestamp = date.getTime();

                        // Remove dummy flag
                        //angular.forEach(self.store[type].data, function (value) {
                        //    value.$dummy = false;
                        //});

                        self.store[type].loading = false;
                    }, function(){
                        // Set to false, so it can be retried
                        self.store[type].loading = false;
                    });
                }

                if (angular.isUndefined(id)) {
                    // Return all data
                    return self.store[type].data;
                } else {
                    // Return single item, or null
                    var item = null;
                    angular.forEach(self.store[type].data, function (value) {
                        if (value[identifier] == id) {
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
         * @param identifier string Optional, the name of the attribute which uniquely identifies the object. Defaults to 'id'.
         */
        add: function (type, object, skipApi, identifier) {
            var provider = this.provider;
            var self = this;
            // Determine the name of the identifying attribute
            identifier = angular.isUndefined(identifier) ? 'id' : identifier;

            console.log('store', 'add()', 'type=', type, 'identifier=', identifier, 'object=', object, 'skipApi=', skipApi);

            // Help function
            // This function is needed because otherwise creating a new object would result in a double addition (first
            // by calling the API and adding it on success, the by the message passed from the server via the websocket)
            var add = function(){
                var current = self.get(type, object[identifier], identifier);
                if(current === null){
                    // Really new
                    self.get(type).push(object);
                }else{
                    // Not new, update instead
                    self.update(type, object, skipApi);
                }
            };

            return $q(function (resolve, reject) {
                if(skipApi){
                    // Add directly
                    add(object);
                    resolve(object);
                }else{
                    // Call the API provider
                    provider.add(type, object, identifier).then(function (resultingObject) {
                        // Succesfully added -> add to store
                        add(resultingObject);
                        resolve(resultingObject);
                    }, function (message) {
                        // Not added
                        reject(message);
                    });
                }
            });
        },

        /**
         * Update an existing object of the given type
         * @param type The type of the object which is updated
         * @param object The updated object
         * @param skipApi bool Optional, whether to skip the call to the api or not. Typical use case for this is when
         * the addition is originated from the server. Defaults to false
         * @param identifier string Optional, the name of the attribute which uniquely identifies the object. Defaults to 'id'.
         */
        update: function (type, object, skipApi, identifier) {
            var provider = this.provider;
            var self = this;
            // Determine the name of the identifying attribute
            identifier = angular.isUndefined(identifier) ? 'id' : identifier;

            console.log('store', 'update()', 'type=', type, 'identifier=', identifier, 'object=', object, 'skipApi=', skipApi);


            return $q(function (resolve, reject) {
                var current = self.get(type, object[identifier]);
                if(current === null){
                    reject("Fatal: update called, but object does not exist");
                }

                if(skipApi){
                    // Update directly
                    angular.merge(current, object);
                    resolve(object);
                }else {
                    // Call the API provider
                    provider.update(type, object, identifier).then(function (resultingObject) {
                        // Succesfully updated -> update in store
                        angular.merge(current, resultingObject);
                        resolve(resultingObject);
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
         * @param identifier string Optional, the name of the attribute which uniquely identifies the object. Defaults to 'id'.
         */
        remove: function (type, object, skipApi, identifier) {
            var self = this;
            // Determine the name of the identifying attribute
            identifier = angular.isUndefined(identifier) ? 'id' : identifier;

            console.log('store', 'remove()', 'type=', type, 'identifier=', identifier, 'object=', object, 'skipApi=', skipApi);

            // Help function
            var remove = function(){
                var index = self.store[type].data.indexOf(object);
                console.log(index);
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
                    self.provider.remove(type, object, identifier).then(function (resultingObject) {
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



        /*createDummy: function (type, id) {
            var dummy = {
                $dummy: true,
                id: id
            };
            switch (type) {
                case 'devices':
                    dummy['template'] = 'dummy';
                    break;
                default:
                    break;
            }

            return dummy;
        }*/
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
angular.module('pimaticApp.devices').controller('ThermostatController', ["$scope", function ($scope) {

}]);
angular.module('pimaticApp').controller('HomeController', ["$scope", function ($scope) {
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
}]);
angular.module('pimaticApp').controller('LandingController', ["$scope", "store", function ($scope, store) {
    console.log('You landed!');
}]);
angular.module('pimaticApp').controller('LoginController', ["$scope", "auth", function ($scope, auth) {
    if (auth.user !== null) {
        auth.redirect();
    }

    $scope.form = {};

    $scope.login = function(){
        console.log('login');
        $scope.form.message = null;
        $scope.form.busy = true;

        auth.login($scope.form.username, $scope.form.password, $scope.form.rememberMe).then(function(){
            $scope.form.busy = false;
        }, function(message){
            $scope.form.message = message;
            $scope.form.busy = false;
        });
    };
}]);
angular.module('pimaticApp').controller('MainController', ["$scope", "$mdSidenav", "$mdMedia", function ($scope, $mdSidenav, $mdMedia) {
    $scope.$mdMedia = $mdMedia;



    $scope.toggleMenu = function(){
        $mdSidenav('left').toggle();
    };
}]);
angular.module('pimaticApp.settings').controller('DevicesController', ["$scope", function ($scope) {
    // Get a list of ids of devices which are not in a group
    $scope.ungroupedDevices = function () {
        var groups = $scope.store.get('groups');
        var devices = $scope.store.get('devices');

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
    };
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
angular.module('pimaticApp').directive('deviceCard', ['toast', function (toast) {
    return {
        scope: {
            device: '='
        },
        template: '<ng-include src="\'partials/devices/\' + device.template + \'.html\'"></ng-include>',
        //template: '<ng-include src="\'views/devices/device.html\'"></ng-include>',
        controller: function ($scope) {
            $scope.getAttribute = function(name) {
                var attribute = null;
                angular.forEach($scope.device.attributes, function(value){
                    if(value.name == name) {
                        attribute = value;
                    }
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
}]);