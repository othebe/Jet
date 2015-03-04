// Project folder.
const PROJECT_DIR   = 'Jet2';

// This folder is the default Bower component location.
const BOWER_DIR     = 'bower_components';

// This folder is contains public libraries.
const LIBRARY_DIR   = 'libraries';

// This folder contains public components.
const PUBLIC_DIR    = 'public';

// This folder contains typescript definitions.
const TYPINGS_DIR   = 'typings';


module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        // Copy bower components.
        copy: {
            main: {
                files: [
                    // Bower components.
                    {
                        expand: true,
                        cwd: BOWER_DIR,
                        src: '**',
                        dest: [PROJECT_DIR, PUBLIC_DIR, LIBRARY_DIR].join('/') + '/'
                    },
                    
                    // Typings.
                    {
                        expand: true,
                        cwd: TYPINGS_DIR,
                        src: '**',
                        dest: [PROJECT_DIR, PUBLIC_DIR, TYPINGS_DIR].join('/') + '/'
                    }
                ]
            }
        },  
        
        // Connect web server.
        connect: {
            server: {
                options: {
                    port: 5000,
                    base: 'Jet2',
                    keepalive: true
                }
            }
        }
    });
    
    // Enable Grunt copy.
    grunt.loadNpmTasks('grunt-contrib-copy');
    // Enable Grunt connect webserver.
    grunt.loadNpmTasks('grunt-contrib-connect');
    
    // Default task(s).
    grunt.registerTask('default', ['copy']);
}