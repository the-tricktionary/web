<template>
  <div class="shop">
    <h1>Shop</h1>
    <div v-if="stage === 'success'">
      <h2>Thank you for your purchase!</h2>
      <p>You'll soon recieve an order confirmation by email</p>
      <p>
        <button @click="stage = 'products'">Close</button>
      </p>
    </div>
    <div v-if="stage === 'cancel'">
      <h2>Purchase Canceled!</h2>
      <p>
        <button @click="stage = 'products'">Start Over</button>
      </p>
    </div>
    <form @submit.prevent="checkout" v-else-if="stage === 'checkout'">
      <CostSummary @invalid="invalid = $event" ref="costSummary"/>
      <p
        v-if="$store.state.shop.customerDetails.vatValid === false"
        class="notify error"
      >Invalid VAT number, VAT will be charged. You can go back and fix it</p>
      <button @click="stage = 'details'" type="button">Back</button>
      <button type="submit" :disabled="loading">Pay</button>
      <span v-if="loading">
        <font-awesome-icon icon="spinner" spin/>Redirecting to payment
      </span>
      <p>
        By pressing pay you agree to our
        <router-link to="/policies">Policies</router-link>.
        You will be redirected to our secure payment provider, Stripe
      </p>
      <p>
        <img src="/static/img/swantzter.png" class="logo">This store is operated by
        <a
          href="https://swantzter.se"
          target="_blank"
          rel="noopener"
        >Swantzter</a> who will process your order and payment.
      </p>
      <p>
        If you believe that you'll meet Svante Bengtson on a competition or camp shortly, please email
        <a
          href="mailto:shop@the-tricktionary.com"
        >shop@the-tricktionary.com</a>.
        We might be able to arrange so that you won't have to pay shipping.
      </p>
    </form>
    <form @submit.prevent="verifyCustomer" v-else-if="stage === 'details'">
      <CustomerInfo/>
      <button @click="stage = 'products'" type="button">Back</button>
      <button type="submit" :disabled="loading">Next</button>
      <span v-if="loading">
        <font-awesome-icon icon="spinner" spin/>Verifying
      </span>
    </form>

    <div class="info" v-else>
      <select @change="$store.dispatch('shop/setCurrency', $event.target.value)" :value="currency">
        <option v-for="curr in currencies" :value="curr" :key="curr">{{ curr }}</option>
      </select>

      <span class="grey">Prices listed excluding VAT</span>
      <div class="products">
        <div class="center" v-if="Object.keys($store.state.products.docs).length === 0">
          <font-awesome-icon icon="spinner" spin size="6x"/>
          <br>Loading Products
        </div>
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
  loading: boolean = false;

  get products(): ProductObject[] {
    return Object.keys(this.$store.state.products.docs)
      .map((id: string): ProductObject => this.$store.state.products.docs[id])
      .filter((product: ProductObject): boolean => !product.hidden);
  }

  get currencies(): string[] {
    return Object.keys(this.$store.state.products.docs)
      .map(
        (id: string): string[] =>
          Object.keys(this.$store.state.products.docs[id].skus).map(
            (currency: string): string => currency.substring(0, 3)
          )
      )
      .reduce((acc: string[], val: string[]): string[] => acc.concat(val), [])
      .filter(
        (value: string, index: number, self: string[]): boolean => {
          return self.indexOf(value) === index;
        }
      );
  }

  verifyCustomer(): void {
    if (this.$store.state.shop.customerDetails.vatnumber !== "") {
      this.loading = true;
      firebase
        .functions()
        .httpsCallable("verifyBusiness")({
          customerDetails: this.$store.state.shop.customerDetails
        })
        .then(result => {
          console.log(result.data);
          this.$store.dispatch("shop/customerDetails/update", {
            field: "vatValid",
            value: result.data.vat_valid
          });
          this.stage = "checkout";
          this.loading = false;
        });
    } else {
      this.stage = "checkout";
    }
  }

  checkout(): void {
    this.loading = true;
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
    if (this.$route.query.state === "success") {
      this.stage = "success";
    }
    if (this.$route.query.state === "cancel") {
      this.stage = "cancel";
    }
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

img.logo {
  height: 2em;
}

div.center {
  width: 100%;
  text-align: center;
}
</style>
