'use strict'
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')
const Dotenv = require('dotenv-webpack')
const UglifyEsPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = merge(baseConfig, {
  devtool: 'source-map',
  plugins: [
    new Dotenv({
      path: path.join(__dirname, '../.env'),
      safe: true,
      systemvars: true
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `"${process.env.NODE_ENV || 'production'}"`
    }),
    new UglifyEsPlugin({
      sourceMap: true,
      parallel: true
    }),
    new ExtractTextPlugin({
      filename: '[name].[contenthash].css',
      allChunks: false
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true,
        map: {
          inline: false
        }
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, '../src/index.html'),
      inject: true,
      excludeChunks: ['sw'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    }),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: '[name].[hash].js',
      chunks: ['app'],
      minChunks: module => {
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(path.join(__dirname, '../node_modules')) === 0
        )
      }
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: 'static',
        ignore: ['.*']
      }
    ])
  ]
})
