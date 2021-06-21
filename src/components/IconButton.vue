<template>
  <button
    class="grid rounded cursor-pointer grid-cols-[2rem,auto] bg-gray-300 dark:bg-gray-700 dark:border dark:border-gray-300 hover:bg-ttyellow-300 hover:text-black"
  >
    <div class="flex h-full items-center justify-center">
      <slot name="icon"></slot>
    </div>
    <div class="flex px-2 items-center">
      <slot></slot>
    </div>
  </button>
</template>
