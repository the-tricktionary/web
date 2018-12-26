<template>
  <div>
    <nav>
      <router-link to="/" class="logo">
        <img src="/static/img/tricktionary2.svg">
        <span class="name">
          <span class="small">the</span> Tricktionary
        </span>
      </router-link>
      <router-link to="/">Tricks</router-link>
      <router-link to="/speed">Speed</router-link>
      <router-link to="/apps">Apps</router-link>
      <router-link to="/shop">Shop</router-link>
      <router-link to="/contact">Contact</router-link>
      <router-link to="/coach">Coach</router-link>
      <router-link to="/profile">Profile</router-link>
      <a>Sign Out</a>
    </nav>
    <router-view/>
  </div>
</template>

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
  --nav-items: 8;
  --content-max-width: 600px;
}

/* snippets from normalize.css */
body {
  margin: 0;
  padding: 0.3em;
  box-sizing: border-box;
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
  max-width: 600px;
}

iframe.stripe_checkout_app {
  max-width: initial;
}

/* nav */
nav {
  height: 45px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--l-red);
  border-bottom: 1px solid var(--d-red);
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
  z-index: 100000;
}

nav a {
  display: block;
  color: white;
  text-decoration: none;
  white-space: nowrap;
}

nav a.logo {
  margin-right: auto;
  white-space: nowrap;
}

nav a.logo span.name {
  font-size: 24px;
  float: right;
  margin-top: 11px;
}

nav a:not(.logo) {
  background: var(--d-red);
  border-radius: 0.3em;
  margin: 0.2em;
  padding: 0.25em 0.3em 0.3em 0.3em;
}

nav a img {
  max-height: 32px;
  padding: 6px;
  margin-top: 4px;
}

p {
  max-width: 600px;
  margin: auto;
}

.inputgroup {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}

/* forms */

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

input:invalid,
select:invalid {
  border-bottom: 1px solid var(--l-red);
}

form {
  max-width: 600px;
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
</style>
