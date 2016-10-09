var gulp = require('gulp'),
    fs = require('fs'),
    path = require('path'),
    connect = require('gulp-connect'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),
    changed = require('gulp-changed');


gulp.task('serve', function() {

    //服务开启
    connect.server({
        port: 9900,
        host: '0.0.0.0',
        root: ['src', 'demo'],
        livereload: true
    });

    //检测文件变动
    watch(['demo/**/*.{html,js,png,gif,jpg}',
        'src/**/*.js'
    ], function(event) {
        gulp.src(event.path).pipe(connect.reload());
    });

});

gulp.task('clean', function() {
    return gulp.src('dist').pipe(clean());
})

gulp.task('build', ['clean'], function() {

    gulp.src('src/*.js').pipe(uglify()).pipe(gulp.dest('dist'));
})
