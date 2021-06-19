import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { persistCache } from 'apollo3-cache-persist'
import { getAuth } from 'firebase/auth'

const httpLink = createHttpLink({
  uri: 'https://api.the-tricktionary.com'
})

const authLink = setContext(async (_, { headers }) => {
  const token = await getAuth().currentUser?.getIdToken()
  return {
    ...headers,
    authorization: token ? `Bearer ${token}` : ''
  }
})

const cache = new InMemoryCache()

persistCache({
  cache,
  storage: localStorage
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache
})
