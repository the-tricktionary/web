import { ApolloClient, createHttpLink, InMemoryCache, type Reference } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { CachePersistor } from 'apollo3-cache-persist'
import { getAuth } from 'firebase/auth'

const httpLink = createHttpLink({
  uri: `${import.meta.env.VITE_GRAPHQL_URL}/graphql`,
  // identifies the app to the API, see the API's README
  headers: import.meta.env.VITE_API_KEY ? { 'api-key': import.meta.env.VITE_API_KEY } : {}
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
    // value ids are only unique within their tag
    TagValue: {
      keyFields: false
    },
    Group: {
      fields: {
        speedResults: {
          // As User.speedResults, with the filters a group's list also takes
          keyArgs: ['eventDefinitionId', 'constellation'],
          merge (existing: readonly Reference[] = [], incoming: readonly Reference[], { readField }) {
            const merged = new Map<string, Reference>()
            for (const ref of [...existing, ...incoming]) merged.set(ref.__ref, ref)
            return [...merged.values()].sort((a, b) => (readField<number>('createdAt', b) ?? 0) - (readField<number>('createdAt', a) ?? 0))
          }
        }
      }
    },
    User: {
      merge (existing, incoming, { mergeObjects }) {
        return mergeObjects(existing, incoming)
      },
      fields: {
        speedResults: {
          // Pages are fetched with startAfter set to the last result's
          // createdAt, all pages of one listing live in one list newest
          // first; a listing filtered to an event or a group is its own list
          keyArgs: ['eventDefinitionId', 'groupId'],
          merge (existing: readonly Reference[] = [], incoming: readonly Reference[], { readField }) {
            const merged = new Map<string, Reference>()
            for (const ref of [...existing, ...incoming]) merged.set(ref.__ref, ref)
            return [...merged.values()].sort((a, b) => (readField<number>('createdAt', b) ?? 0) - (readField<number>('createdAt', a) ?? 0))
          }
        }
      }
    }
  }
})

/** Exported so signing out can empty what was kept on the device */
export const persistor = new CachePersistor({
  cache,
  storage: localStorage
})

void persistor.restore()

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache
})
