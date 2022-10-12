const TerserPlugin = require("terser-webpack-plugin")
const isProd = process.env.NODE_ENV === "production"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, options) => {
    config.optimization.minimize = isProd
    config.optimization.minimizer = [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: isProd
          }
        },
        extractComments: "all"
      })
    ]
    return config
  }
}

module.exports = nextConfig
