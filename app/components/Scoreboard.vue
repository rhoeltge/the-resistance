<script setup lang="ts">
import { playerCount } from '~/data/playerCount'
import type { Game, Player } from '~/types/supabase'

const { current: game } = storeToRefs(useGameStore())
const { all: players } = storeToRefs(usePlayersStore())

function endGame() {
  if (window.confirm(`Möchtest du das Spiel abbrechen?`)) {
    if (window.confirm(`Bist du dir sicher?`)) {
      localStorage.setItem('game_data', JSON.stringify({
        userId: null,
        gameId: null,
        role: null,
      }))

      location.reload()
    }
  }
}

const client = useSupabaseClient()

async function gameManager() {
  if (!game.value || !players.value || !players.value.length)
    return

  if (game.value.state === 'Reveal' && !players.value.map(el => el.reveal_finished).includes(false)) {
    await client
      .from('games')
      .update({ state: 'Vote', round: 1 })
      .eq('id', game.value.id)
  }

  if (game.value.state === 'Vote' && game.value.leader_accepted && game.value.team_accepted === null && !players.value.map(el => el.voted).includes(false)) {
    const successful = players.value.filter(p => p.vote === true).length > players.value.filter(p => p.vote === false).length

    await client
      .from('games')
      .update({ team_accepted: successful, vote_repeat: game.value.vote_repeat + (successful ? 0 : 1) })
      .eq('id', game.value.id)
  }
}

watch(game, gameManager)
watch(players, gameManager)
</script>

<template>
  <!-- <div class="fixed top-0 right-0 z-10 h-dvh overflow-scroll opacity-50 bg-amber-50 text-black p-4">
    game:
    <pre>{{ game }}</pre>
    <br>
    users:
    <pre>{{ players }}</pre>
  </div> -->
  <div>
    <div class="fixed flex items-center justify-center top-0 left-0 w-12 h-12 cursor-pointer transition">
      <Icon class="rotate-45" name="streamline:add-circle-solid" size="1.75rem" @click="endGame" />
    </div>

    <div class="flex flex-col max-w-[50rem] w-[80vw]">
      <h1 class="mb-12">
        Missionen:
      </h1>
      <div class="mb-24 flex gap-x-4">
        <div v-for="index in 5" :key="index" class="relative flex flex-col items">
          <Icon v-if="game.round === index" class="absolute left-1/2 -translate-x-1/2 -translate-y-14 text-red-500" name="material-symbols:arrow-drop-down" size="4rem" />
          <div v-if="game.mission_history[index - 1] == null" class="size-24 flex items-center justify-center text-5xl font-normal pb-0.5 border-amber-50 border-[0.15rem] rounded-full">
            <span class="opacity-40">{{ playerCount[players.length][index - 1] }}</span>
          </div>
          <div v-if="game.mission_history[index - 1] === false" class="flex items-center pb-1 justify-center w-24 h-24 border-red-500 bg-red-500 border-[0.15rem] rounded-full">
            <Icon class="text-amber-50" name="streamline:visible-solid" size="3rem" />
          </div>
          <div v-if="game.mission_history[index - 1] === true" class="flex items-center pb-1 justify-center w-24 h-24 border-amber-50 bg-amber-50 border-[0.15rem] rounded-full">
            <Icon class="text-black" name="streamline:fist-solid" size="3rem" />
          </div>
          <div v-if="index === 4 && players.length >= 7" class="absolute font-normal w-24 text-center -bottom-11 leading-normal left-1/2 -translate-x-1/2 text-xs text-white">
            2 Fehlschläge erforderlich!
          </div>
        </div>
      </div>

      <h1 class="text-4xl mb-10">
        Abstimmungen:
      </h1>
      <div class="mb-20 flex gap-x-4">
        <div v-for="index in 5" :key="index" class="relative flex flex-col items">
          <Icon v-if="game.state === 'Vote' && game.vote_repeat === index - 1 && game?.team_accepted !== true" class="absolute left-1/2 -translate-x-1/2 -translate-y-10 text-red-500" name="material-symbols:arrow-drop-down" size="2.5rem" />
          <div v-if="game.vote_repeat === index - 1 && game?.team_accepted === true" class="flex items-center justify-center w-12 h-12 border-white bg-white border-[0.15rem] rounded-full">
            <Icon class="text-black" name="streamline:check-solid" size="1.2rem" />
          </div>
          <div v-else-if="game.vote_repeat > index - 1" class="flex items-center justify-center w-12 h-12 border-red-500 bg-red-500 border-[0.15rem] rounded-full">
            <Icon class="text-amber-50" name="streamline:delete-1-solid" size="1.2rem" />
          </div>
          <div v-else class="size-12 flex items-center justify-center text-xl border-amber-50 border-[0.15rem] rounded-full">
            <!-- <span class="opacity-30">{{ index }}</span> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
