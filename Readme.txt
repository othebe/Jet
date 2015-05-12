This documents the installation process and requirements for Jet V2.

Pre-requirements:
NodeJs > Typescript, Bower, TSD, Grunt.

-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
QUICK SETUP

1. Install NodeJs.
2. Install Typescript:  `npm install typescript -g`
3. Install Bower:       `npm install bower -g`
4. Install TSD:         `npm install tsd -g`
5. Install Grunt:       `npm install grunt-cli -g`
6. Run make. 
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------


Package dependencies:
npm install

-------------------------------------------------------------------------------

Grunt:
Grunt takes care of Jet tasks.

Install:
npm install grunt-cli -g

-------------------------------------------------------------------------------

Typescript:
Jet requires the Typescript compiler to compile!

Install:
npm install typescript -g

-------------------------------------------------------------------------------

Typescript dependencies:
Typescript dependencies are handled via TSD https://www.npmjs.com/package/tsd

Install:
npm install tsd -g

Update:
tsd update / tsd reinstall

-------------------------------------------------------------------------------

Package dependencies:
Package dependencies are handled via Bower http://bower.io/

Install:
npm install bower -g

Update:
bower update

-------------------------------------------------------------------------------

Compile:
Compiled code is written to Jet2/Jet.js

Usage:
compile

-------------------------------------------------------------------------------

Final steps:
Application tasks are managed via Grunt.

Usage:
grunt

Start web server (Port 5000)
grunt connect