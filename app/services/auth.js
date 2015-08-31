/**
 * The store is responsible for keeping the references to the different models or requesting them via the specified
 * ApiProvider. Users can request models from the store. If the models are in the store, the models are directly returned.
 * If the models are not in the store, the models are requested via the specified ApiProvider
 */

angular.module('pimaticApp').factory('auth', function (store, $injector, $location, $q) {
    return {
        store: store,

        user: null,
        redirectedFrom: null,

        isLoggedIn: function () {
            return this.user != null;
        },

        setUser: function (user, reset) {
            console.log('auth', 'New user: ', user);

            // Set the user
            this.user = user;

            // Reset the store, so it can re-request all objects
            if(reset) store.reset();

            // Redirect the user
            if (user != null) {
                this.redirect();
            }
        },

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
                    self.setUser(user, true);
                    resolve(user);
                }, reject);
            });
        },

        redirect: function(){
            if(this.redirectedFrom != null){
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
});