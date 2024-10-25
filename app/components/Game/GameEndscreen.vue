<script setup lang="ts">
const props = defineProps<{
  winners: 'Resistance' | 'Spies'
}>()

// const { current: game } = storeToRefs(useGameStore())
const { all: players } = storeToRefs(usePlayersStore())

const client = useSupabaseClient()

function replaceLastComma(str: string) {
  const lastCommaIndex = str.lastIndexOf(', ')

  if (lastCommaIndex === -1) {
    return str
  }

  return `${str.substring(0, lastCommaIndex)} und ${str.substring(lastCommaIndex + 2)}`
}

const spiesNames = players.value.filter(player => player.role === 'Spion').map(player => player.name)
const spiesString = replaceLastComma(spiesNames.join(', '))
</script>

<template>
  <div class="text-center w-screen max-w-72 px-4">
    <span class="h3" :class="{ '!text-amber-50': props.winners === 'Spies' }">{{ props.winners === 'Resistance' ? 'Der' : 'Die' }}</span>
    <h1 class="mb-1" :class="{ '!text-red-500': props.winners === 'Spies' }">
      {{ props.winners === 'Resistance' ? 'Widerstand' : 'Spione' }}
    </h1>
    <h2 class="h3" :class="{ '!text-amber-50': props.winners === 'Spies' }">
      {{ props.winners === 'Resistance' ? 'hat' : 'haben' }} gewonnen
    </h2>

    <div class="mt-7 mb-6">
      <div v-if="props.winners === 'Resistance'" class="inline-flex items-center pb-1 justify-center w-24 h-24 border-amber-50 bg-amber-50 border-[0.15rem] rounded-full">
        <Icon class="text-black" name="streamline:fist-solid" size="3rem" />
      </div>
      <div v-if="props.winners === 'Spies'" class="inline-flex items-center pb-1 justify-center w-24 h-24 border-red-500 bg-red-500 border-[0.15rem] rounded-full">
        <Icon class="text-amber-50" name="streamline:visible-solid" size="3rem" />
      </div>
    </div>

    <div v-if="props.winners === 'Resistance'" class="mb-8">
      Die Spione <span class="text-red-500">{{ spiesString }}</span> sind mit ihren Plänen gescheitert.
    </div>
    <div v-if="props.winners === 'Spies'" class="mb-8">
      Die Pläne der Spione <span class="text-red-500">{{ spiesString }}</span> waren erfolgreich.
    </div>
  </div>
</template>
