<template>
  <div>
    <header>
      <img src="/static/img/rafiki/rafiki.1.jpg" alt="Rafiki Outreach Program Logo" />
      <h1>The Rafiki Outreach Program</h1>
      <span class="subtitle">In Swahili, Rafiki Means Friend</span>
      <div class="actions">
        <a href="mailto:rhodyropers@gmail.com" target="_blank">
          <button>
            <font-awesome-icon icon="envelope-square" />&nbsp;Email
          </button>
        </a>
        <a
          href="https://www.facebook.com/Rafiki-Outreach-Program-1105234322897486/"
          target="_blank"
        >
          <button>
            <font-awesome-icon :icon="['fab', 'facebook-f']" />&nbsp;Facebook
          </button>
        </a>
      </div>
    </header>
    <main>
      <div class="left-image">
        <img src="/static/img/rafiki/rafiki.2.jpg" />
        <div>
          The Rafiki mission is to educate children and provide everything needed for he or she to
          become a successful jumper and a successful student in school. The program connects
          everyone: coaches, teachers, students, and jumpers. Rafiki currently includes coaches and
          jumpers in Kenya, Tanzania, Morocco, South Africa, Mozambique, India, Trinidad and Tobago,
          Dominican Republic, and Puerto Rico. If you are interested in participating, helping, or
          would like to know more you can email
          <a
            href="mailto:rhodyropers@gmail.com"
            target="_blank"
          >rhodyropers@gmail.com</a>
        </div>
      </div>
      <div class="right-image">
        <img src="/static/img/rafiki/rafiki.3.jpg" />
        <div>
          <h2>How can you help?</h2>
          <span>
            Rafiki is always interested in donations, especially rope donations. All types, sizes,
            colors, and conditions of ropes are welcome. If you are on a team, please talk to your coaches
            about gathering old team ropes to donate. Contact rhodyropers@gmail.com for more information
            or to start sending your ropes!
          </span>
        </div>
      </div>
      <div class="two-images">
        <img src="/static/img/rafiki/rafiki.4.jpg" />
        <img src="/static/img/rafiki/rafiki.5.jpg" />
      </div>
    </main>
  </div>
</template>

<style scoped>
header {
  max-width: var(--content-max-width);
  margin: auto;
  min-height: 20em;
}

header h1 {
  text-align: left;
}

header .subtitle {
  color: var(--d-grey);
}

header img {
  float: right;
  width: 50%;
  max-width: 20em;
}

.left-image,
.right-image,
.two-images {
  max-width: calc(var(--content-max-width) * 1.25);
  margin: auto;
  margin-bottom: 2em;
}

.two-images {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

main img {
  width: 45%;
}

.left-image img {
  float: left;
  margin-right: 0.3em;
}

.right-image img {
  float: right;
  margin-left: 0.3em;
}

@media screen and (max-width: 800px) {
  main img {
    width: 100%;
    margin-bottom: 2em;
  }
}

@media screen and (max-width: 500px) {
  header,
  header h1 {
    text-align: center;
    margin-top: 0;
  }
  header img {
    float: initial;
  }
}
</style>
