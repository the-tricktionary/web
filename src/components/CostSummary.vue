<template>
  <div class="cost">
    <h2>Order Summary</h2>
    <div class="table">
      <table>
        <tr>
          <th>QTY</th>
          <th>Product</th>
          <th colspan="2">Unit Cost</th>
          <th v-if="chargeVat" colspan="2">VAT</th>
          <th colspan="2">Total</th>
        </tr>
        <tr v-for="el in cart" :key="el.id">
          <td class="right">{{ el.qty }}</td>
          <td>{{ $store.state.products.products[el.id].name }}</td>
          <td class="right">{{ $store.state.products.products[el.id].prices[currency] / 100 }}</td>
          <td>{{ currency }}{{ $store.state.products.products[el.id].unit ? '/' : '' }}{{ $store.state.products.products[el.id].unit }}</td>
          <td v-if="chargeVat" class="right">{{ $store.state.products.products[el.id].vat * 100 }}</td>
          <td v-if="chargeVat">%</td>
          <td
            class="right"
          >{{ Math.round(el.qty * $store.state.products.products[el.id].prices[currency]) / 100 }}</td>
          <td>{{ currency }}</td>
        </tr>
        <tr>
          <th :colspan="chargeVat ? 6 : 4" clss="right">Subtotal</th>
          <td class="right">{{ subtotal / 100 }}</td>
          <td>{{ currency }}</td>
        </tr>
        <tr
          v-if="(selectedCountryMeta.euMemberState && !$store.state.shop.customerDetails.vatValid) || $store.state.shop.customerDetails.countryCode === 'SE'"
        >
          <th :colspan="chargeVat ? 6 : 4" clss="right">VAT</th>
          <td class="right">{{ vat / 100 }}</td>
          <td>{{ currency }}</td>
        </tr>
        <tr>
          <th :colspan="chargeVat ? 6 : 4" clss="right">Total Due</th>
          <td class="right">{{ total / 100 }}</td>
          <td>{{ currency }}</td>
        </tr>
      </table>
    </div>
    <form @submit.prevent="applyCoupon(code)">
      <label class="half">
        Coupon
        <input type="text" v-model="code" placeholder="Coupon" />
      </label>
      <button rtpe="submit" :disabled="couponLoading">Apply</button>
      <span v-if="couponLoading">
        <font-awesome-icon icon="spinner" spin />Checking Coupon
      </span>
    </form>
  </div>
</template>

<script lang="ts">
/* global Stripe */
import { Component, Prop, Vue } from 'vue-property-decorator'
import PostCountries from '@/postcountries.json' // from https://portal.postnord.com/api/pricing/countries?language=en&fromCountry=SE
import firebase from 'firebase/app'

import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/functions'

@Component
export default class CostSummary extends Vue {
  mode: string = 'live';
  code: string = '';
  validCode: string = '';
  couponLoading: boolean = false;
  stripe: any;

  get skus (): StripeItem[] {
    const items: StripeItem[] = []
    console.log(this.mode)

    for (const id in this.$store.state.shop.cart) {
      if (this.$store.state.shop.cart[id]) {
        const item: StripeItem = {
          sku: this.$store.state.products.products[id][
            this.mode === 'live' ? 'skus' : 'test-skus'
          ][this.currency + (this.chargeVat ? '-VAT' : '')],
          quantity: this.$store.state.shop.cart[id]
        }
        items.push(item)
      }
    }

    console.log(items)

    return items
  }

  get chargeVat (): boolean {
    return (
      (this.selectedCountryMeta.euMemberState &&
        !this.$store.state.shop.customerDetails.vatValid) ||
      this.$store.state.shop.customerDetails.countryCode === 'SE'
    )
  }

  checkout () {
    firebase
      .firestore()
      .collection('orders')
      .add({
        requestedItems: this.skus,
        customerDetails: this.$store.state.shop.customerDetails,
        currency: this.$store.state.shop.currency,
        coupon: this.validCode || ''
      })
      .then(dRef => {
        this.stripe
          .redirectToCheckout({
            items: this.skus,
            successUrl: `https://${window.location.host}/shop?state=success${
              this.mode === 'live' ? '' : '&mode=test'
            }`,
            cancelUrl: `https://${window.location.host}/shop?state=cancel${
              this.mode === 'live' ? '' : '&mode=test'
            }`,
            clientReferenceId: dRef.id,
            customerEmail: this.$store.state.shop.customerDetails.email
          })
          .then(() => {
            // Display result.error.message to your customer
          })
      })
      .catch(err => {
        if (err) throw new Error(err)
      })
  }

  applyCoupon (code: string): void {
    this.couponLoading = true
    firebase
      .functions()
      .httpsCallable('verifyCoupon')({
        code
      })
      .then(result => {
        console.log(result.data)
        if (
          result.data.valid &&
          this.$store.state.shop.cart.GLOrGF0gLvAxFFxREuJE > 0
        ) {
          this.$store.dispatch('shop/updateCart', {
            change: -1,
            product: 'GLOrGF0gLvAxFFxREuJE'
          })
          this.validCode = code
        }
        this.couponLoading = false
      })
  }

  get cart () {
    return Object.keys(this.$store.state.shop.cart)
      .map((id: string): { id: string; qty: number } => ({
        id,
        qty: this.$store.state.shop.cart[id]
      }))
      .filter(el => el.qty)
  }

  get notCompleted (): boolean {
    if (this.subtotal <= 0) return true
    return false
  }

  get selectedCountryMeta (): { [prop: string]: any } {
    const idx = PostCountries.findIndex(
      (country: PostCountry): boolean =>
        country.countryCode ===
        this.$store.state.shop.customerDetails.countryCode
    )
    if (idx < 0) return { euMemberState: false }
    return PostCountries[idx].meta || { euMemberState: false }
  }

  get currency (): string {
    return this.$store.state.shop.currency
  }

  get subtotal (): number {
    let total: number = 0

    for (const id in this.$store.state.shop.cart) {
      total += Math.round(
        this.$store.state.shop.cart[id] *
          this.$store.state.products.products[id].prices[this.currency]
      )
    }

    if (total > 0) {
      this.$emit('invalid', false)
    } else {
      this.$emit('invalid', true)
    }

    return total - this.vat
  }

  get vat (): number {
    let total: number = 0

    if (
      !this.selectedCountryMeta.euMemberState ||
      (this.$store.state.shop.customerDetails.vatValid &&
        this.selectedCountryMeta.euMemberState &&
        this.$store.state.shop.customerDetails.countryCode !== 'SE')
    ) {
      return 0
    }

    for (const id in this.$store.state.shop.cart) {
      total += Math.round(
        this.$store.state.shop.cart[id] *
          this.$store.state.products.products[id].prices[this.currency] *
          (1 - 1 / (1 + this.$store.state.products.products[id].vat))
      )
    }

    return total
  }

  get total (): number {
    return this.subtotal + this.vat
  }

  mounted (): void {
    if (this.$route.query.mode) this.mode = 'test'
    console.log(this.mode)
    this.stripe = (window as { [prop: string]: any }).Stripe(
      this.mode === 'live'
        ? 'pk_live_8zkACkC315QvxhfSQcJxrXSu'
        : 'pk_test_qyutj0rUmaC9H53ZfF2RKbg9'
    )
  }
}
</script>

<style scoped>
.cost {
  max-width: var(--content-max-width);
  margin: auto;
}

.table {
  overflow-x: auto;
  margin-bottom: 0.5em;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

table td,
table th {
  text-align: left;
  border-bottom: 1px solid var(--l-grey);
}

td.right {
  text-align: right;
}

tr:first-child th {
  text-align: center;
}
</style>
