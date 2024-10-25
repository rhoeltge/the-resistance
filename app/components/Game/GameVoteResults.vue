<script setup lang="ts">
import type { Game, Player } from '~/types/supabase'

const loading = ref<boolean>(false)
const { current: game } = storeToRefs(useGameStore())
const { all: players, current: currentPlayer } = storeToRefs(usePlayersStore())

const client = useSupabaseClient()

const leader = players.value.find(p => p.id === game.value.leader)

function replaceLastComma(str: string) {
  const lastCommaIndex = str.lastIndexOf(', ')

  if (lastCommaIndex === -1) {
    return str
  }

  return `${str.substring(0, lastCommaIndex)} und ${str.substring(lastCommaIndex + 2)}`
}

const teamNames = players.value.filter(player => player.in_team).map(player => player.name)
const teamString = replaceLastComma(teamNames.join(', '))

async function button() {
  loading.value = true

  if (game?.value.team_accepted === true) {
    // success
  }
  else {
    await client
      .from('games')
      .update({ leader_accepted: false, leader_proposed_team: false, team_accepted: null })
      .eq('id', game.value.id)

    await client
      .from('players')
      .update({ vote: null, voted: false, in_team: false })
      .eq('game', game.value.id)
  }
}
</script>

<template>
  <div class="text-center w-screen max-w-72 px-4 py-20">
    <h1 class="text-5xl mb-6" :class="{ 'text-red-500': !game?.team_accepted }">
      Wahl {{ game?.team_accepted ? 'Erfolgreich' : 'Gescheitert' }}
    </h1>
    <div class="mb-8">
      Das Team aus <span class="text-red-500">{{ teamString }}</span> wurde {{ game?.team_accepted ? 'angenommen' : 'abgelehnt' }}.
    </div>

    <ul class="grid grid-cols-2 mx-auto gap-4 w-full">
      <li v-for="player in players" :key="player.id">
        <div class="aspect-w-5 aspect-h-4">
          <div
            class="flex flex-col border-[0.15rem] border-amber-50 items-center justify-center"
            :class="{
              'border-red-500 text-red-500': !player.vote,
            }"
          >
            <Icon class="mb-2" :name="player.vote ? `streamline:check-solid` : 'streamline:delete-1-solid'" size="2rem" />
            {{ player.name }}
          </div>
        </div>
      </li>
    </ul>

    <div v-if="currentPlayer?.id === leader?.id" class="flex gap-x-4 justify-center mt-10">
      <div v-if="loading">
        <div role="status" class="flex justify-center">
          <svg aria-hidden="true" class="w-8 h-8 text-amber-50 animate-spin fill-amber-50" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="opacity-20" d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
        </div>
      </div>
      <button v-else @click="button">
        – {{ game?.team_accepted ? 'Mission starten' : 'Wahl wiederholen' }} –
      </button>
    </div>
  </div>
</template>
