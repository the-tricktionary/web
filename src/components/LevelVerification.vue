<template>
  <span class="inline-flex ml-1">
    <button
      ref="anchor"
      type="button"
      class="level-verification-anchor inline-flex items-center rounded cursor-help"
      :style="`anchor-name: --lv-${id}`"
      :aria-label="label"
      :aria-describedby="id"
      @click="show()"
      @mouseenter="show()"
      @mouseleave="hide()"
      @focus="show()"
      @blur="hide()"
      @keydown.escape="hide()"
    >
      <icon-check-all v-if="level === VerificationLevel.Official" aria-hidden="true" />
      <icon-check v-else aria-hidden="true" />
    </button>
    <div
      :id="id"
      ref="popover"
      popover="auto"
      role="tooltip"
      class="level-verification-popover m-0 max-w-64 rounded bg-gray-900 px-2 py-1 text-sm text-white shadow-md"
      :style="`position-anchor: --lv-${id}`"
    >
      {{ description }}
    </div>
  </span>
</template>

<script setup lang="ts">
import { computed, useId, useTemplateRef } from 'vue'
import { VerificationLevel } from '../graphql/generated/graphql'

import IconCheck from '~icons/mdi/check'
import IconCheckAll from '~icons/mdi/check-all'

import type { PropType } from 'vue'

const props = defineProps({
  level: {
    type: String as PropType<VerificationLevel>,
    required: true
  }
})

const id = useId()
const anchor = useTemplateRef<HTMLButtonElement>('anchor')
const popover = useTemplateRef<HTMLDivElement>('popover')

const label = computed(() => props.level === VerificationLevel.Official
  ? 'Officially verified level'
  : 'Level verified by a judge'
)
const description = computed(() => props.level === VerificationLevel.Official
  ? 'This level has been officially verified by IJRU.'
  : 'This level has been verified by a certified judge, but not yet officially by IJRU.'
)

const supportsPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype
const supportsAnchor = typeof CSS !== 'undefined' && CSS.supports('anchor-name: --a')

function isOpen () {
  return popover.value?.matches(':popover-open') ?? false
}

function show () {
  const el = popover.value
  if (!el || !supportsPopover || isOpen()) return
  el.showPopover()
  if (!supportsAnchor) positionManually(el)
}

function hide () {
  const el = popover.value
  if (!el || !supportsPopover || !isOpen()) return
  el.hidePopover()
}

// Fallback for browsers without CSS anchor positioning: place the tooltip
// centred above the icon, or below it if there's no room above.
function positionManually (el: HTMLElement) {
  const rect = anchor.value?.getBoundingClientRect()
  if (!rect) return
  const tip = el.getBoundingClientRect()
  const gap = 4
  const top = rect.top - tip.height - gap >= 0
    ? rect.top - tip.height - gap
    : rect.bottom + gap
  const left = Math.min(
    Math.max(gap, rect.left + rect.width / 2 - tip.width / 2),
    window.innerWidth - tip.width - gap
  )
  el.style.top = `${top}px`
  el.style.left = `${left}px`
}
</script>

<style scoped>
.level-verification-popover {
  inset: auto;
  position-area: block-start;
  position-try-fallbacks: flip-block;
  margin-block-end: 0.25rem;
}

/* Browsers without the Popover API would render the tooltip inline, hide it there */
@supports not selector(:popover-open) {
  .level-verification-popover {
    display: none;
  }
}
</style>
