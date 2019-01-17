/**
 * Created by valeriu.jecov on 19/11/2018.
 */

/* jshint -W024 */
/* jshint expr:true */
/* jshint laxcomma:true */

var fs = require('fs')
    , JiraApi = require('jira-client')
    , jsonFilename = '../results/jira-results.json'
    , debug = false;

var processResults = function () {
    if (!fs.existsSync(jsonFilename)) {
        console.log('Exiting: no json file to process (' + filename + ').');
        return;
    }

    var jiraClient = initJiraClient();
    var obj = getJsonDataFromFile();

    //write passes
    addJiraComments(jiraClient, obj.passes, 'pass');
    //write failures
    addJiraComments(jiraClient, obj.failures, 'fail', true);
    //write skipped
    addJiraComments(jiraClient, obj.skipped, 'skip');

    deleteJsonDataFile();
};

var initJiraClient = function () {
    var options = {
        protocol: 'https',
        host: 'jira.aer.ca',
        username: 'needJiraAccount',
        password: 'needJiraPass',
        apiVersion: '2',
        strictSSL: false
    };
    return new JiraApi(options);
};

var addJiraComments = function (jiraClient, obj, status, includeError) {
    for (var i = 0; i < obj.length; i++) {
        var comment = '[' + status + '] ' + obj[i].title + (includeError ? '\n\n' + obj[i].error : '');
        console.log('Updating ticket: ' + obj[i].jiraTicket.split(' - ')[0]);

        if (debug) console.log('Comment: ' + comment);

        jiraClient.addComment(obj[i].jiraTicket.split(' - ')[0], comment)
            .then(success)
            .catch(error);
    }
};

var success = function () {
    console.log('Status: updated.');
};

var error = function (err) {
    console.error('Error: ' + err.message);
};

var getJsonDataFromFile = function () {
    var fileJson = fs.readFileSync(jsonFilename, {encoding: 'utf-8'});
    return JSON.parse(fileJson);
};

var deleteJsonDataFile = function () {
    fs.unlink(jsonFilename, function (error) {
        if (error) console.log('Error, file could not be deleted: ' + error);
    });
};

processResults();
