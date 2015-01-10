/**
 * Create revuViewer new Class instance.
 *
 * Options
 * @class Represents a revuViewer
 * @param arg1
 */

var refresh, path,XMLfiles,port,title,fs = require('fs'), path = require("path"), xml2js = require('xml2js'),http = require("http"),
    parser = new xml2js.Parser();

/**
 * Constructor
 * @param config
 */

function revuViewer(config) { //Constructor

    createHTTPServer(config);
}


/**
 *
 * Creating the basic HTTP server
 *
 * @param page_html
 */

function createHTTPServer(config) {
    var MyServer = http.createServer(function(request, response) {
        //activating it in every request
        readConfigJSON(config, function() {
            var full_html = '';
            this.XMLfiles.forEach(function(filename, index) { //after we have the xmlfiles, lets read the content
                parseXMLfiles(this.path+'/'+filename, function(html) {
                    full_html += html;
                    if (index === this.XMLfiles.length - 1) {
                        var page_html = CreateHTMLOfPage(full_html);
                        // load the HTML or the main page_html
                        response.writeHead(200, {"Content-Type": "text/html"});
                        response.write(page_html);
                        response.end();
                    }
                });
            });

        });

    });


    if(typeof( config.port ) === 'undefined') {
        this.port = process.env.PORT;
    } else {
        this.port = config.port;
    }
    MyServer.listen(this.port);
    console.log("Server running at port:"+this.port); //Printing to the console only




}



/**
 *
 * Reading and setting the configuration
 *
 * @param config
 */

function readConfigJSON(config, callback) {

    if(typeof( config.title ) === 'undefined') {
        this.title = "Revu Viewer";
    } else {
        this.title = config.title;
    }


    if(typeof( config.refresh ) !== 'undefined') {
        this.refresh = config.refresh;
    }

    if(typeof( config.path ) === 'undefined') {
        var path = require("path");
        this.path = path.resolve(__dirname+'/../../')+"/demo_xml_file_folder/";
    } else {
        this.path = config.path;
    }
    // loading all XML files in path;
    if (!fs.existsSync(this.path)) {
        throw new Error(this.path + "Is not existing")
    } else {
        fs.readdir(this.path, function(err, files, _this) {
            this.XMLfiles = new Array;
            files.forEach(function(file) {
                if(file.split('.').pop() === 'xml') { //no xml? no inside list
                    this.XMLfiles.push(file);
                }
            });
            callback(); //calling the callback
        });
    }

}

/**
 * get file XML reVu file and return the issues
 * @param filename
 * @param callback
 */

function parseXMLfiles(filename, callback) {
    var html;
    fs.readFile(filename, function(err, data) {
        parser.parseString(data, function (err, result) {
            var html, reviews, subTitle, subText, topCreatorsList, topCreators, topResolversList, topResolvers,
                TopOpenIssuesList, TopOpenIssues;
            subTitle = result.review.$.name;
            subText = result.review.goal[0];
            reviews =  result.review.issues[0].issue ;

            topCreatorsList = createTopCreators( reviews );
            topCreators = CreateHTMLList(  topCreatorsList , 'top-creators', "Top Creators");
            topResolversList = createTopResolvers( reviews );
            topResolvers = CreateHTMLList(  topResolversList , 'top-resolvers', "Top Resolvers");
            TopOpenIssuesList = createTopOpenIssues( reviews );
            TopOpenIssues = CreateHTMLList(  TopOpenIssuesList , 'top-issues', "Top Opened Issues");
            html = topCreators + topResolvers + TopOpenIssues;

            html = createHTMLOfSegment(subTitle, subText, html);
            callback(html);
        });
    });

}

/**
 * returns array of top issues creators
 *
 * @param list
 * @returns {Array}
 */

function createTopCreators(list) {
    var result = new Object();
    list.forEach(function(item) {
        var creator;
        creator = item.history[0].$.createdBy;
        if(!result[creator]) {
            result[creator] = 1;
        } else {
            result[creator] += 1;
        }

    });
    return result;
}


/**
 * returns array of top issues resolvers
 *
 * @param list
 * @returns {Array}
 */

function createTopResolvers(list) {
    var result = new Object();
    list.forEach(function(item) {
        var resolver;
        if (item.$.status === 'resolved' ) {
            resolver = item.history[0].$.lastUpdatedBy;
            if(!result[resolver]) {
                result[resolver] = 1;
            } else {
                result[resolver] += 1;
            }
        }
    });
    return result;
}

/**
 * returns array of top open issues
 *
 * @param list
 * @returns {Array}
 */

function createTopOpenIssues(list) {
    var result;
    result = new Object();
    list.forEach(function(item) {
        var assignees;
        assignees = item.$.assignees;
        if( typeof assignees === 'undefined' ) {
            assignees = 'Not assigned';
        }
        if ( item.$.status === 'resolved' ) {
            if(!result[assignees]) {
                result[assignees] = 0;
            }
        } else {
            if(!result[assignees]) {
                result[assignees] = 1;
            } else {
                result[assignees] += 1;
            }
        }
    });
    return result;
}

/**
 * get array and return HTML list
 * @param list
 * @param Listclass
 * @returns {string}
 * @constructor
 */

function CreateHTMLList(list, Listclass, header) {
    var result;
    result = "<div class='" + Listclass + "'>\n";
    if(typeof(header) !== 'undefined') {
        result += "    <h2>" + header + "</h2>\n";
    }
    list = sortObject( list );

    result += "    <ul>";
    list.forEach(function(item) {
        result += "\n        <li>" + item.key+" : "+ item.value + "</li>";
    });
    result += "\n    </ul>\n</div>";
    return result;
}

/**
 *
 * @param title
 * @param subtext
 * @param html
 * @returns {string}
 */

function createHTMLOfSegment(title,subtext,html) {
    var result;
    result = "<section><h2>" + title + "</h2>" +
        "<p class='subtext'>" + subtext + "</p>" + html + "</section>"

    return result;
}


/**
 * Create HTML of the page (lame template)
 *
 * @param html
 * @returns {string}
 * @constructor
 */

function CreateHTMLOfPage(html) {
    var result,meta_tags = '', style_tag = '';
    if( typeof( this.refresh ) !== 'undefined' ) {
        meta_tags = "<meta http-equiv='refresh' content='" + this.refresh + "'>";
    }
    var style_tag = "<style>" + fs.readFileSync(__dirname + '/../assets/style.css').toString() + "</style>";
    result = "<!doctype html>" +
    "<html> " +
    "<head><title>reVu Web Viewer</title>" + meta_tags + style_tag +
    "</head>" +
    "<body><h1>" + this.title + "</h1>" +
        html
    + "<small><div>Icons made by <a href='http://www.freepik.com' title='Freepik'>Freepik</a> from <a href='http://www.flaticon.com' title='Flaticon'>www.flaticon.com</a> is licensed under <a href='http://creativecommons.org/licenses/by/3.0/' title='Creative Commons BY 3.0'>CC BY 3.0</a></div></small>" +
    "</body></html>";

    return result;
}

/**
 * Sorting object ascending
 * @param obj
 * @returns {Array}
 */

function sortObject(obj) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': obj[prop]
            });
        }
    }
    arr.sort(function(a, b) { return b.value - a.value; });
    //arr.sort(function(a, b) { a.value.toLowerCase().localeCompare(b.value.toLowerCase()); }); //use this to sort as strings
    return arr; // returns array
}


module.exports = function(config) {
    new revuViewer(config);//Instantiate the Object
}