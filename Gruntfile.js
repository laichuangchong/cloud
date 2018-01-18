module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                compress: {
                    drop_console: false, //去除console.log
                },
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            my_target: {
                options: {
                    beautify: true, //文件还是有缩进
                    sourceMap: {
                        includeSources: true
                    },
                },
                files: {
                    'dest/common.min.js': 'js/common.js',
                    'dest/main_common.min.js': 'js/main_common.js',
                    'dest/service.min.js': 'js/service.js',
                    'dest/login.min.js': 'js/controller/login.js',
                    'dest/general.min.js': 'js/controller/general.js',
                    'dest/applyQuota.min.js': 'js/controller/applyQuota.js',
                    'dest/cloudComputer.min.js': 'js/controller/cloudComputer.js',
                    'dest/backups.min.js': 'js/controller/backups.js',
                    'dest/addBackups.min.js': 'js/controller/addBackups.js',
                    'dest/cloudComputerDetail.min.js': 'js/controller/cloudComputerDetail.js',
                    'dest/addCloudComputer.min.js': 'js/controller/addCloudComputer.js',
                    'dest/couldDisk.min.js': 'js/controller/couldDisk.js',
                    'dest/addCouldDisk.min.js': 'js/controller/addCouldDisk.js',
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'js/controller/*.js','js/common.js','js/service.js','js/main_common.js'],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },
        watch: {
            scripts: {
                files: ['Gruntfile.js',
                    'js/common.js',
                    'js/main_common.js',
                    'js/config.js',
                    'js/service.js',
                    'js/controller/*.js',
                    'sass/*.sass',
                    'css/*.css'],
                tasks: ['uglify','jshint','sass','cssmin'],
                options: {
                    spawn: false,
                    interrupt: true,
                }
            }
        },
        sass: {                              // Task
            dest: {                            // Target
                options: {                       // Target options
                    style: 'expanded'
                },
                files: {                         // Dictionary of files
                    'css/style/style.css': 'sass/style.sass'       // 'destination': 'source'
                }
            }
        },
        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },
            target: {
                files: [{
                    expand: true,
                    cwd: 'css/style',
                    src: ['*.css', '!*.min.css'],
                    dest: 'css/style',
                    ext: '.min.css'
                }]
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
// grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    // grunt.loadNpmTasks('grunt-contrib-concat');

    // grunt.registerTask('test', ['jshint', 'qunit']);
    grunt.registerTask('default', ['jshint', 'uglify','sass','cssmin', 'watch']);

};