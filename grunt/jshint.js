/**
 * Created by valeriu.jecov on 10/11/2018.
 */

module.exports = {
    all: [
        'Gruntfile.js',
        'lib/UofCApps-base.js',
        'tests/**/*.js'
    ],
    options: {
        globals: {
            jQuery: true,
            console: true,
            module: false,
            run: false
        }
    }
};