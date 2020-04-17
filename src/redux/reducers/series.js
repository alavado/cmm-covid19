import {
  ACTUALIZAR_SERIE, AVANZAR_EN_SERIE, RETROCEDER_EN_SERIE, FIJAR_POSICION_SERIE,
  SELECCIONAR_SERIE, SELECCIONAR_SUBSERIE }
from '../actionTypes'

export const CODIGO_CHILE = 0
export const CONTAGIOS_REGIONALES_POR_100000_HABITANTES =  'CONTAGIOS_REGIONALES_POR_100000_HABITANTES'

const initialState = {
  series: [
    {
      id: CONTAGIOS_REGIONALES_POR_100000_HABITANTES,
      datos: [],
      geoJSON: null
    }
  ],
  serieSeleccionada: null,
  subserieSeleccionada: null,
  posicion: 0
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
    case RETROCEDER_EN_SERIE: {
      return {
        ...state,
        posicion: Math.max(state.posicion - 1, 0)
      }
    }
    case AVANZAR_EN_SERIE: {
      const serie = state.series.find(s => s.id === state.serieSeleccionada)
      return {
        ...state,
        posicion: Math.min(state.posicion + 1, serie.datos.length - 1)
      }
    }
    case FIJAR_POSICION_SERIE: {
      console.log('pos en redux', action.payload)
      return {
        ...state,
        posicion: action.payload
      }
    }
    case SELECCIONAR_SERIE: {
      return {
        ...state,
        serieSeleccionada: state.series.find(s => s.id === action.payload)
      }
    }
    case SELECCIONAR_SUBSERIE: {
      return {
        ...state,
        subserieSeleccionada: state.serieSeleccionada.datos.find(s => s.codigo === action.payload)
      }
    }
    default:
      return state
  }
}