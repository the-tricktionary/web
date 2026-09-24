# The Tricktionary Web app
A webapp to provide a dictionary of jumprope tricks and functionalities that makes ropeskippers life easier.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + the [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension,
plus the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
and [UnoCSS](https://marketplace.visualstudio.com/items?itemName=antfu.unocss) extensions.

## Development

```sh
npm ci
npm run codegen   # generates src/graphql/generated from the live API schema
npm run dev
```

`.env.local` needs `VITE_GRAPHQL_URL`, the API, and `VITE_API_KEY`, the
`API_KEY` variable of this repository's Actions.

Other useful scripts:

- `npm run lint` / `npm run lint:fix` — ESLint (neostandard + typescript-eslint + eslint-plugin-vue), which is also the formatter
- `npm run typecheck` — vue-tsc
- `npm run build` — production build with UnoCSS (preset-wind4) and the PWA service worker

## Analytics Events

- The `unlock_achievement` event is used to mark that a user has marked a trick
  as completed, the `achievement_id` is set to `Trick:${trick.id}`
