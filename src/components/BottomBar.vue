<template>
  <Teleport to="#bottom-bars">
    <div class="w-full bg-white border-t border-gray-300 py-2 z-10000 overflow-x-auto">
      <div class="container mx-auto px-2 flex gap-4 justify-between">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
