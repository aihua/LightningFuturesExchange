'use strict'

module.exports = grunt => {
  require('load-grunt-tasks')(grunt)

  grunt.initConfig({
    babel: {
      dist: {
        files: {
          'dist/bootstrap-without-jquery.js': 'src/index.js'
        }
      }
    },
    browserSync: {
      bsFiles: {
        src: 'demo/bootstrap-without-jquery.js'
      },
      options: {
        server: './demo',
        watchTask: true
      }
    },
    copy: {
      distToDemo: {
        expand: true,
        cwd: 'dist',
        src: 'bootstrap-without-jquery.js',
        dest: 'demo'
      },
      es6: {
        src: 'src/index.js',
        dest: 'dist/bootstrap-without-jquery.es6'
      }
    },
    jshint: {
      all: [
        'bower.json',
        'package.json',
        'src/index.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    watch: {
      files: 'src/**/*.js',
      tasks: ['babel', 'copy:distToDemo']
    }
  })

  grunt.registerTask('build', [
    'jshint',
    'babel',
    'uglify',
    'copy:es6',
    'copy:distToDemo'
  ])

  // Registed as a custom task because of an obscure warning :
  // "Cannot create property subarray" (linked to grunt-contrib-uglify)
  grunt.registerTask('uglify', () => {
    const file = 'dist/bootstrap-without-jquery'
    const fs = require('fs')
    const UglifyJS = require('uglify-js')
    const result = UglifyJS.minify(`${file}.js`)
    fs.writeFileSync(`${file}.min.js`, result.code)
  });

  grunt.registerTask('default', ['browserSync', 'watch'])
}
