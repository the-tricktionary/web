module.exports = {
  client: {
    service: {
      name: 'the-tricktionary',
      // URL to the GraphQL API
      url: 'https://api.the-tricktionary.com',
    },
    // Files processed by the extension
    includes: [
      'src/**/*.vue',
      'src/**/*.js',
      'src/**/*.gql',
      'src/**/*.graphql',
    ],
  },
}
