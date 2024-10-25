export interface Game {
  id: number
  name: string
  started: boolean
  state: 'Reveal' | 'Vote' | 'Mission'
  round: number
  leader: number | null
  leader_accepted: boolean
  leader_proposed_team: boolean
  team_accepted: boolean | null
  leader_closed_team_vote: boolean
  vote_repeat: number
  leader_closed_mission: boolean
  mission_history: boolean[]
}

export interface Player {
  id: number
  name: string
  game: number
  role: 'Spion' | 'Widerstandskämpfer' | null
  reveal_finished: boolean
  vote: boolean | null
  voted: boolean
  in_team: boolean
}
