module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			/*build: {
				src: 'src/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}*/
			js: {
				files: {
					'js/all.min.js': ['src/js/react.min.js', 'src/js/libs/react-dom.min.js']
				}
			}
		},
		less: {
			development: {
				options: {
					paths: ['']
				},
				files: {
					'css/result.css': 'src/styles/less/style.less'
				}
			},
			/*production: {
				options: {
					paths: ['assets/css'],
					plugins: [
						new (require('less-plugin-autoprefix'))({browsers: ["last 2 versions"]}),
						new (require('less-plugin-clean-css'))(cleanCssOptions)
					],
					modifyVars: {
						imgPath: '"http://mycdn.com/path/to/images"',
						bgColor: 'red'
					}
				},
				files: {
					'path/to/result.css': 'path/to/source.less'
				}
			}*/
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	// Default task(s).
	grunt.registerTask('default', ['uglify:js','less:development']);


};