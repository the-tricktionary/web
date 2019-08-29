<template>
  <div class="center">
    <a target="_blank" rel="noopener" href="http://fb.me/jumpropetricktionary">
      <button>
        <font-awesome-icon :icon="['fab', 'facebook-square']" />&nbsp; Facebook
      </button>
    </a>
    <a target="_blank" rel="noopener" href="http://instagram.com/jumpropetricktionary">
      <button>
        <font-awesome-icon :icon="['fab', 'instagram']" />&nbsp; Instagram
      </button>
    </a>

    <a
      target="_blank"
      rel="noopener"
      href="https://play.google.com/store/apps/details?id=trictionary.jumproper.com.jumpropetrictionary"
    >
      <button>
        <font-awesome-icon :icon="['fab', 'google-play']" />&nbsp; Google Play
      </button>
    </a>
    <a target="_blank" rel="noopener" href="">
        <button>
          <font-awesome-icon :icon="['fab', 'apple']"/>&nbsp; App Store
        </button>
    </a>
    <a
      href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=WVNM754ZP3DB2"
      target="_blank"
      rel="noopener"
    >
      <button>
        <font-awesome-icon :icon="['fab', 'paypal']" />&nbsp;Donate
      </button>
    </a>
    <router-link to="/shop" tag="button">
      <font-awesome-icon icon="shopping-cart" />&nbsp;Shop
    </router-link>
  </div>
</template>

<style scoped>
.center {
  margin-top: 1em;
}
</style>
