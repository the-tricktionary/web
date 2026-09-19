import { ApolloClient, createHttpLink, InMemoryCache, type Reference } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { persistCache } from 'apollo3-cache-persist'
import { getAuth } from 'firebase/auth'

const httpLink = createHttpLink({
  uri: `${import.meta.env.VITE_GRAPHQL_URL}/graphql`
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
          // Pages are fetched with startAfter set to the last result's
          // createdAt, all pages live in one list newest first
          keyArgs: false,
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

void persistCache({
  cache,
  storage: localStorage
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache
})
