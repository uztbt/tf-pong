# tf-pong
Sample project for my future reference.

## Config Files
### package.json
* main: dist/bundle.js
* scripts: dev, build, watch, prod, start
* devDependencies
* dependencies

### package-lock.json
* Package list with exact versions

### tsconfig.json
* compilerOptions
  * baseUrl
  * declaration
  * outDir
  * sourceMap
  * noImplicitAny
  * module
  * target
  * lib
  * jsx
  * moduleResolution
  * rootDir
* include

### webpack.config.js
* module.exports
  * mode: development
  * entry: ./src/index.ts
  * devServer
    * open
    * hot
    * publicPath
  * devtool: source
  * output
  * resolve: .ts, .tsx, .js, .json
  * module
    * rules
      * { test: /\.tsx?$/, loader: "ts-loader", exclude: '/node_modules/' }
      * { test: /\.css$/, use: ['style-loader', 'css-loader']}
  * plugins: HtmlWebpackPlugin, webpack.HotModuleReplacementPlugin()