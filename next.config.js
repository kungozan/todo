const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')
const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')

module.exports = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      reactStrictMode: true
    }
  }

  return withPWA({
    reactStrictMode: true,
    pwa: {
      dest: 'public',
      runtimeCaching
    }
  })
}
