import { delay } from 'msw'

// 네트워크 지연 시뮬레이션 (200~500ms 랜덤)
const getRandomDelay = () => 200 + Math.random() * 300

export const simulateNetworkDelay = () => delay(getRandomDelay())
