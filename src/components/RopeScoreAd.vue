<template>
  <div>
    <div class="container">
      <div class="brand">
        <a href="https://ropescore.com" target="_blank">
          <img src="https://ropescore.com/static/img/icon.png" alt="RopeScore Logo" />
        </a>
        <span>RopeScore</span>
      </div>
      <div class="info">
        <span>
          Simple yet powerful scoring for
          <b>your local rules</b> and
          <b>IJRU rules</b>. Works
          <b>without</b> internet.
        </span>
      </div>
      <div class="actions">
        <a href="https://ropescore.com/" target="_blank">
          <button>Learn More</button>
        </a>
      </div>
    </div>
    <div class="center">The content above is an ad</div>
  </div>
</template>

<style scoped>
.container {
  margin: auto;
  max-width: var(--content-max-width);
  border: 1px solid var(--l-grey);
  padding: 0.3em;
}

.brand,
.info,
.actions {
  text-align: center;
}

img {
  height: 4em;
  width: 4em;
  margin-bottom: -0.6em;
  border: none;
}

.brand span {
  font-size: 4em;
  font-weight: bold;
}

.actions button {
  background-color: #000;
  color: #fff;
  margin-top: 0.3em;
}

.actions button:hover {
  background-color: #444;
}
</style>
