angular.module('pimaticApp.configuration').provider('config', function () {
    this.environment = 'development';

    this.production = {
        title: '',
        pimaticHost: '',
        apiName: 'websocketApi',
        debug: false
    };

    this.development = {
        title: 'Pimatic frontend - DEV',
        pimaticHost: '',
        apiName: 'fixtureApi',
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
