module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		react: {
			all: {
				files: {
					'src/js/news.js': [
						'src/jsx/news.jsx',
						//'path/to/jsx/templates/dir/input2.jsx'
					]
				}
			}
		},
		concat: {
			options: {
				separator: "\n",
				process: function(src, filepath) {
					return '/*' + filepath + '*/\n' + src;
				}
			},
			js: {
				options: {
					separator: ";\n"
				},
				files: {
					'src/js/all.concatenated.js': [
						'src/js/libs/react.min.js',
						'src/js/libs/react-dom.min.js',
						'src/js/news.js'
					]
				}
			}
		},
		uglify: {
			options: {
				preserveComments: function(node, comment) {
					return /^@preserve|@license|@cc_on/i.test(comment.value);
				},
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			js: {
				files: {
					'js/all.min.js': ['src/js/all.concatenated.js']
				}
			}
		},
		less: {
			development: {
				options: {
					paths: ['']
				},
				files: {
					'css/styles.css': 'src/styles/less/style.less'
				}
			}
		},
		watch: {
			dev: {
				files: ['Gruntfile.js','**.js','src/**'],
				tasks: ['build'],
				options: {
					atBegin: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-react');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	// Default task(s).
	grunt.registerTask('default', [
		'react:all',
		'concat:js',
		'uglify:js',
		'less:development'
	]);
	
	grunt.registerTask('build', [
		'react:all',
		'concat:js',
		//'uglify:js',
		'less:development'
	]);


};