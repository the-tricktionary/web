<template>
  <button
    class="btn grid rounded cursor-pointer grid-cols-[2rem,auto] bg-white hover:bg-gray-200 border border-gray-300"
  >
    <div class="flex h-full items-center justify-center">
      <slot name="icon" />
    </div>
    <div class="flex px-2 items-center">
      <slot />
    </div>
  </button>
</template>
