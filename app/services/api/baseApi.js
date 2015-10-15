/**
 * Base for an ApiProvider, specifies dummy methods the ApiProvider could override.
 */
angular.module('pimaticApp.api').factory('baseApi', ['$q', function ($q) {
    return {
        store: null,

        toQueryString: function(data, prefix){
            var self = this;
            var strings = [];
            angular.forEach(data, function(value, key){
                var name = angular.isUndefined(prefix) ? encodeURIComponent(key) : prefix + "[" + encodeURIComponent(key) + "]";
                strings.push(angular.isObject(value) ? self.toQueryString(value, name) : (name) + "=" + encodeURIComponent(value));
            });
            return strings.join("&");
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