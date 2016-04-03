/**
 * The store is responsible for keeping the references to the different models or requesting them via the specified
 * ApiProvider. Users can request models from the store. If the models are in the store, the models are directly returned.
 * If the models are not in the store, the models are requested via the specified ApiProvider
 */

angular.module('pimaticApp.services').factory('auth', ['store', '$injector', '$location', '$q', function (store, $injector, $location, $q) {
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
        },
    };

    return auth;
}]);