angular.module('pimaticApp.configuration').provider('config', function () {
    this.environment = 'development';

    this.production = {
        title: '',
        pimaticHost: '',
        adapterName: 'websocketAdapter',
        debug: false
    };

    this.development = {
        title: 'Pimatic frontend - DEV',
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