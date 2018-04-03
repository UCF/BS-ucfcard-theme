module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({

    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          // target.css file: source.less file
          "wp-content/themes/CARD_SERVICES/library/css/style.css": "wp-content/themes/CARD_SERVICES/library/less/style.less"
          // "wp-content/themes/CARD_SERVICES/library/css/ie.css": "wp-content/themes/CARD_SERVICES/library/less/ie.less"
        }
      }
    },

    watch: {
      styles: {
        files: ['wp-content/themes/CARD_SERVICES/library/less/**/*.less'], // which files to watch
        tasks: [ 'less' ],
        options: {
          nospawn: true
        }
      }
    }
  });

  grunt.registerTask( 'build', [ 'less' ] );
  grunt.registerTask( 'default', [ 'build', 'watch' ] );
};