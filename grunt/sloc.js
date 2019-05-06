/**
 * Created by valeriu.jecov on 10/11/2018.
 */

module.exports = {
    options: {
        reportType: 'stdout',
        reportDetail: false,
        tolerant: false
    },
    'e2e-tests': {
        files: {
            'tests': [
                '**.js',
                '**/**.js',
                '**/**/**.js'
            ]
        }
    }
};