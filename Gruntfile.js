module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'dist/<%= pkg.name %>.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        concat: {
            build: {
                src: [
                    'app/app.js',
                    'app/services/**/*.js',
                    'app/controllers/**/*.js',
                    'app/directives/**/*.js',
                    '!app/**/*.test.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        karma: {
            unit: {
                options: {
                    frameworks: ['jasmine'],
                    singleRun: true,
                    browsers: ['PhantomJS'],
                    files: [
                        'lib/bower/angular/angular.js',
                        'lib/bower/angular/angular.min.js',
                        'lib/bower/angular-animate/angular-animate.min.js',
                        'lib/bower/angular-aria/angular-aria.min.js',
                        'lib/bower/angular-messages/angular-messages.min.js',
                        'lib/bower/angular-material/angular-material.min.js',
                        'lib/bower/angular-route/angular-route.min.js',
                        'lib/bower/socket.io-client/socket.io.js',
                        'lib/bower/angular-mocks/angular-mocks.js',
                        'app/**/*.js',
                    ]
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-karma');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']);
    grunt.registerTask('test', ['karma']);

};