/**
 * Created by valeriu.jecov on 03/10/2018.
 */

module.exports = {
    'default': ['jshint', 'sloc:ucautomation-tests', 'notify'],
    'deploy': ['jshint', 'sloc:ucautomation-tests', 'bump', 'notify']
};