# README
This is on of my first Trainee Project in Node so please consider this.
## Dependecies

There are several Node Packages dependent which are helping the running and building process

For using this tools make sure u have Node & NPM installed
	Download: https://nodejs.org/download/

Database: 
	MongoDB is used for store the syncronisation informations.
	Be sure u installed it locally or on a Webservice
	Download: http://www.mongodb.org/downloads

Bootstrap for Client-Side basic GUI addaption
-Will be installed through bower later

Express is the HTTP Server
node-trello is a trello API wrapper for node
mongoose is the MongoDB interface
Jade is used to render some HTML Sites to the Client Side
-Will be installed through npm


Likely u want to install bower & grunt via npm globally. So run:
**Linux**
	
	sudo npm install -g bower grunt-cli

**Windows**

	npm install -g bower grunt-cli


## Install and start via HG
### Linux & Windows
	hg clone https://repositories.webvariants.de/Sonstiges/Trello-List-Sync-Node-Server
	cd Trello-List-Sync-Node-Server
	npm install
	bower install 
	grunt

Alternate you can grab the repository with TutoriseHG

if the npm install process failed please try to run with sudo

## Using
The Server on the command
	
	grunt

at the root directory and also watches over the main files in the subdirectories for changes
and reload the Page in your Brower if you have installed "LiveReload"-Plugin but thats not necessary.

If the Server starts sucessfully he his reachable through http://localhost:3000

You can edit the Port at the www-file in the bin directory.

## Interfaces

-http://localhost:3000/reg
	-Leads to a basic hook register page
-http://localhost:3000/sync 
	-Page for register a Link between two Lists