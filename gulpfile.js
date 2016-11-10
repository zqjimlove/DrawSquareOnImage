var gulp = require('gulp'),
    fs = require('fs'),
    path = require('path'),
    connect = require('gulp-connect'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),
    ts = require("gulp-typescript"),
    rename = require("gulp-rename"),
    changed = require('gulp-changed');


gulp.task('serve', function () {
    //服务开启
    connect.server({
        port: 9900,
        host: '0.0.0.0',
        root: ['dist', 'demo'],
        livereload: true
    });

    //检测文件变动
    watch(['demo/**/*.{html,js,png,gif,jpg}', 'dist/*.js'], function (event) {
        gulp.src(event.path).pipe(connect.reload());
    });

    watch(['src/**/*.ts'], function (event) {
        gulp.run(['typescript']);
    });
});

gulp.task('typescript', function () {
    var dest = 'dist';
    return gulp.src('src/**/*.ts', {
            base: 'src/'
        })
        .pipe(changed(dest))
        .pipe(ts({
            "noImplicitAny": false,
            "target": "es5"
        }))
        .on('error', function (err) {
            console.error(err);
        }).pipe(gulp.dest(dest));
});


gulp.task('clean', function () {
    return gulp.src('dist').pipe(clean());
});

gulp.task('build', ['clean', 'typescript'], function () {
    gulp.src('dist/*.js').pipe(uglify()).pipe(rename({
        suffix: '.min'
    })).pipe(gulp.dest('dist'));
});