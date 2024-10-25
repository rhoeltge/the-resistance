<script setup lang="ts">
const emit = defineEmits<{
  create: []
  join: []
}>()
</script>

<template>
  <div class="flex flex-col text-center">
    <button @click="emit('create')">
      – Neues Spiel –
    </button>
    <button @click="emit('join')">
      – Spiel beitreten –
    </button>
  </div>
</template>
