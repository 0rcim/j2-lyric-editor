const path = require("path");
const gulp = require("gulp");
const cssnano = require("gulp-cssnano");
const less = require("gulp-less");
const rename = require("gulp-rename");
const watch = require("gulp-watch");

gulp.task("build:style", done => {
	gulp
	.src(["src/!(styles)/**/*.less", "src/*.less"], { base: "src" })
	.pipe(less())
	.pipe(
		cssnano(
			{
				zindex: false,
				autoprefixer: false,
				discardComments: { removeAll: true },
				svgo: false
			}
		)
	)
	.pipe(
		rename(function (path) {
			path.extname = ".wxss";
		})
	)
	.pipe(
		gulp.dest("dist")
	);
	done();
});

gulp.task("build:page", done => {
	gulp
	.src(
		[
			"src/*.!(less)",
			"src/**/*.!(less)"
		],
		{ base: "src" }
	)
	.pipe(gulp.dest("dist"));
	done();
});

gulp.task("build", gulp.parallel("build:style", "build:page"));

gulp.task("default", done => {
	watch(
		path.resolve(__dirname, "src/**/*"),
		gulp.parallel("build:style", "build:page")
	);
});