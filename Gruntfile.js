module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'app/build/<%= pkg.name %>.js',
                dest: 'app/build/<%= pkg.name %>.min.js'
            }
        },
        concat: {
            build: {
                src: [
                    'app/app.js',
                    'app/services/**/*.js',
                    'app/controllers/**/*.js',
                    'app/directives/**/*.js',
                ],
                dest: 'app/build/<%= pkg.name %>.js'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']);

};