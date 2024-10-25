import { useStorage as useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Player } from '~/types/supabase'

export const usePlayersStore = defineStore('players-store', () => {
  const client = useSupabaseClient()
  const currentUserId = useCurrentUserId()

  const players = ref<Player[]>()
  let playersRealtimeChannel: RealtimeChannel

  const all = computed(() => players.value)
  const current = computed<Player | undefined>(() => currentUserId && players.value ? players.value.find(p => p.id === currentUserId.value) : undefined)

  const subscribe = async (gameId: number) => {
    const refreshPlayers = async () => {
      console.log('refreshPlayers')

      const { data } = await client.from('players').select().eq('game', gameId).order('id', { ascending: true })

      players.value = data
    }

    await refreshPlayers()

    playersRealtimeChannel = client.channel('public:players').on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'players' },
      () => refreshPlayers(),
    )

    playersRealtimeChannel.subscribe()
  }

  const unsubscribe = async () => {
    await client.removeChannel(playersRealtimeChannel)
  }

  return { all, current, subscribe, unsubscribe }
})
