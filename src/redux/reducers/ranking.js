import { EXPANDIR_RANKING, CAMBIAR_ORDEN_RANKING } from '../actionTypes'

export const RANKING_NUEVOS_CASOS_POR_100000_HABITANTES = 'RANKING_NUEVOS_CASOS_POR_100000_HABITANTES'
export const RANKING_NUEVOS_CASOS = 'RANKING_NUEVOS_CASOS'
export const RANKING_CASOS_TOTALES = 'RANKING_CASOS_TOTALES'
export const RANKING_VARIACION_SEMANAL = 'RANKING_VARIACION_SEMANAL'

const initialState = {
  rankingExpandido: false,
  ordenRanking: RANKING_NUEVOS_CASOS_POR_100000_HABITANTES
}

export default function(state = initialState, action) {
  switch (action.type) {
    case EXPANDIR_RANKING: {
      return {
        ...state,
        rankingExpandido: action.payload
      }
    }
    case CAMBIAR_ORDEN_RANKING: {
      return {
        ...state,
        ordenRanking: action.payload
      }
    }
    default:
      return state
  }
}