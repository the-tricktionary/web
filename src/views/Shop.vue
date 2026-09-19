<template>
  <div class="container mx-auto px-2 pt-4 pb-20">
    <h1>{{ t('shop.title') }}</h1>

    <p>{{ t('shop.intro') }}</p>

    <i18n-t keypath="shop.orders" tag="p">
      <template #company>
        <a href="https://swantzter.se/?utm_source=the-tricktionary&utm_medium=referral">Swantzter</a>
      </template>
      <template #policies>
        <router-link to="/policies">
          {{ t('shop.policies') }}
        </router-link>
      </template>
    </i18n-t>

    <i18n-t keypath="shop.contact" tag="p">
      <template #email>
        <a href="mailto:shop@the-tricktionary.com">shop@the-tricktionary.com</a>
      </template>
    </i18n-t>

    <div class="w-full border-b border-line flex justify-center overflow-x-auto" role="group" :aria-label="t('shop.currency')">
      <button
        v-for="c in currencies"
        :key="c"
        type="button"
        :aria-pressed="currency === c"
        :class="{
          'border-ttred-900': currency === c,
          'border-b-2': currency === c,
          'mb-0': currency === c,
          'mb-2px': currency !== c
        }"
        class="hover:bg-elevated hover:border-ttred-900 hover:border-b-2 hover:mb-0 py-2 px-8 whitespace-nowrap"
        @click="currency = c"
      >
        {{ c.toLocaleUpperCase(lang) }}
      </button>
    </div>

    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4">
      <product-box
        v-for="product in products"
        :key="product.id"
        :product="product"
        :currency="currency"
        :selected="selection[product.id]"
        @update:selected="selection[product.id] = $event"
      />
    </div>

    <bottom-bar>
      <div class="flex items-center flex-row flex-nowrap">
        <icon-button class="w-max" :disabled="!numSelected || loading" @click="initiateCheckout()">
          <template #icon>
            <icon-cart v-if="!loading" />
            <icon-loading v-else class="animate-spin" />
          </template>
          {{ t('shop.checkout') }}
        </icon-button>

        <span class="ml-4">
          {{ t('shop.subtotal', { subtotal: formattedSubtotal, shipping: formatPrice(shippingRates, currency, lang) }) }}
        </span>
      </div>
    </bottom-bar>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Currency, useCreateCheckoutSessionMutation, useProductsQuery } from '../graphql/generated/graphql'
import { getAnalytics, logEvent } from '@firebase/analytics'

import { formatPrice } from '../helpers'
import useLanguage from '../hooks/useLanguage'

import ProductBox from '../components/ProductBox.vue'
import BottomBar from '../components/BottomBar.vue'
import IconButton from '../components/IconButton.vue'
import IconCart from '~icons/mdi/cart-outline'
import IconLoading from '~icons/mdi/loading'

const { t } = useI18n()
const { lang } = useLanguage()

const productsQuery = useProductsQuery()

const products = computed(() => productsQuery.result.value?.products ?? [])
const shippingRates = computed(() => productsQuery.result.value?.shippingRates ?? [])
const currencies = computed(() =>
  [...new Set(products.value.flatMap(p => p.prices.map(price => price.currency)))]
    .sort((a, b) => a.localeCompare(b, lang.value))
)

const analytics = getAnalytics()

const currency = ref<Currency>(Currency.Eur)
const selection = reactive<Record<string, number>>({})
const numSelected = computed(() => Object.values(selection).reduce((acc, quantity) => acc + quantity, 0))
const subtotal = computed(() => Object.entries(selection)
  .reduce((acc, [productId, quantity]) => {
    const product = products.value.find(p => p.id === productId)
    if (!product) return acc
    const price = product.prices.find(p => p.currency === currency.value)
    if (!price) return acc
    return acc + ((price.unitAmount ?? 0) * quantity)
  }, 0)
)
const formattedSubtotal = computed(() => {
  return new Intl.NumberFormat(lang.value, {
    style: 'currency',
    currency: currency.value
  }).format(subtotal.value / 100)
})

const { mutate, loading } = useCreateCheckoutSessionMutation(() => ({
  variables: {
    products: Object.entries(selection)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity })),
    currency: currency.value
  }
}))

async function initiateCheckout () {
  logEvent(analytics, 'begin_checkout', {
    currency: currency.value,
    value: subtotal.value / 100,
    items: Object.entries(selection).filter(([, quantity]) => quantity > 0).map(([productId, quantity]) => {
      const product = products.value.find(p => p.id === productId)
      const price = product?.prices.find(p => p.currency === currency.value)
      return {
        item_id: productId,
        item_name: product?.name,
        price: (price?.unitAmount ?? 0) / 100,
        quantity
      }
    })
  })
  const result = await mutate()
  if (!result?.data) throw Error('Failed to create stripe checkout session')
  window.location.href = result.data.createCheckoutSession.url
}
</script>
