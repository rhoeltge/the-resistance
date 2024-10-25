import { useStorage as useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Game } from '~/types/supabase'

export const useGameStore = defineStore('game-store', () => {
  const game = ref<Game>()
  let gamesRealtimeChannel: RealtimeChannel

  const current = computed(() => game.value)

  const subscribe = async (gameId: number) => {
    const client = useSupabaseClient()

    const refreshGames = async () => {
      console.log('refreshGames')

      const { data } = await client.from('games').select().eq('id', gameId)

      if (data.length) {
        game.value = data[0]
      }
      else {
        localStorage.setItem('game_data', JSON.stringify({
          userId: null,
          gameId: null,
          role: null,
        }))

        location.reload()
      }
    }

    await refreshGames()

    gamesRealtimeChannel = client.channel('public:games').on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'games' },
      () => refreshGames(),
    )

    gamesRealtimeChannel.subscribe()
  }

  const unsubscribe = async () => {
    const client = useSupabaseClient()

    await client.removeChannel(gamesRealtimeChannel)
  }

  return { current, subscribe, unsubscribe }
})
