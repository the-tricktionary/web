<template>
  <div class="container">
    <nav :class="{ mobile: screenWidth < breakAt, collapsed }">
      <router-link to="/" class="logo" tag="div">
        <img src="/static/img/tricktionary2.svg" />
        <span class="name">
          <span class="small">the</span> Tricktionary
          <span v-if="$route.name === 'shop'">Shop</span>
        </span>
      </router-link>
      <a @click="collapsed = !collapsed" class="menu">
        <font-awesome-icon icon="bars" />
      </a>
      <router-link to="/tricks" v-if="$route.name !== 'shop'">Tricks</router-link>
      <a href="https://the-tricktionary.com" v-if="$route.name === 'shop'">Tricks</a>
      <!-- <router-link to="/speed" v-if="$route.name !== 'shop'">Speed</router-link> -->
      <!-- <router-link to="/apps" v-if="$route.name !== 'shop'">Apps</router-link> -->
      <router-link to="/shop">Shop</router-link>
      <!-- <router-link to="/contact" v-if="$route.name !== 'shop'">Contact</router-link> -->
      <!-- <router-link to="/coach" v-if="$route.name !== 'shop'">Coach</router-link> -->
      <router-link
        to="/profile"
        v-if="$route.name !== 'shop'"
      >{{ $store.state.users.currentUser ? 'Profile' : 'Sign In' }}</router-link>
      <!-- <a>Sign In</a> -->
    </nav>
    <router-view />
    <footer>
      <router-link to="/policies">Privacy, Policies</router-link>
    </footer>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator';

@Component
export default class App extends Vue {
  breakAt: number = 687;
  screenWidth: number = 0;
  collapsed: boolean = true;

  @Watch('$route', { immediate: true, deep: true })
  onRouteChanged () {
    this.collapsed = true
  }

  destroyed () {
    window.removeEventListener('resize', this.handleResize)
  }

  handleResize () {
    this.screenWidth = window.innerWidth || this.screenWidth

    let elHeight = document
      .getElementsByTagName('nav')[0]
      .getElementsByTagName('a')[2].offsetHeight
    document.documentElement.style.setProperty(
      '--nav-item-height',
      elHeight + 'px'
    )
  }

  mounted () {
    // this.breakAt = Array.prototype.slice
    //   .call(document.getElementsByTagName("nav")[0].children, 0)
    //   .map(el => el.offsetWidth + 10)
    //   .reduce((curr, acc) => curr + acc);

    window.addEventListener('resize', this.handleResize)
    this.handleResize()

    setTimeout(() => {
      this.handleResize()
    })

    let items =
      Array.prototype.slice.call(
        document.getElementsByTagName('nav')[0].getElementsByTagName('a'),
        0
      ).length - 1

    document.documentElement.style.setProperty('--nav-items', '' + items)
  }
}
</script>

<style>
/* colours */
:root {
  --l-red: #fe3500;
  --d-red: #da1100;
  --l-yellow: #feedb2;
  --d-yellow: #fec500;
  --black: #333;
  --m-grey: #666;
  --d-grey: #292f2f;
  --h-grey: #cfd8dc;
  --l-grey: #ccc;
  --rl-grey: #eee;
  --l-green: #32cd32;
  --d-blue: #008499;
  --l-blue: #3baec4;
  --white: #fff;
  --content-max-width: 600px;
  --nav-items: 8;
  --nav-item-height: 2.5em;
}

/* snippets from normalize.css */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0.3em;
  font-family: "PT Sans", sans-serif;
  margin-top: 45px;
}

button,
input,
optgroup,
select,
textarea {
  font-family: inherit; /* 1 */
  font-size: 100%; /* 1 */
  line-height: 1.15; /* 1 */
  margin: 0; /* 2 */
}

button::-moz-focus-inner,
[type="button"]::-moz-focus-inner,
[type="reset"]::-moz-focus-inner,
[type="submit"]::-moz-focus-inner {
  border-style: none;
  padding: 0;
}

button:-moz-focusring,
[type="button"]:-moz-focusring,
[type="reset"]:-moz-focusring,
[type="submit"]:-moz-focusring {
  outline: 1px dotted ButtonText;
}

select {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 3px;
  padding: 3px 22px 3px 3px;
  background-image: url("data:image/svg+xml, %3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M7.406 7.828l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z'%3E%3C/path%3E%3C/svg%3E");
  background-position: calc(100% - 3px) 50%;
  background-repeat: no-repeat;
  background-size: 16px;
  -webkit-appearance: none;
  -moz-appearance: none;
}
select::-ms-expand {
  display: none;
}

[type="search"] {
  -webkit-appearance: textfield; /* 1 */
  outline-offset: -2px; /* 2 */
}

[hidden] {
  display: none;
}

/* general helpers */
.small {
  font-size: 0.5em;
}

.big {
  font-size: 2em;
}

h1,
.h1 {
  color: var(--black);
  font-size: 2.5em !important;
  margin-bottom: 0;
  min-width: 80%;
  text-align: center;
}

h2,
h3 {
  color: var(--d-gray);
  font-weight: lighter;
  text-align: center;
}

h1 + h2 {
  margin-top: 0;
}

iframe {
  width: 100%;
  max-width: var(--content-max-width);
}

iframe.stripe_checkout_app {
  max-width: initial;
}

a,
a:visited {
  color: var(--d-blue);
  text-decoration: none;
}

a:hover {
  color: var(--l-blue);
  text-decoration: underline;
}

/* nav */
nav {
  height: 45px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding-right: 0.2em;
  background: var(--l-red);
  border-bottom: 1px solid var(--d-red);
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  z-index: 100000;
}

nav a,
nav a:visited,
nav div.logo {
  display: block;
  color: white;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}

nav a:hover,
nav a:visited:hover {
  color: white;
  text-decoration: none;
}

nav .menu {
  display: none;
}

nav .logo {
  margin-right: auto;
  white-space: nowrap;
  margin-bottom: 5px;
}

nav .logo span.name {
  font-size: 24px;
  float: right;
  margin-top: 6px;
}

nav a:not(.logo) {
  background: var(--d-red);
  border-radius: 0.3em;
  margin: 0.2em;
  padding: 0.25em 0.3em 0.3em 0.3em;
}

nav a:not(.logo):hover {
  color: var(--black);
  background: var(--d-yellow);
}

nav .logo img {
  max-height: 32px;
  margin-top: 4px;
  margin-left: 6px;
  margin-right: 6px;
}

nav.mobile {
  /* flex-direction: column; */
  flex-wrap: wrap;
  padding-right: 0;
  overflow-y: hidden;
  height: calc(var(--nav-items) * var(--nav-item-height) + 45px);
  transition: height 0.5s;
}

nav.mobile .menu {
  display: initial;
  margin-right: 0.4em;
  padding-left: 0.5em;
  padding-right: 0.5em;
}

nav.mobile.collapsed {
  height: 45px;
}

nav.mobile a:not(.logo):not(.menu) {
  width: 100%;
  margin: 0;
  border-radius: 0;
  border-bottom: 1px solid var(--l-red);
  background: var(--d-red);
  font-size: 2.4em;
  padding-top: 0;
  padding-bottom: 0;
}

nav.mobile a:not(.logo):hover {
  color: var(--white);
  background: var(--d-yellow);
}

p,
div.text {
  max-width: var(--content-max-width);
  margin: auto;
  margin-bottom: 0.5em;
}

div.center {
  text-align: center;
}

/* footer */
footer {
  margin: auto;
  text-align: center;
}

/* forms */
.inputgroup {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}

label {
  display: block;
  padding-bottom: 0.5em;
  width: 100%;
  position: relative;
}

.half {
  width: 47%;
}

input,
select {
  display: block;
  width: 100%;
  padding: 0.3em;
  outline: none;
  border: none;
  background-color: none;
  border: 1px solid var(--l-grey);
  border-radius: 0.3em;
  font-size: 12pt;
}

input:focus,
select:focus {
  border-bottom: 1px solid var(--d-yellow);
}

input:invalid,
select:invalid {
  border-bottom: 1px solid var(--l-red);
}

form {
  max-width: var(--content-max-width);
  margin: auto;
}

button {
  background: none;
  border: none;
  padding: 0.5em;
  outline: none;
  border: 1px solid var(--l-grey);
  border-radius: 0.3em;
  cursor: pointer;
  margin-right: 0.3em;
  margin-bottom: 0.3em;
}

form:not(:invalid) button:not(:disabled):hover,
button:not(:disabled):hover {
  background: var(--l-grey);
}

form:invalid button:not([type="button"]),
button:disabled {
  background: var(--rl-grey);
  cursor: default;
}

button.checkbox {
  position: relative;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-left: 2.5em !important;
}

button.checkbox:before {
  content: " ";
  position: absolute;
  top: -1px;
  right: 100%;
  height: 100%;
  width: 2.5em;
  background-color: var(--d-red);
  border: 1px solid var(--l-grey);
  border-right: none;
  border-top-left-radius: 0.3em;
  border-bottom-left-radius: 0.3em;
  transition: 0.2s background-color;
}

button.checkbox.checked:before {
  background-color: var(--l-green);
}

/* notifies */
.notify {
  display: block;
  width: 100%;
  max-width: var(--content-max-width);
  padding: 0.5em;
  margin: auto;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  border: 1px solid var(--d-blue);
}

.notify.warning {
  border-color: var(--d-yellow);
}

.notify.error {
  border-color: var(--d-red);
}
</style>
