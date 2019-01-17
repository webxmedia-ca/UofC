/**
 * Created by valeriu.jecov on 19/11/2018.
 */

/* jshint -W024 */
/* jshint expr:true */
/* jshint laxcomma:true */

var fs = require('fs');
var Base = require('mocha').reporters.Base;

module.exports = JIRAReporter;

function JIRAReporter(runner) {
    var self = this;
    Base.call(this, runner);

    var tests = []
        , failures = []
        , passes = []
        , skipped = [];

    runner.on('test end', function (test) {
        tests.push(test);
    });

    runner.on('pending', function (test) {
        skipped.push(test);
    });

    runner.on('pass', function (test) {
        passes.push(test);
    });

    runner.on('fail', function (test) {
        failures.push(test);
    });

    runner.on('end', function () {
        var obj = {
            stats: self.stats
            , failures: failures.map(clean)
            , passes: passes.map(clean)
            , skipped: skipped.map(clean)
        };

        //print results to screen
        // console.log(JSON.stringify(obj, null, 2));

        //write results to file
        var filename = './results/jira-results.json';
        fs.writeFileSync(filename, JSON.stringify(obj, null, 2), {encoding: 'utf-8'});
    });
}

function clean(test) {
    var jiraTicketArray = test.fullTitle().split(' - ');
    var o = {
        jiraTicket: jiraTicketArray[0] + " - " + jiraTicketArray[1]
        , title: test.title
        , fullTitle: test.fullTitle()
        , duration: test.duration
    };
    if (test.hasOwnProperty("err")) {
        if (test.err.stack) {
            o.error = test.err.stack.toString();
        }
        else if (test.err.message) {
            o.error = test.err.message;
        }
    }
    return o;
}