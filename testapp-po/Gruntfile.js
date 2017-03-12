module.exports = function (grunt) {
  'use strict';
  // Project configuration.
  grunt.initConfig({

    browserify: {
      herpaderp: {
        files: {
          'build/bundle.js': [
            'src/js/**/*.js'
          ],
          '../backend/public/bundle.js': [
            'src/js/**/*.js'
          ]
        },
        options: {
          browserifyOptions: {
            debug: true
          },
        }
      }
    },

    less: {
      herpaderp: {
        files: {
          'build/bundle.css': [
            'src/css/**/*.less'
          ],
          '../backend/public/bundle.css': [
            'src/css/**/*.less'
          ]
        }
      }
    },

    copy: {
      herpaderp: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['src/data/*'],
            dest: 'build/data/'
          },
          {
            expand: true,
            flatten: true,
            src: ['src/img/*'],
            dest: 'build/img/'
          },
          {
            expand: true,
            flatten: true,
            src: ['src/html/*'],
            dest: 'build/'
          },
          {
            expand: true,
            flatten: true,
            src: ['src/data/*'],
            dest: '../backend/public/data/'
          },
          {
            expand: true,
            flatten: true,
            src: ['src/img/*'],
            dest: '../backend/public/img/'
          },
          {
            expand: true,
            flatten: true,
            src: ['src/html/*'],
            dest: '../backend/public/'
          }
        ]
      }
    },

    watch: {
      herpaderpcss: {
        files: ['src/css/**/*'],
        tasks: ['less'],
      },
      herpaderpjs: {
        files: ['src/js/**/*'],
        tasks: ['browserify'],
      },
      herpaderpcopy: {
        files: ['src/html/**/*', 'src/data/**/*'],
        tasks: ['copy'],
      },
      buildreload: {
        files: ['build/**/*'],
        options: {
          livereload: true,
          livereloadOnError: true
        },
      }
    }
  });

  // Load local tasks.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task.
  grunt.registerTask('default', ['browserify', 'less', 'copy']);
  grunt.registerTask('dev', ['browserify', 'less', 'copy', 'watch']);
};
