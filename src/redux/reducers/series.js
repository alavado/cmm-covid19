import {
  ACTUALIZAR_SERIE, AVANZAR_EN_SERIE, RETROCEDER_EN_SERIE, FIJAR_POSICION_SERIE,
  SELECCIONAR_SERIE, SELECCIONAR_SUBSERIE, FILTRAR_GEOJSON_POR_VALOR, FILTRAR_GEOJSON_POR_REGION,
  TOGGLE_FILTRO, LIMPIAR_FILTROS
} from '../actionTypes'

export const CODIGO_CHILE = 0
export const CONTAGIOS_REGIONALES_POR_100000_HABITANTES =  'CONTAGIOS_REGIONALES_POR_100000_HABITANTES'
export const CASOS_COMUNALES_POR_100000_HABITANTES =  'CONTAGIOS_COMUNALES_POR_100000_HABITANTES'

const initialState = {
  series: [
    {
      id: CONTAGIOS_REGIONALES_POR_100000_HABITANTES,
      datos: [],
      geoJSON: null,
      nombre: 'Nuevos casos por 100.000 habitantes'
    },
    {
      id: CASOS_COMUNALES_POR_100000_HABITANTES,
      datos: [],
      geoJSON: null,
      nombre: 'Nuevos casos por 100.000 habitantes'
    }
  ],
  serieSeleccionada: {
    filtroValor: x => true,
    filtroRegion: x => true,
  },
  subserieSeleccionada: null,
  filtroToggle: false,
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
      return {
        ...state,
        posicion: Math.min(state.posicion + 1, state.subserieSeleccionada.datos.length - 1)
      }
    }
    case FIJAR_POSICION_SERIE: {
      return {
        ...state,
        posicion: action.payload
      }
    }
    case SELECCIONAR_SERIE: {
      const nuevaSerieSeleccionada = state.series.find(s => s.id === action.payload)
      return {
        ...state,
        serieSeleccionada: {
          ...nuevaSerieSeleccionada,
          filtroRegion: state.serieSeleccionada.filtroRegion,
          filtroValor: state.serieSeleccionada.filtroValor
        },
        subserieSeleccionada: nuevaSerieSeleccionada.datos[0],
        posicion: nuevaSerieSeleccionada.datos[0].datos.length - 1
      }
    }
    case SELECCIONAR_SUBSERIE: {
      return {
        ...state,
        subserieSeleccionada: state.serieSeleccionada.datos.find(s => s.codigo === action.payload)
      }
    }
    case FILTRAR_GEOJSON_POR_VALOR: {
      return {
        ...state,
        serieSeleccionada: {
          ...state.serieSeleccionada,
          filtroValor: action.payload
        }
      }
    }
    case FILTRAR_GEOJSON_POR_REGION: {
      console.log(action.payload)
      return {
        ...state,
        serieSeleccionada: {
          ...state.serieSeleccionada,
          filtroRegion: action.payload
        }
      }
    }
    case TOGGLE_FILTRO: {
      return {
        ...state,
        filtroToggle: action.payload
      }
    }
    case LIMPIAR_FILTROS: {
      console.log('se limpiaron los filtros')
      return {
        ...state,
        filtroToggle: false,
        serieSeleccionada: {
          ...state.serieSeleccionada,
          filtroRegion: x => true,
          filtroValor: x => true
        }
      }
    }
    default:
      return state
  }
}