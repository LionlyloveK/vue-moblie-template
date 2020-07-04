/*
 * @Author: coderqiqin@aliyun.com
 * @Date: 2020-07-04 09:23:45
 * @Last Modified by: CoderQiQin
 * @Last Modified time: 2020-07-04 09:54:44
 * postcss-px2rem: px自动转rem
 * webpack-bundle-analyzer: 资源分析
 * compression-webpack-plugin: 开启gzip
 * uglifyjs-webpack-plugin: 生产环境清除console
 */
// 文档: https://cli.vuejs.org/zh/
const { resolve } = require("path");
const CompressionWebpackPlugin = require("compression-webpack-plugin");

module.exports = {
  css: {
    sourceMap: true, // 是否为 CSS 开启 source map。设置为 true 之后可能会影响构建的性能。
    loaderOptions: {
      // 向 CSS 相关的 loader 传递选项(css-loader,postcss-loader,sass-loader,less-loader,stylus-loader)
      css: {},
      postcss: {
        plugins: [
          require("postcss-px2rem")({
            // todo: 排除UI框架可以使用postcss-px2rem-exclude
            remUnit: 75 // 不需要转换rem的单位Px或者PX
          })
        ]
      }
    }
  },
  pages: {
    index: {
      entry: "src/main.js",
      template: "public/index.html", // 模板来源
      filename: "index.html",
      title: "vue-template"
    }
  },
  lintOnSave: false,
  filenameHashing: true, //文件名中包含了 hash 以便更好的控制缓存,默认true
  outputDir: process.env.VUE_APP_OUTPUT_DIR,
  productionSourceMap: false,
  devServer: {
    // disableHostCheck: true,
    proxy: {
      "/api": {
        target: process.env.VUE_APP_BASE_URL,
        ws: true,
        changeOrigin: true
      }
    }
  },
  chainWebpack: config => {
    const types = ["vue-modules", "vue", "normal-modules", "normal"];
    types.forEach(type => addStyleResource(config.module.rule("scss").oneOf(type)));
  },
  configureWebpack: config => {
    // resolve: {
    //   alias: {
    //   }
    // }
    // 配置别名(弊端:无法直接定位到文件内)

    if (process.env.NODE_ENV === "production") {
      Object.assign(config, {
        // 排除打包文件
        externals: {
          vue: "Vue",
          axios: "axios",
          jquery: "jquery"
        }
      });
      if (process.env.npm_config_report) {
        // 打包后模块大小分析  npm run build --report
        const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
        config.plugins.push(new BundleAnalyzerPlugin());
      }

      config.plugins.push(
        new CompressionWebpackPlugin({
          filename: "[path].gz[query]",
          algorithm: "gzip",
          test: /\.js$|\.html$|\.css$/,
          threshold: 10240, // 对超过10k文件进行压缩
          minRatio: 0.8,
          deleteOriginalAssets: false // 是否删除源文件
        })
      );
    }
  }
};

function addStyleResource(rule) {
  rule
    .use("style-resource")
    .loader("style-resources-loader")
    .options({
      patterns: [resolve(__dirname, "./src/assets/style/core.scss")]
    });
}
