'use strict';

var webpack = require('webpack');
var path = require('path');

module.exports = function(config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'node_modules/jquery/dist/jquery.min.js',
            '../app/shared/hydrajs.js',
            'tests.bundle.js'
        ],

        preprocessors: {
            '../app/shared/hydrajs.js': ['webpack', 'sourcemap'],
            'app/**/*.module.js': ['webpack', 'sourcemap'],
            // 'app/main.module.js': ['webpack', 'sourcemap'],
            'test/mocks/*.js': ['webpack', 'sourcemap'],
            'tests.bundle.js': ['webpack', 'sourcemap']
        },

        webpack: {
            // devtool: 'eval',
            devtool: 'inline-source-map',
            module: {
                loaders: [
                    { test: /[\/]angular\.js$/, loader: "exports?angular"},
                    { test: /\.test\.js/, loader: "ng-annotate?add=true!babel"},
                    {
                        test: /redhat_access_pcm_ascension_common/,
                        loader: 'ng-annotate?add=true!babel'
                    },
                    {
                        test: /\.js/,
                        loader: "ng-annotate?add=true!isparta",
                        exclude: [
                            path.resolve(__dirname, 'node_modules'),
                            path.resolve(__dirname, 'bower_components'),
                            /translations\.js/,
                            /test\.bundle\.js/,
                            /test\.js/,
                            /test\/mocks\/*/
                        ]
                    },
                    { test: /\.css$/, loader: 'style!css'},
                    {
                        test: /\.(jpe?g|png|gif|svg)/i,
                        loader: 'null-loader'
                    },
                    { test: /\.(woff|woff2)/, loader: 'null' },
                    { test: /\.(ttf|eot)/, loader: 'null'},
                    { test: /\.html$/, loader: 'raw' },
                    { test: /\.txt$/, loader: 'raw' },
                    { test: /\.jade$/, loader: 'jade-loader' }
                ]
            },
            resolve: {
                modulesDirectories: ["node_modules", "bower_components"],
                alias: {
                    'moment-timezone': 'moment-timezone/builds/moment-timezone-with-data-2010-2020.js'
                }
            },
            plugins: [
                new webpack.ProvidePlugin({
                    $: 'jquery',
                    jQuery: 'jquery',
                    Uri: 'jsuri'
                }),
                new webpack.DefinePlugin({
                    ENVIRONMENT: JSON.stringify('test')
                })
            ]
        },
        webpackMiddleware: {
            noInfo: true
        },

        reporters: ['progress', 'coverage'],

        coverageReporter: {
            type: 'lcov',
            dir: 'test/coverage'
        },

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 8080,

        colors: true,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_DEBUG,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS', 'PhantomJS_custom'],

        // customLaunchers: {
        //     'PhantomJS_custom': {
        //         base: 'PhantomJS',
        //         options: {
        //             windowName: 'PCM testing',
        //             settings: {
        //                 webSecurityEnabled: false
        //             },
        //         },
        //         flags: ['--disk-cache=false'],
        //         debug: true
        //     }
        // },

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true,

        plugins: [
            require('karma-webpack'),
            require('karma-coverage'),
            require('karma-jasmine'),
            require('karma-sourcemap-loader'),
            require('karma-phantomjs-launcher'),
            require('karma-firefox-launcher'),
            require('karma-chrome-launcher'),
            require('karma-script-launcher')
        ],

        client: {
            captureConsole: true
        }
    });
};
