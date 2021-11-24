<template>
  <main
    class="max-w-3xl flex flex-col justify-center"
    style="width: 28rem; min-height: 20rem"
  >
    <div
      class="w-full inline-block rounded-3xl shadow-xl h-full p-4 md:max-h-160 md:min-h-144 bg-white"
    >
      <slot></slot>
    </div>
  </main>
</template>

<style scoped>
@media (min-width: 768px) {
  main {
    min-width: fit-content;
  }
}
</style>
