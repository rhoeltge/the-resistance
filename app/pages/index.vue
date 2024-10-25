<script setup lang="ts">
import { useStorage as useLocalStorage } from '@vueuse/core'
import * as qrcode from 'qrcode'

const joinQr = ref<string>('')
const loading = ref<boolean>(true)
const current = ref<'Main' | 'Create' | 'Join' | 'Game'>('Main')
const role = ref<'Scoreboard' | 'Player' | null>(null)
const gameId = ref<number | null>(null)

const currentUserId = useCurrentUserId()
const route = useRoute()
const client = useSupabaseClient()
const gameData = useLocalStorage<{
  userId: number | null
  gameId: number | null
  role: 'Scoreboard' | 'Player' | null
}>('game_data', {
  userId: null,
  gameId: null,
  role: null,
})

onMounted(() => {
  if (route?.query?.joinGame) {
    gameData.value = {
      userId: null,
      gameId: null,
      role: null,
    }

    current.value = 'Join'

    setTimeout(() => {
      history.pushState({}, null, window.location.href.split('?')[0]!)
    }, 500)
  }

  if (gameData.value) {
    gameId.value = gameData.value.gameId
    currentUserId.value = gameData.value.userId
    role.value = gameData.value.role

    if (gameId.value) {
      setTimeout(() => {
        setupGame()
      }, 100)
    }
    else {
      loading.value = false
    }
  }
})

function createGame(gId: number) {
  gameId.value = gId
  role.value = 'Scoreboard'

  gameData.value = {
    gameId: gId,
    userId: null,
    role: 'Scoreboard',
  }

  setupGame()
}

function joinGame(gId: number, uId: number) {
  gameId.value = gId
  currentUserId.value = uId
  role.value = 'Player'

  gameData.value = {
    gameId: gId,
    userId: uId,
    role: 'Player',
  }

  setupGame()
}

const gameStore = useGameStore()
const { current: game } = storeToRefs(gameStore)

const playersStore = usePlayersStore()
const { all: players, current: currentPlayer } = storeToRefs(playersStore)

async function setupGame() {
  if (gameId.value) {
    await gameStore.subscribe(gameId.value)
    await playersStore.subscribe(gameId.value)
  }

  current.value = 'Game'
  loading.value = false

  if (gameId.value) {
    await qrcode.toDataURL(`${window.location.href}?joinGame=${encodeURIComponent(game!.value?.name)}`, { margin: 3 }, (_, url) => {
      joinQr.value = url
    })
  }
}

onUnmounted(() => {
  gameStore.unsubscribe()
  playersStore.unsubscribe()
})

function resetGame() {
  // eslint-disable-next-line no-alert
  if (window.confirm('Möchtest du das Spiel wirklich verlassen?')) {
    gameData.value = {
      userId: null,
      gameId: null,
      role: null,
    }

    window.location.reload()
  }
}

async function startGame() {
  const generateRandom = (min: number, max: number, exclude: number[]) => {
    let random: number | false = false

    while (random === false) {
      const x = Math.floor(Math.random() * (max - min + 1)) + min

      if (!exclude.includes(x))
        random = x
    }

    return random
  }

  const spiesCount = (players.value.length === 10) ? 4 : (players.value.length >= 7 ? 3 : 2)
  const spiesIndexes: number[] = []
  const spies: number[] = []

  for (let i = 0; i < spiesCount; i++) {
    spiesIndexes.push(generateRandom(0, players.value.length - 1, spiesIndexes))
  }

  spiesIndexes.forEach((spyIndex) => {
    spies.push(players.value[spyIndex]?.id)
  })

  const leaderIndex = Math.floor(Math.random() * players.value.length)

  await client
    .from('players')
    .update({ role: 'Spion' })
    .in('id', spies)

  await client
    .from('games')
    .update({ leader: players.value[leaderIndex]?.id, started: true })
    .eq('id', gameId.value)
}
</script>

<template>
  <div class="bg-black text-yellow-50 min-h-dvh flex flex-col justify-center items-center">
    <div v-if="current !== 'Game'" class="flex flex-col items-center h-72">
      <h1 class="mb-6 cursor-pointer" @click="current = 'Main'">
        Widerstand
      </h1>

      <div v-if="loading">
        <div role="status" class="mt-4">
          <svg aria-hidden="true" class="w-8 h-8 text-amber-50 animate-spin fill-amber-50" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="opacity-20" d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
        </div>
      </div>
      <div v-else>
        <PageMain v-if="current === 'Main'" @create="current = 'Create'" @join="current = 'Join'" />

        <PageCreate v-else-if="current === 'Create'" @create="(gameId: number) => createGame(gameId)" />

        <PageJoin v-else-if="current === 'Join'" @join="(gameId: number, userId: number) => joinGame(gameId, userId)" />
      </div>
    </div>
    <div v-else>
      <div v-if="!game?.started">
        <div class="h1 text-3xl fixed top-3.5 right-4 cursor-pointer" @click="resetGame()">
          Widerstand
        </div>
        <div v-if="role === 'Scoreboard'" class="fixed top-0 left-6 flex flex-col bg-red-500">
          <div class="text-center pt-5 pb-1">
            Beitreten
          </div>
          <img class="adapt-hue w-28" :src="joinQr" alt="Join Qr-Code">
        </div>
        <div class="mb-10 text-center flex flex-col items-center">
          <h2 class="h1 mb-2">
            „{{ game?.name }}“
          </h2>
          <ul class="flex gap-x-1 mb-8">
            <div v-for="index in 10" :key="index" class="w-1.5 h-1.5 rounded-full" :class="[index > 5 ? 'ring-inset ring-1 ring-amber-50' : 'bg-amber-50', { '!bg-red-500 !ring-0': players.length >= index }]" />
          </ul>
          <ul class="mb-6 flex flex-col gap-y-1.5">
            <li v-for="player in players" :key="player.id" :class="{ 'text-red-500': player.id === currentPlayer?.id }">
              {{ player.name }}
            </li>
          </ul>

          <button v-if="role === 'Scoreboard'" :class="{ 'opacity-50 pointer-events-none': players.length < 5 }" @click="startGame">
            – Starten –
          </button>
        </div>
      </div>
      <div v-else>
        <Scoreboard v-if="role === 'Scoreboard'" />
        <Game v-else />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.adapt-hue {
  filter: invert(100%) sepia(100%);
  mix-blend-mode: screen;
}
</style>
