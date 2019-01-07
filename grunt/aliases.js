/**
 * Created by valeriu.jecov on 10/11/2018.
 */

module.exports = {
    'default': ['jshint', 'sloc:ucautomation-tests', 'notify'],
    'deploy': ['jshint', 'sloc:ucautomation-tests', 'bump', 'notify']
};