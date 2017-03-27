var browserify = require("browserify"),
    bower = require("gulp-bower"),
    concat = require("gulp-concat"),
    gulp = require("gulp"),
    gutil = require("gulp-util"),
    pug = require("gulp-pug"),
    stylus = require("gulp-stylus"),
    nodemon = require("gulp-nodemon"),
    nib = require("nib"),
    path = require("path"),
    source = require("vinyl-source-stream"),
    mocha = require("gulp-mocha"),
    exit = require("gulp-exit");

var paths = {
    public: "public/**",
    pug: "app/**/*.pug",
    styles: { watch: ["app/styles/**/*.styl"], src: "app/styles/main.styl", out: "./public/css" },
    scripts: "app/**/*.js",
    staticFiles: [
        "!app/**/*.+(styl|css|js|pug)",
        "app/**/*.*"
    ],
    clientTests: [],
    serverTests: ["test/server/**/*.js"]
};

gulp.task("pug", function() {
    gulp.src(paths.pug)
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest("./public/"));
});

gulp.task("styles", function () {
    gulp.src(paths.styles.src)
    .pipe(stylus({
        use: [ nib() ],
        paths: [ path.join(__dirname, "styles") ]
    }))
    .pipe(gulp.dest(paths.styles.out));
});

gulp.task("static-files", function(){
    return gulp.src(paths.staticFiles)
    .pipe(gulp.dest("public/"));
});

gulp.task("scripts", function() {
    gulp.src(paths.scripts)
    .pipe(concat("index.js"))
    .pipe(gulp.dest("./public/js"));
});

gulp.task("browserify", function() {
    var b = browserify();
    b.add("./app/js/index.js");

    return b.bundle()
    .on("success", gutil.log.bind(gutil, "Browserify Rebundled"))
    .on("error", gutil.log.bind(gutil, "Browserify Error: in browserify gulp task"))
    .pipe(source("index.js"))
    .pipe(gulp.dest("./public/js"));
});

gulp.task("watch", function() {
    gulp.watch(paths.pug, ["pug"]);
    gulp.watch(paths.styles.watch, ["styles"]);
    gulp.watch(paths.scripts, ["browserify"]);
});

gulp.task("nodemon", function () {
    nodemon({ script: "index.js", ext: "js", ignore: ["public/**","app/**","node_modules/**"] })
    .on("restart", function () {
        console.log(">> restart server");
    });
});

gulp.task("bower", function() {
    return bower()
    .pipe(gulp.dest("public/lib/"));
});

gulp.task("test:server", ["test:client"], function() {
    return gulp.src(paths.serverTests)
    .pipe(mocha({
        reporter: "spec",
        timeout: 50000
    }))
    .pipe(exit());
});

gulp.task("build", ["bower", "pug", "styles", "browserify", "static-files"]);
gulp.task("default", ["nodemon", "build", "watch"]);
