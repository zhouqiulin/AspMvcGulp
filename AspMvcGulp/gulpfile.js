var gulp = require("gulp"),
    clean = require("gulp-clean"),
    less = require("gulp-less"),
    minifycss = require("gulp-minify-css"),
    autoprefixer = require("gulp-autoprefixer"),
    imagemin = require("gulp-imagemin"),
    uglify = require("gulp-uglify"),
    rev = require("gulp-rev"),
    revcollector = require("gulp-rev-collector"),
    sequence = require("gulp-sequence"),
    minifycshtml = require("gulp-minify-cshtml"),
    bom = require("gulp-bom"),
    del = require("del");


var path = {

    //静态资源文件夹路径
    css: "Content/css",
    img: "Content/images",
    js: "Content/js",
    font: "Content/font",


    //Less路径
    less: "Content/less",

    //构建文件夹路径
    distcss: "Dist/Content/css",
    distimg: "Dist/Content/images",
    distjs: "Dist/Content/js",
    distfont: "Dist/Content/font",

}

//Less编译(配合Watch任务使用)
gulp.task("less", function () {
    return gulp.src(path.less + "/**/*.{less,css}")
       .pipe(less())
       .pipe(autoprefixer({
           browsers: ['last 2 versions'],
       }))
       .pipe(gulp.dest(path.css));

})

//Css压缩和添加版本号
gulp.task("css", function () {

    var stream = gulp.src(path.css + "/**/*.css")
        .pipe(minifycss())
        .pipe(rev())
        .pipe(gulp.dest(path.distcss))
        .pipe(rev.manifest())
        .pipe(gulp.dest(path.css));

    stream = gulp.src(path.font + "/**/iconfont.css")
   .pipe(minifycss())
   .pipe(rev())
   .pipe(gulp.dest(path.distfont))
   .pipe(rev.manifest())
   .pipe(gulp.dest(path.font));

    return stream;


})

//Image压缩和添加版本号
gulp.task("img", function () {
    return gulp.src(path.img + "/**/*.{jpeg,jpg,png,gif}")
          .pipe(imagemin())
          .pipe(rev())
          .pipe(gulp.dest(path.distimg))
          .pipe(rev.manifest())
          .pipe(gulp.dest(path.img))

})

//Js混淆和添加版本号
gulp.task("js", function () {
    return gulp.src(path.js + "/**/*.js")
       .pipe(uglify())
       .pipe(rev())
       .pipe(gulp.dest(path.distjs))
       .pipe(rev.manifest())
       .pipe(gulp.dest(path.js))
})

//复制Font(这里不加版本号)，为Font（iconfont.css）添加版本号
gulp.task("font", function () {
    var stream = gulp.src([path.font + "/**/*.*", "!" + path.font + "/**/*.css"])
      // .pipe(rev())
       .pipe(gulp.dest(path.distfont))
    //.pipe(rev.manifest())
    //  .pipe(gulp.dest(path.font))

    stream = gulp.src(path.font + "/**/iconfont.css")
      .pipe(minifycss())
      .pipe(rev())
      .pipe(gulp.dest(path.distfont))
      .pipe(rev.manifest())
      .pipe(gulp.dest(path.font));

    return stream;
})

//复制其他必须文件
gulp.task("copy", function () {
    return gulp.src(["**/*.*", "!*.{json,js,csproj,user,ashx,cs}", "!{App_Data,App_Start,Properties,obj,Dist,node_modules,Content}/**/*.*"])
   .pipe(gulp.dest("Dist"))
})

// 更新Css引入的文件
gulp.task("revcss", function () {
    return gulp.src(["**/rev-manifest.json", path.distcss + "/**/*.css"])
            .pipe(revcollector())
            .pipe(gulp.dest(path.distcss))

})

// 更新视图引入的文件(只有View下的cshtml和根目录中的html)发布
gulp.task("revviews", function () {
    return gulp.src(["**/rev-manifest.json", "Dist/*.html", "Dist/**/*.cshtml"])
          .pipe(revcollector())
          .pipe(bom())
          .pipe(minifycshtml({
              comments: true,       // Remove HTML comments <!-- --> 
              razorComments: true,  // Remove Razor comments @* *@ 
              whitespace: true      // Remove white-space 
          }))
          .pipe(gulp.dest("Dist"))

})

//清理之前的构建文件夹
gulp.task("del", function () {
    return del(['dist']);
})


//正式发布
gulp.task("dist", function (done) {
    sequence(
         ["del"],
         ["less"],
         ["copy", "css", "img", "js", "font"],
         ["revcss", "revviews"],
    done);
});


//监视任务
gulp.task("watch", function () {
    gulp.watch(path.less + "/**/*.less", ["less"]);
});


//定义默认任务
gulp.task("default", ["watch"]);



