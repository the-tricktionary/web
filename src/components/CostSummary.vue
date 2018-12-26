<template>
  <div class="cost">
    <h2>Order Summary</h2>
    <div class="table">
      <table>
        <tr>
          <th>QTY</th>
          <th>product</th>
          <th colspan="2">Unit Cost</th>
          <th v-if="chargeVat" colspan="2">VAT</th>
          <th colspan="2">Total</th>
        </tr>
        <tr v-for="(qty, id) in $store.state.shop.cart" :key="id">
          <td class="right">{{ qty }}</td>
          <td>{{ $store.state.products.docs[id].name }}</td>
          <td class="right">{{ $store.state.products.docs[id].prices[currency] / 100 }}</td>
          <td>{{ currency }}{{ $store.state.products.docs[id].unit ? '/' : '' }}{{ $store.state.products.docs[id].unit }}</td>
          <td v-if="chargeVat" class="right">{{ $store.state.products.docs[id].vat * 100 }}</td>
          <td v-if="chargeVat">%</td>
          <td
            class="right"
          >{{ Math.round(qty * $store.state.products.docs[id].prices[currency] * (chargeVat ? (1 + $store.state.products.docs[id].vat) : 1)) / 100 }}</td>
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
          <th :colspan="chargeVat ? 6 : 4" clss="right">Shipping</th>
          <td class="right">{{ shipping / 100 }}</td>
          <td>{{ currency }}</td>
        </tr>
        <tr>
          <th :colspan="chargeVat ? 6 : 4" clss="right">Total Due</th>
          <td class="right">{{ total / 100 }}</td>
          <td>{{ currency }}</td>
        </tr>
      </table>
    </div>
    <!-- <vue-stripe-checkout
      ref="checkoutRef"
      :currency="$store.state.shop.currency"
      image="https://the-tricktionary.com/static/img/icon-ios.png"
      name="the Tricktionary"
      :amount="total"
      :allow-remember-me="true"
      :email="$store.state.shop.customerDetails.email"
      @done="done"
    />-->
  </div>
</template>

<script lang="ts">
/* global Stripe */
import { Component, Prop, Vue } from 'vue-property-decorator';
import PostCountries from '@/postcountries.json'; // from https://portal.postnord.com/api/pricing/countries?language=en&fromCountry=SE
import firebase from 'firebase/app';

import 'firebase/firestore';
import 'firebase/auth';

@Component
export default class CostSummary extends Vue {
  mode: string = 'test';
  stripe = (window as { [prop: string]: any }).Stripe(
    this.mode === 'live'
      ? 'pk_live_8zkACkC315QvxhfSQcJxrXSu'
      : 'pk_test_qyutj0rUmaC9H53ZfF2RKbg9',
    {
      betas: ['checkout_beta_4']
    }
  );

  get skus (): StripeItem[] {
    let items: StripeItem[] = []
    let shipping: { [prop: string]: string } = {
      EUR: 'sku_EEBhmoFgqPm62a',
      SEK: 'sku_EEBgzj0EdsRTtM',
      USD: 'sku_EEBhPNTTKfrnl3'
    }

    if (this.mode === 'live') {
      shipping = {
        EUR: 'sku_EECxzsgSvUQ5nD',
        SEK: 'sku_EECxOSV3Lq9Gof',
        USD: 'sku_EECxZgBvp9rix6'
      }
    }

    for (let id in this.$store.state.shop.cart) {
      if (this.$store.state.shop.cart[id]) {
        let item: StripeItem = {
          sku: this.$store.state.products.docs[id][
            this.mode === 'live' ? 'skus' : 'test-skus'
          ][this.currency + (this.chargeVat ? '-VAT' : '')],
          quantity: this.$store.state.shop.cart[id]
        }
        items.push(item)
      }
    }

    let item: StripeItem = { sku: shipping[this.currency], quantity: 1 }
    items.push(item)

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
      .doc()
      .set({
        charges: {
          subtotal: this.subtotal,
          vat: this.vat,
          shipping: this.shipping
        },
        items: this.skus,
        customerDetails: this.$store.state.shop.customerDetails,
        currency: this.$store.state.shop.currency,
        cart: this.$store.state.shop.cart
      })
      .then(() => {
        this.stripe
          .redirectToCheckout({
            items: this.skus,
            successUrl: 'https://v3.the-tricktionary.com/shop?state=success',
            cancelUrl: 'https://v3.the-tricktionary.com/shop'
          })
          .then(function () {
            // Display result.error.message to your customer
          })
      })
  }

  get notCompleted (): boolean {
    if (this.subtotal <= 0) return true
    return false
  }

  get selectedCountryMeta (): { [prop: string]: any } {
    let idx = PostCountries.findIndex(
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
          this.$store.state.products.docs[id].prices[this.currency]
      )
    }

    if (total > 0) {
      this.$emit('invalid', false)
    } else {
      this.$emit('invalid', true)
    }

    return total
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
          this.$store.state.products.docs[id].prices[this.currency] *
          this.$store.state.products.docs[id].vat
      )
    }

    return total
  }

  get shipping (): number {
    if (this.currency === 'SEK') return 10000
    return 1000
  }

  get total (): number {
    return this.subtotal + this.vat + this.shipping
  }
}
</script>

<style scoped>
.cost {
  max-width: 600px;
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
