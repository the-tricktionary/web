<template>
  <div class="container mx-auto px-2 pt-4 pb-20">
    <h1>Shop</h1>

    <p>
      To keep the Tricktionary running we have decided to sell a few products,
      the point isn't to make huge money, it's rather to help as many athletes
      as possible get as good as possible at jump rope/rope skipping, and we
      aren't making a huge profit on any of these products. The Tricktionary
      will stay free but your support would help a lot.
    </p>

    <p>
      Orders are processed by the Swedish company <a href="https://swantzter.se/?utm_source=the-tricktionary&utm_medium=referral">Swantzter</a>,
      owned and operated by one of the Tricktionary's developers. Your bank
      statement will say your payment was made to Swantzter. You can find
      more about the terms for your purchase in our <router-link to="/policies">Policies</router-link>.
    </p>

    <p>
      If you have questions, if you want to place a large order, or if you're
      interested in a partnership, email <a href="mailto:shop@the-tricktionary.com">shop@the-tricktionary.com</a>.
    </p>

    <div class="w-full border-b border-gray-300 flex justify-center overflow-x-auto">
      <button
        v-for="c in currencies"
        :key="c"
        :class="{
          'border-ttred-900': currency === c,
          'border-b-2': currency === c,
          'mb-0': currency === c,
          'mb-2px': currency !== c
        }"
        class="hover:bg-gray-200 hover:border-ttred-900 hover:border-b-2 hover:mb-0 py-2 px-8 whitespace-nowrap"
        @click="currency = c"
      >{{ c.toLocaleUpperCase() }}</button>
    </div>

    <div v-if="currency !== 'aud'" class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4">
      <product-box
        v-for="product in products"
        :product="product"
        :currency="currency"
        :selected="selection[product.id]"
        @update:selected="selection[product.id] = $event"
      />
    </div>

    <div v-else class="pt-4">
      <p>
        If you are in australia, you can order the Tricktionary - Australian
        Edition from <a href="https://www.skippingaustralia.org.au/?utm_source=the-tricktionary&utm_medium=referral&utm_campaign=booklet_sale" rel="noopener">Skipping Australia</a>
        directly by emailing <a rel="noopener" href="mailto:admin@skippingaustralia.org.au?subject=Ordering%20the%20Trikctionary%20-%20Australian%20Edition">admin@skippingaustralia.org.au</a>,
        it will definitely save you on shipping costs!
      </p>
      <p>
        If you're looking for our other products, please select another
        currency above.
      </p>
    </div>

    <bottom-bar>
      <div class="flex items-center flex-row flex-nowrap">
        <icon-button class="w-max" :disabled="!numSelected || loading" @click="initiateCheckout()">
          <template #icon>
            <icon-cart v-if="!loading" />
            <icon-loading v-else class="animate-spin" />
          </template>
          Checkout
        </icon-button>

        <span class="ml-4">
          {{ formattedSubtotal }} + {{ formatPrice(shippingRates, currency) }} Shipping
        </span>
      </div>
    </bottom-bar>
  </div>
</template>


<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useResult } from '@vue/apollo-composable'
import { useCreateCheckoutSessionMutation, useProductsQuery } from '../graphql/generated/graphql'
import { getAnalytics, logEvent } from '@firebase/analytics'
import { useRouter } from 'vue-router'

import { formatPrice } from '../helpers'

import ProductBox from '../components/ProductBox.vue'
import BottomBar from '../components/BottomBar.vue'
import IconButton from '../components/IconButton.vue'
import IconCart from 'virtual:vite-icons/mdi/cart-outline'
import IconLoading from 'virtual:vite-icons/mdi/loading'

import type { Currency } from '../graphql/generated/graphql'

const productsQuery = useProductsQuery()

const products = useResult(productsQuery.result, [], data => data.products)
const shippingRates = useResult(productsQuery.result, [], data => data.shippingRates)
const currencies = useResult(productsQuery.result, [], data =>
  [
    ...new Set(data.products.flatMap(p => p.prices.map(price =>  price.currency))),
    'aud'
  ]
  .sort((a, b) => a.localeCompare(b))
)

const router = useRouter()
const analytics = getAnalytics()

const currency = ref<string>('eur' as Currency)
const selection = reactive<{ [productId: string]: number }>({})
const numSelected = computed(() => Object.entries(selection).reduce((acc, [_, quantity]) => acc + quantity, 0))
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
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currency.value
  }).format(subtotal.value / 100)
})

const { mutate, loading } = useCreateCheckoutSessionMutation(() => ({
  variables: {
    products: Object.entries(selection)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity })),
    currency: currency.value as Currency
  }
}))

async function initiateCheckout () {
  logEvent(analytics, 'begin_checkout', {
    currency: currency.value,
    value: subtotal.value / 100,
    items: Object.entries(numSelected).map(([productId, quantity]) => {
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
  if (!result.data) throw Error('Failed to create stripe checkout session')
  window.location.href = result.data.createCheckoutSession.url
}
</script>
