<template>
  <div class="border-gray-300 flex h-full flex-col">
    <div class="aspect-1/1 flex bg-gray-300 rounded-t">
      <img v-if="product.image" :src="product.image" loading="lazy" class="w-full h-full rounded-t">
      <icon-shopping v-else class="text-gray-500" />
    </div>

    <div class="border-r border-l p-2 flex-grow">
      <p class="mt-2 mb-6 text-4xl sm:text-2xl xl:text-4xl font-semibold">{{ formatPrice(product.prices, currency) }} / pcs</p>
      <p class="font-semibold">{{ product.name }}</p>
      <p>{{ product.description }}</p>
    </div>


    <div class="grid grid-cols-[2rem,auto,2rem] h-8">
      <button
        class="border rounded-bl h-full w-full flex items-center justify-center cursor-pointer hover:bg.gray-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-default"
        @click="$emit('update:selected', selected - 1)"
        :disabled="selected <= 0"
      ><icon-minus aria-label="Remove one from cart" /></button>
      <div class="border-t border-b h-full w-full flex items-center justify-center">{{ selected }}</div>
      <button
        class="border rounded-br h-full w-full flex items-center justify-center cursor-pointer hover:bg.gray-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-default"
        @click="$emit('update:selected', selected + 1)"
      ><icon-plus  aria-label="Add one to cart"/></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '../helpers'

import IconShopping from 'virtual:vite-icons/mdi/shopping-outline'
import IconMinus from 'virtual:vite-icons/mdi/minus'
import IconPlus from 'virtual:vite-icons/mdi/plus'

import type { PropType } from 'vue'
import type { Currency, ProductsQuery } from '../graphql/generated/graphql'

defineProps({
  product: {
    type: Object as PropType<ProductsQuery['products'][number]>,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  lang: {
    type: String,
    default: 'en'
  },
  selected: {
    type: Number,
    default: 0
  }
})
</script>
