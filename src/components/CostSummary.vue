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
          <th :colspan="chargeVat ? 6 : 4" clss="right">Total Due</th>
          <td class="right">{{ total / 100 }}</td>
          <td>{{ currency }}</td>
        </tr>
      </table>
    </div>
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
        currency: this.$store.state.shop.currency
      })
      .then(dRef => {
        this.stripe
          .redirectToCheckout({
            items: this.skus,
            successUrl: 'https://localhost:8080/shop?state=success',
            cancelUrl: 'https://localhost:8080/shop?state=cancel',
            clientReferenceId: dRef.id
          })
          .then(() => {
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

  get total (): number {
    return this.subtotal + this.vat
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
