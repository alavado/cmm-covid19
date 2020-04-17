import { ACTUALIZAR_SERIE } from '../actionTypes'

export const CONTAGIOS_REGIONALES_POR_100000_HABITANTES =  'CONTAGIOS_REGIONALES_POR_100000_HABITANTES'

const initialState = {
  series: [
    {
      id: CONTAGIOS_REGIONALES_POR_100000_HABITANTES,
      datos: [],
      geoJSON: null
    }
  ],
  serieSeleccionada: CONTAGIOS_REGIONALES_POR_100000_HABITANTES
}

export default function(state = initialState, action) {
  switch (action.type) {
    case ACTUALIZAR_SERIE: {
      const { id, propiedad, valor } = action.payload
      const serie = state.series.find(s => s.id === id)
      if (!serie) {
        return state
      }
      return {
        ...state,
        series: [
          ...state.series.filter(s => s.id !== id),
          {
            ...serie,
            [propiedad]: valor
          }
        ]
      }
    }
    default:
      return state
  }
}