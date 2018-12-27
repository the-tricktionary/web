<template>
  <div class="customer">
    <h2>Shipping and Billing Address</h2>
    <div class="inputgroup">
      <label>
        Full Name
        <input
          type="text"
          placeholder="Full Name"
          required
          @input="$store.dispatch('shop/customerDetails/update', {field: 'name', value: $event.target.value})"
          :value="$store.state.shop.customerDetails.name"
        >
      </label>
      <label>
        Email
        <input
          type="text"
          placeholder="Email"
          required
          @input="$store.dispatch('shop/customerDetails/update', {field: 'email', value: $event.target.value})"
          :value="$store.state.shop.customerDetails.email"
        >
      </label>
      <label>
        Phone (Optional, for package tracking)
        <input
          type="text"
          placeholder="Phone"
          @input="$store.dispatch('shop/customerDetails/update', {field: 'phone', value: $event.target.value})"
          :value="$store.state.shop.customerDetails.phone"
        >
      </label>
      <label>
        Address Line 1
        <input
          type="text"
          placeholder="Address Line 1"
          required
          @input="$store.dispatch('shop/customerDetails/update', {field: 'address1', value: $event.target.value})"
          :value="$store.state.shop.customerDetails.address1"
        >
      </label>
      <label>
        Address Line 2 (Optional)
        <input
          type="text"
          placeholder="Address Line 2"
          @input="$store.dispatch('shop/customerDetails/update', {field: 'address2', value: $event.target.value})"
          :value="$store.state.shop.customerDetails.address2"
        >
      </label>
      <label class="half">
        Country
        <select
          placeholder="Country"
          required
          @input="$store.dispatch('shop/customerDetails/update', {field: 'countryCode', value: $event.target.value})"
          :value="$store.state.shop.customerDetails.countryCode"
        >
          <optgroup :label="title" v-for="(countries, title) in CountriesMeta" :key="title">
            <option
              v-for="country in countries"
              :key="country.countryCode"
              :value="country.countryCode"
            >{{ country.name }}</option>
          </optgroup>
        </select>
      </label>
      <label class="half">
        Postal Code
        <input
          type="text"
          placeholder="Postal Code"
          required
          @input="$store.dispatch('shop/customerDetails/update', {field: 'postalCode', value: $event.target.value})"
          :value="$store.state.shop.customerDetails.postalCode"
        >
      </label>
      <label class="half">
        State/Region (if applicable)
        <input
          type="text"
          placeholder="State/Region"
          @input="$store.dispatch('shop/customerDetails/update', {field: 'state', value: $event.target.value})"
          :value="$store.state.shop.customerDetails.state"
        >
      </label>
      <label class="half">
        City
        <input
          type="text"
          placeholder="City"
          required
          @input="$store.dispatch('shop/customerDetails/update', {field: 'city', value: $event.target.value})"
          :value="$store.state.shop.customerDetails.city"
        >
      </label>

      <div v-if="selectedCountryMeta.euMemberState">
        <label>
          <span v-if="$store.state.shop.customerDetails.countryCode === 'SE'">Org.Nr</span>
          <span v-else>Company</span> (optional)
          <input
            type="text"
            :placeholder="$store.state.shop.customerDetails.countryCode === 'SE' ? 'Organisationsnummer' : 'Company'"
            @input="$store.dispatch('shop/customerDetails/update', {field: 'company', value: $event.target.value})"
            :value="$store.state.shop.customerDetails.company"
          >
        </label>
        <label>
          VAT number (optional)
          <input
            type="text"
            placeholder="VAT Number"
            @input="$store.dispatch('shop/customerDetails/update', {field: 'vatnumber', value: $event.target.value})"
            :value="$store.state.shop.customerDetails.vatnumber"
          >
        </label>
        <p v-if="$store.state.shop.customerDetails.countrycode !== 'SE'">
          If you are a registered EU bussiness with a VAT number, please enter your VAT number above.
          If we can verify your VAT registration we will charge you excluding VAT. (Unless you are a Swedish company)
        </p>
      </div>
    </div>
    <p>
      If you have different Billing and Shipping addresses, enter your billing address, then email
      reply to the receipt email with your shipping address. (
      <a href="mailto:shop@the-tricktionary.com">shop@the-tricktionary.com</a>)
    </p>
    <p>
      Orders are processed by the Swedish company Swantzter, owned and operated by one of the Tricktionary's developers.
      All profits are used for the Tricktionary only.
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import PostCountries from '@/postcountries.json'; // from https://portal.postnord.com/api/pricing/countries?language=en&fromCountry=SE

@Component
export default class CustomerInfo extends Vue {
  CountriesMeta = {
    'EU Member States': PostCountries.filter(
      (country: PostCountry): boolean => (country.meta || {}).euMemberState
    ),
    'Other Countries': PostCountries.filter(
      (country: PostCountry): boolean => !(country.meta || {}).euMemberState
    )
  };

  get selectedCountryMeta () {
    let idx = PostCountries.findIndex(
      (country: PostCountry): boolean =>
        country.countryCode ===
        this.$store.state.shop.customerDetails.countryCode
    )
    if (idx < 0) return {}
    return PostCountries[idx].meta || {}
  }
}
</script>

<style scoped>
.customer {
  max-width: 600px;
  margin: auto;
  padding: 0.5em;
}
</style>
