// Anonymous player identity: a UUID minted on first use and kept in
// localStorage. Categorized as strictly necessary storage (see /cookies).
const PLAYER_ID_KEY = 'nc-player-id'
const NICKNAME_KEY = 'nc-nickname'

export function getOrCreatePlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(PLAYER_ID_KEY, id)
  }
  return id
}

export function getLocalNickname(): string {
  return localStorage.getItem(NICKNAME_KEY) ?? ''
}

export function setLocalNickname(nickname: string): void {
  localStorage.setItem(NICKNAME_KEY, nickname)
}
