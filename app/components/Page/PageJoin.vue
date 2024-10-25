<script setup lang="ts">
const emit = defineEmits<{
  join: [gameId: number, userId: number]
}>()

const loading = ref<boolean>(false)
const userInput = ref('')
const nameInput = ref('')

const route = useRoute()
const client = useSupabaseClient()

async function joinGame() {
  loading.value = true

  if (!nameInput.value || !userInput.value) {
    loading.value = false
    window.alert('Es wurde kein Name und/oder Raumname eingegeben.')

    return
  }

  const game = await client.from('games').select().eq('name', nameInput.value) as { data: any[] }

  if (game?.data?.length === 0) {
    loading.value = false
    window.alert('Es existiert kein Spiel mit diesem Raumnamen.')

    return
  }

  if (game?.data[0].started) {
    loading.value = false
    window.alert('Das Spiel hat bereits begonnen.')

    return
  }

  const user = await client
    .from('players')
    .insert({ name: userInput.value, game: game?.data[0].id }).select()

  if (user?.data[0].id != null) {
    loading.value = false

    emit('join', user.data[0].game, user.data[0].id)
  }
}

onMounted(() => {
  if (route?.query?.joinGame) {
    nameInput.value = `${route.query.joinGame}`
  }
})
</script>

<template>
  <div class="flex flex-col text-center">
    <h2 class="h3 -mt-5 mb-8">
      Spiel beitreten
    </h2>

    <label class="flex flex-col items-start mb-6">
      <span class="font-bold text-xs uppercase tracking-[0.25em] text-amber-50">Dein Name</span>
      <input v-model="userInput" type="text">
    </label>
    <label class="flex flex-col items-start mb-6">
      <span class="font-bold text-xs uppercase tracking-[0.25em] text-amber-50">Spielname</span>
      <input v-model="nameInput" type="text">
    </label>

    <div v-if="loading">
      <div role="status" class="flex justify-center">
        <svg aria-hidden="true" class="w-8 h-8 text-amber-50 animate-spin fill-amber-50" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="opacity-20" d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
        </svg>
      </div>
    </div>
    <button v-else :class="{ 'opacity-50 pointer-events-none': !userInput || !nameInput }" @click="joinGame">
      – Beitreten –
    </button>
  </div>
</template>
