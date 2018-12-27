<template>
  <div class="shop">
    <h1>Shop</h1>
    <div class="info" v-if="stage === 'products'">
      <select @change="$store.dispatch('shop/setCurrency', $event.target.value)" :value="currency">
        <option value="SEK">SEK</option>
        <option value="EUR">EUR</option>
        <option value="USD">USD</option>
      </select>

      <span class="grey">Prices listed excluding VAT</span>
      <div class="products">
        <font-awesome-icon
          icon="spinner"
          spin
          v-if="Object.keys($store.state.products.docs).length === 0"
          size="6x"
        />
        <Product
          v-for="product in products"
          :product="product"
          :cart-status="cart(product.id)"
          :currency="currency"
          @cart-update="$store.dispatch('shop/updateCart', {change: $event, product: product.id})"
          :key="product.id"
        />
      </div>
      <button @click="stage = 'details'" :disabled="cartSize < 2">Next</button>
    </div>
    <form @submit.prevent="verifyCustomer" v-if="stage === 'details'">
      <CustomerInfo/>
      <button @click="stage = 'products'" type="button">Back</button>
      <button type="submit">Next</button>
    </form>
    <form @submit.prevent="checkout" v-if="stage === 'checkout'">
      <CostSummary @invalid="invalid = $event" ref="costSummary"/>
      <button @click="stage = 'details'" type="button">Back</button>
      <button type="submit">Pay</button>
    </form>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Product from "@/components/Product.vue";
import CostSummary from "@/components/CostSummary.vue";
import CustomerInfo from "@/components/CustomerInfo.vue";
import firebase from "firebase/app";

import "firebase/firestore";
import "firebase/auth";
import "firebase/functions";

@Component({
  components: {
    Product,
    CostSummary,
    CustomerInfo
  }
})
export default class Shop extends Vue {
  invalid: boolean = false;
  stage: string = "products";

  get products(): ProductObject[] {
    return Object.keys(this.$store.state.products.docs)
      .map((id: string): ProductObject => this.$store.state.products.docs[id])
      .filter((product: ProductObject): boolean => !product.hidden);
  }

  verifyCustomer(): void {
    if (this.$store.state.shop.customerDetails.vatnumber !== "") {
      firebase
        .functions()
        .httpsCallable("verifyBusiness")({
          customerDetails: this.$store.state.shop.customerDetails
        })
        .then(result => {
          console.log(result.data);
          if (result.data) {
            this.$store.dispatch("shop/customerDetails/update", {
              field: "vatValid",
              value: true
            });
            this.stage = "checkout";
          }
        });
    } else {
      this.stage = "checkout";
    }
  }

  checkout(): void {
    (this.$refs.costSummary as any).checkout();
  }

  cart(id: string): number {
    return this.$store.state.shop.cart[id] || 0;
  }

  get cartSize(): number {
    return Object.keys(this.$store.state.shop.cart)
      .map(id => this.$store.state.shop.cart[id])
      .reduce((acc, cur) => acc + cur, 0);
  }

  get currency(): string {
    return this.$store.state.shop.currency;
  }

  mounted(): void {
    this.$store.dispatch("products/openDBChannel");
  }
}
</script>

<style scoped>
.products {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  max-width: 600px;
  margin: auto;
  flex-wrap: wrap;
}

.info {
  max-width: 600px;
  margin: auto;
}
</style>
