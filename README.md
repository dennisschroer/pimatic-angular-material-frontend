# Pimatic Angular Material Frontend
A web frontend build for the pimatic framework using angular and material design (angular material).

*screenshots will be included.*

## Installation
For now, you can only use git to manually install the plugin. It will be made available via npm when it is more stable.

1. Add the plugin to the plugins section of the `config.json` file of your pimatic app:

	    {
	      "plugin": "angular-material-frontend"
	    }

2. Browse to the pimatic app root and install the plugin using NPM:

    	npm install git://github.com/denniss17/pimatic-angular-material-frontend

	This should also automatically download all dependencies of bower. If not, run the following command in the root of the plugin:

    	bower install

## Building
First make sure all development dependencies are installed:

	npm install

A Grunt task is specified which should test the scripts and build the production files. Simply run the following command in the project root:

    grunt build

## Testing
Jasmine is used to unit test the frontend. Running the following command should run all tests:

    grunt test

## Developing
The

## References
Pimatic: [http://pimatic.org/](http://pimatic.org/)

Angular: [https://angularjs.org/](https://angularjs.org/)

Angular Material: [https://material.angularjs.org/latest/#/](https://material.angularjs.org/latest/#/)

Jasmine: [http://jasmine.github.io/](http://jasmine.github.io/)

Grunt: [http://gruntjs.com/](http://gruntjs.com/)

Bower: [http://bower.io/](http://bower.io/)

npm: [https://www.npmjs.com/](https://www.npmjs.com/)

This project attempts to follow the AngularJS style guide, which can be found [here](https://github.com/mgechev/angularjs-style-guide).

## License
	Pimatic Angular Material Frontend is published under the GNU General Public License Version 3:
	you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, version 3.
	
	You should have received a copy of the GNU General Public License
	along with this plugin. If not, see <http://www.gnu.org/licenses/>.
