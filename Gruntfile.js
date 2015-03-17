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

// This folder contains the component catalog.
const COMPONENTS_CAT_DIR = 'ext';

// This is the filename for the component catalog.
const COMPONENTS_CAT_FILE = 'Components.cat';

// This is the filename for the component catalog XML.
const COMPONENTS_CAT_XML = 'components.xml';

// This folder contains the SVG images.
const SVG_DIR = 'ext';

// This folder will contain the SVG images.
const SVG_OUT_DIR = 'catalog';


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
                    },
                    
                    // Components catalog definition.
                    {
                        expand: true,
                        cwd: COMPONENTS_CAT_DIR,
                        src: COMPONENTS_CAT_FILE,
                        dest: [PROJECT_DIR, PUBLIC_DIR].join('/') + '/'
                    },
                    
                    // Catalog images.
                    {
                        expand: true,
                        cwd: SVG_DIR + '/',
                        src: ['*.svg', '**/*.svg'],
                        dest: [PROJECT_DIR, PUBLIC_DIR, SVG_OUT_DIR].join('/') + '/',
                        flatten: true,
                        filter: 'isFile'
                    }
                ]
            }
        },
        
        // Rename Components.cat to XML.
        rename: {
            main: {
                files: [
                    {
                        src: [PROJECT_DIR, PUBLIC_DIR].join('/') + '/' + COMPONENTS_CAT_FILE,
                        dest: [PROJECT_DIR, PUBLIC_DIR].join('/') + '/' + COMPONENTS_CAT_XML
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
    // Enable Grunt rename.
    grunt.loadNpmTasks('grunt-contrib-rename');
    // Enable Grunt connect webserver.
    grunt.loadNpmTasks('grunt-contrib-connect');
    
    // Default task(s).
    grunt.registerTask('default', ['copy', 'rename']);
}