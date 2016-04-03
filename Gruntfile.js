module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! \n' +
                ' * Name:        <%= pkg.name %> \n' +
                ' * Description: <%= pkg.description %> \n' +
                ' * Version:     <%= pkg.version %> \n' +
                ' * Homepage:    <%= pkg.homepage %> \n' +
                ' * Date:        <%= grunt.template.today("yyyy-mm-dd") %> \n' +
                ' */\n'
            },
            build: {
                src: 'dist/<%= pkg.name %>.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        concat: {
            options: {
                banner: '/*! \n' +
                ' * Name:        <%= pkg.name %> \n' +
                ' * Description: <%= pkg.description %> \n' +
                ' * Version:     <%= pkg.version %> \n' +
                ' * Homepage:    <%= pkg.homepage %> \n' +
                ' * Date:        <%= grunt.template.today("yyyy-mm-dd") %> \n' +
                ' */\n'
            },
            build: {
                src: [
                    'app/app.js',
                    'app/services/**/*.js',
                    'app/filters/**/*.js',
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
        },
        jshint: {
            all: [
                'app/**/*.js',
                'Gruntfile.js'
            ],
            options: {
                curly: true,
                latedef: true,
                //undef: true,
                unused: true,
                globals: {
                    angular: true,
                    console: true,
                    module: true,
                    describe: true,
                    it: true,
                    beforeEach: true,
                }
            }
        },
        replace: {
            // Build index.html which uses the minified versions of the scripts
            buildHTML: {
                options: {
                    patterns: [
                        {
                            match: 'version',
                            replacement: '<%= pkg.version %>'
                        },
                        {
                            match: /(?!\.min)([\w]{4})(\.js)/g,
                            replacement: '$1.min.js'
                        }
                    ]
                },
                files: [
                    {flatten: true, src: 'dev.html', dest: 'index.tmpl.html'}
                ]
            }
        },
        watch: {
            scripts: {
                files: ['app/**/*.js'],
                tasks: ['dev'],
                options: {
                    livereload: true
                }
            },
        },
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-replace');

    // Default task(s).
    grunt.registerTask('default', ['build']);
    grunt.registerTask('dev', ['concat']);
    grunt.registerTask('test', ['jshint', 'karma']);
    grunt.registerTask('build', ['test', 'concat', 'replace', 'uglify']);
};