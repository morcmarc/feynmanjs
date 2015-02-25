module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      server: {
        options: {
          port: 3000,
          base: 'public'
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        compress: true,
        mangle: true
      },
      build: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    browserify: {
      dist: {
        files: {
          'dist/feynman.js': ['src/index.js'],
          'doc/feynman.js': ['src/index.js']
        },
        options: {
          debug      : true,
          standalone : 'Feynman'
        }
      },
      test: {
        files: {
          'spec/feynman.spec.js': ['spec/src/**/*.js']
        },
        options: {
          'debug': true
        }
      }
    },
    jasmine: {
      feynman: {
        options: {
          specs: './spec/feynman.spec.js'
        }
      }
    },
    notify: {
      test: {
        options: {
          title: 'Running Unit Tests Complete',  // optional
          message: 'All Jasmine tests are passing', //required
        }
      }
    },
    watch: {
      src: {
        files: ['src/**/*.js'],
        tasks: ['default']
      },
      test: {
        files: ['src/**/*.js', 'spec/src/**/*.spec.js'],
        tasks: ['test'],
        options: {
          livereload: true
        }
      }
    },
    express: {
      docs: {
        options: {
          port: 9000,
          hostname: '0.0.0.0',
          bases: ['./doc']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-express');

  grunt.registerTask('servedocs', ['express:docs', 'express-keepalive']);

  // Default task(s).
  grunt.registerTask('default', 'Browserify and uglify', function() {

    grunt.log.writeln('Building...');
    grunt.task.run('browserify:dist');
    grunt.task.run('uglify');
  });

  grunt.registerTask('test', 'Compile specs and run them', function() {

    grunt.log.writeln('Building tests...');
    grunt.task.run('browserify:test');
    grunt.task.run('jasmine:feynman');
    grunt.task.run('notify:test');
  });

};