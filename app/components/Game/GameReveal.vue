<script setup lang="ts">
import type { Game, Player } from '~/types/supabase'

const { current: game } = storeToRefs(useGameStore())
const { all: players, current: currentPlayer } = storeToRefs(usePlayersStore())

const client = useSupabaseClient()

const page = ref(1)

const leader = players.value.find(p => p.id === game.value.leader)

function replaceLastComma(str: string) {
  const lastCommaIndex = str.lastIndexOf(', ')

  if (lastCommaIndex === -1) {
    return str
  }

  return `${str.substring(0, lastCommaIndex)} und ${str.substring(lastCommaIndex + 2)}`
}

const spyNames = players.value.filter(player => player.role === 'Spion' && player.id !== currentPlayer.value.id).map(player => player.name)
const spiesString = replaceLastComma(spyNames.join(', '))

async function setReady() {
  await client
    .from('players')
    .update({ reveal_finished: true })
    .eq('id', currentPlayer.value.id)
}
</script>

<template>
  <div class="text-center w-full max-w-xs sm:max-w-md px-4">
    <div v-if="!currentPlayer.reveal_finished">
      <div>
        <div v-if="page === 1">
          <p>
            <span class="text-red-500">{{ leader?.id === currentPlayer.id ? 'Du' : leader?.name }}</span> {{ leader?.id === currentPlayer.id ? 'leitest' : 'leitet' }} derzeit die Gruppe „{{ game.name }}“, die sich dem Widerstand gegen die aktuelle Ordnung verschrieben hat.
          </p>
        </div>

        <div v-if="page === 2">
          <p v-if="currentPlayer.role === 'Widerstandskämpfer'">
            Als Teil der <span class="text-red-500">Widerstands&shy;kämpfer</span>, kämpfst du für die Freiheit.
          </p>
          <p v-else>
            Aber du bist ein <span class="text-red-500">geheimer Spion</span>, welcher sich eingeschlichen hat.
          </p>
        </div>

        <div v-if="page === 3">
          <div v-if="currentPlayer.role === 'Widerstandskämpfer'">
            <p class="mb-4">
              Es gibt Gerüchte, dass sich <span class="text-red-500">{{ spyNames.length === 2 ? 'zwei' : spyNames.length === 3 ? 'drei' : 'vier' }} Spione</span> in unserer Gruppe befinden – bleibe wachsam und vertraue niemandem blind.
            </p>
            <p>
              Arbeitet zusammen, um die Pläne der Feinde zu vereiteln und unsere Gemeinschaft zu schützen. Bleibe wachsam und vertraue deinen Instinkten – ein einziger Fehler könnte unsere Mission gefährden.
            </p>
          </div>
          <div v-else>
            <p class="mb-4">
              Du bist nicht allein – <span class="text-red-500">{{ spiesString }}</span> {{ spyNames.length > 1 ? "sind" : "ist" }} ebenfalls Teil unserer geheimen Operation.
            </p>
            <p>
              Arbeitet zusammen, um das Vertrauen der Widerstandskämpfer zu gewinnen und ihre Bemühungen zu untergraben. Sei vorsichtig und diskret – ein einziger Fehler könnte alles gefährden.
            </p>
          </div>
        </div>
      </div>

      <div class="flex gap-x-4 justify-center mt-10">
        <button v-if="page > 1" class="hover:!text-amber-50" @click="page -= 1">
          – Zurück –
        </button>
        <button v-if="page < 3" class="hover:!text-amber-50" @click="page += 1">
          – Weiter –
        </button>

        <button v-if="page === 3" class="text-red-500" @click="setReady">
          – Bereit –
        </button>
      </div>
    </div>
    <div v-else>
      <ul class="flex gap-x-2">
        <div v-for="el in [...players].sort((a, b) => (b.reveal_finished ? 1 : 0) - (a.reveal_finished ? 1 : 0))" :key="el.id" class="w-2.5 h-2.5 rounded-full ring-inset ring-1 ring-amber-50" :class="{ '!bg-red-500 !ring-0': el.reveal_finished }" />
      </ul>
    </div>
  </div>
</template>
