# reVu web viewer

reVu is popular intelliJ Plugin for coding review (https://github.com/syllant/idea-plugin-revu) This Node.JS module is
for displaying important statistics for all of designated reVu XML files. The statistics is very useful
for monitors and quick overviews without any need to open the IDE.

## How to use

Quite self explanatory

    var module = require('./revuViewer/index.js')({
        "port": 3000,
        "title" : 'Title for the monitor'
        "refresh": "10",
        "path" : "path/to/xml/files"
    });
    
After initiating it (node app.js), you may go to IP:port or localhost:port.
There some demo reVu XML file in the demo directory.

## Demo 

Here it is: [Demo on Heroku](https://infinite-shore-1165.herokuapp.com/)
	
## How to test

Testing as being made with Mocha. just "make test" from root directory and that's it!