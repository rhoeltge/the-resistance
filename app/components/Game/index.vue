<script setup lang="ts">
const { all: players, current: currentPlayer } = storeToRefs(usePlayersStore())
const { current: game } = storeToRefs(useGameStore())

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

function showInfo() {
  window.alert(`Du bist ${currentPlayer.value?.role}. Es gibt ${players.value?.filter(el => el.role === 'Spion').length} Spione.`)
}

const resistanceWon = computed(() => game?.value.mission_history.filter(el => el).length >= 3)
const spiesWon = computed(() => game?.value.mission_history.filter(el => !el).length >= 3 || game?.value?.vote_repeat >= 5)
</script>

<template>
  <div>
    <div class="fixed flex items-center justify-center top-0 left-0 w-12 h-12 cursor-pointer transition">
      <Icon class="rotate-45" name="streamline:add-circle-solid" size="1.75rem" @click="endGame" />
    </div>
    <div class="fixed flex items-center justify-center top-0 right-0 w-12 h-12 cursor-pointer transition">
      <Icon name="streamline:information-circle-solid" size="1.75rem" @click="showInfo" />
    </div>
    <div v-if="resistanceWon || spiesWon">
      <GameEndscreen :winners="resistanceWon ? 'Resistance' : 'Spies'" />
    </div>
    <div v-else>
      <GameReveal v-if="game.state === 'Reveal'" />
      <div v-if="game?.state === 'Vote'">
        <GameVoteLeader v-if="!game.leader_accepted" />
        <GameVoteSelect v-else-if="!game.leader_proposed_team" />
        <GameVote v-else-if="game.team_accepted === null" />
        <GameVoteResults v-else />
      </div>
      <div v-if="game.state === 'Mission'">
        <GameMission v-if="players.filter(p => p.in_team && p.voted).length !== players.filter(p => p.in_team).length" />
        <GameMissionResults v-else />
      </div>
    </div>
  </div>
</template>
