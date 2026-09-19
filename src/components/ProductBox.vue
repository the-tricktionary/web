<template>
  <div class="border-line flex h-full flex-col">
    <div class="aspect-square flex bg-placeholder rounded-t">
      <img v-if="product.image" :src="product.image" loading="lazy" alt="" class="w-full h-full rounded-t">
      <icon-shopping v-else class="text-muted" aria-hidden="true" />
    </div>

    <div class="border-r border-l border-line p-2 grow">
      <p class="mt-2 mb-6 text-4xl sm:text-2xl xl:text-4xl font-semibold">
        {{ t('shop.pricePerPiece', { price: formatPrice(product.prices, currency, lang) }) }}
      </p>
      <p class="font-semibold">
        {{ product.name }}
      </p>
      <p>{{ product.description }}</p>
    </div>

    <div class="grid grid-cols-[2rem_auto_2rem] h-8">
      <button
        type="button"
        class="border border-line rounded-bl h-full w-full flex items-center justify-center cursor-pointer hover:bg-elevated disabled:bg-elevated disabled:text-muted disabled:cursor-default"
        :disabled="selected <= 0"
        :aria-label="t('shop.removeOne', { product: product.name })"
        @click="$emit('update:selected', selected - 1)"
      >
        <icon-minus aria-hidden="true" />
      </button>
      <div class="border-t border-b border-line h-full w-full flex items-center justify-center" aria-live="polite">
        <span class="sr-only">{{ t('shop.quantity') }}</span> {{ selected }}
      </div>
      <button
        type="button"
        class="border border-line rounded-br h-full w-full flex items-center justify-center cursor-pointer hover:bg-elevated disabled:bg-elevated disabled:text-muted disabled:cursor-default"
        :aria-label="t('shop.addOne', { product: product.name })"
        @click="$emit('update:selected', selected + 1)"
      >
        <icon-plus aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { formatPrice } from '../helpers'
import useLanguage from '../hooks/useLanguage'

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
  selected: {
    type: Number,
    default: 0
  }
})

defineEmits<{
  'update:selected': [selected: number]
}>()

const { t } = useI18n()
const { lang } = useLanguage()
</script>
