<template>
  <div class="product">
    <div class="image" :style="product.image ? 'background-image: url(' + product.image + ')' : ''"></div>
    <div class="details">
      <span class="name">{{ product.name }}</span>
      <span class="description">{{ product.description }}</span>
      <span
        class="price"
      >{{ product.prices[currency] / 100 }} {{ currency }}{{ product.unit ? '/' : '' }}{{ product.unit }}</span>
    </div>
    <div class="cart-status">
      <button :disabled="cartStatus === 0" @click="$emit('cart-update', -1)">
        <font-awesome-icon icon="minus"/>
      </button>
      <span>{{ !product.qty ? 'Out of Stock' : cartStatus }}</span>
      <button :disabled="cartStatus === product.qty" @click="$emit('cart-update', 1)">
        <font-awesome-icon icon="plus"/>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Product extends Vue {
  @Prop() private product!: ProductObject;
  @Prop({ default: 0 }) private cartStatus!: number;
  @Prop() private currency!: string;
}
</script>

<style scoped>
.product {
  display: block;
  width: 47%;
  height: 40em;
  margin: 0.5em;
  position: relative;
  border: 1px solid var(--rl-grey);
  border-radius: 1em;
  box-shadow: 0 0 0.5em 0.3em var(--rl-grey);
  overflow: hidden;
}

@media all and (max-width: 600px) {
  .product {
    width: 100%;
  }
}

.image {
  display: block;
  height: 15em;
  width: 100%;
  background-color: var(--l-grey);
  background-size: cover;
  background-position: center;
}

.details {
  padding: 0.5em;
  position: relative;
}

.name {
  display: block;
  font-size: 1.3em;
  font-weight: bold;
}

.description {
  color: var(--m-grey);
  display: block;
}

.price {
  display: block;
  font-weight: bold;
}

.cart-status {
  position: absolute;
  bottom: 0;
  width: 100%;
  border-top: 1px solid var(--l-grey);
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
}

button {
  background: none;
  border: none;
  padding: 0.5em;
  width: 4em;
  outline: none;
  margin: 0;
  border-radius: 0;
}

button:hover:not(:disabled) {
  background: var(--l-grey);
  border: none;
}

button:first-child {
  border-right: 1px solid var(--l-grey);
}

button:last-child {
  border-left: 1px solid var(--l-grey);
}
</style>
