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
         * @return promise A promise.
         */
        deviceAction: function (deviceId, actionName, params) {
            return $q(function (resolve, reject) {
                reject();
            });
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
    }
});