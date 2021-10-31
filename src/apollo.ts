import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { persistCache } from 'apollo3-cache-persist'
import { getAuth } from 'firebase/auth'

import type { SpeedResultsQueryVariables } from './graphql/generated/graphql'

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL
})

const authLink = setContext(async (_, { headers }) => {
  const token = await getAuth().currentUser?.getIdToken()
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})

const cache = new InMemoryCache({
  typePolicies: {
    User: {
      merge (existing, incoming, { mergeObjects }) {
        return mergeObjects(existing, incoming)
      },
      fields: {
        speedResults: {
          keyArgs: false,
          merge (existing: any[] = [], incoming: any[], { readField, args }) {
            const merged = existing.slice(0)
            const existingIds = new Set(merged.map(doc => readField('id', doc)))

            incoming = incoming.filter(doc => !existingIds.has(readField("id", doc)))
            const afterIndex = merged.findIndex(doc => (args as SpeedResultsQueryVariables).startAfter === readField("createdAt", doc))


            if (afterIndex >= 0) {
              merged.splice(afterIndex + 1, 0, ...incoming)
            } else {
              merged.push(...incoming)
            }
            return merged
          }
        }
      }
    }
  }
})

persistCache({
  cache,
  storage: localStorage
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache
})
