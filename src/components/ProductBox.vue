<template>
  <div class="border-gray-300 flex h-full flex-col">
    <div class="aspect-square flex bg-gray-300 rounded-t">
      <img v-if="product.image" :src="product.image" loading="lazy" alt="" class="w-full h-full rounded-t">
      <icon-shopping v-else class="text-gray-500" aria-hidden="true" />
    </div>

    <div class="border-r border-l border-gray-300 p-2 grow">
      <p class="mt-2 mb-6 text-4xl sm:text-2xl xl:text-4xl font-semibold">
        {{ formatPrice(product.prices, currency) }} / pcs
      </p>
      <p class="font-semibold">
        {{ product.name }}
      </p>
      <p>{{ product.description }}</p>
    </div>

    <div class="grid grid-cols-[2rem_auto_2rem] h-8">
      <button
        type="button"
        class="border border-gray-300 rounded-bl h-full w-full flex items-center justify-center cursor-pointer hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-default"
        :disabled="selected <= 0"
        :aria-label="`Remove one ${product.name} from cart`"
        @click="$emit('update:selected', selected - 1)"
      >
        <icon-minus aria-hidden="true" />
      </button>
      <div class="border-t border-b border-gray-300 h-full w-full flex items-center justify-center" aria-live="polite">
        <span class="sr-only">Quantity:</span> {{ selected }}
      </div>
      <button
        type="button"
        class="border border-gray-300 rounded-br h-full w-full flex items-center justify-center cursor-pointer hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-default"
        :aria-label="`Add one ${product.name} to cart`"
        @click="$emit('update:selected', selected + 1)"
      >
        <icon-plus aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '../helpers'

import IconShopping from '~icons/mdi/shopping-outline'
import IconMinus from '~icons/mdi/minus'
import IconPlus from '~icons/mdi/plus'

import type { PropType } from 'vue'
import type { Currency, ProductsQuery } from '../graphql/generated/graphql'

defineProps({
  product: {
    type: Object as PropType<ProductsQuery['products'][number]>,
    required: true
  },
  currency: {
    type: String as PropType<Currency>,
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

defineEmits<{
  'update:selected': [selected: number]
}>()
</script>
