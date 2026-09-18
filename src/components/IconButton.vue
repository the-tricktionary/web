<template>
  <button
    type="button"
    class="btn grid rounded cursor-pointer grid-cols-[2rem_auto] bg-surface hover:bg-elevated border border-line"
  >
    <div class="flex h-full items-center justify-center" aria-hidden="true">
      <slot name="icon" />
    </div>
    <div class="flex px-2 items-center">
      <slot />
    </div>
  </button>
</template>
