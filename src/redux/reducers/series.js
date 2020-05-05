import {
  ACTUALIZAR_SERIE, AVANZAR_EN_SERIE, RETROCEDER_EN_SERIE, FIJAR_POSICION_SERIE,
  SELECCIONAR_SERIE, SELECCIONAR_SUBSERIE, FILTRAR_GEOJSON_POR_VALOR, FILTRAR_GEOJSON_POR_REGION,
  TOGGLE_FILTRO, LIMPIAR_FILTROS, FIJAR_GEOJSON_CUARENTENAS, VER_CUARENTENAS,
  INTERPOLAR_COMUNAS
} from '../actionTypes'
import { obtenerCuarentenasActivas } from '../../helpers/cuarentenas'

export const CODIGO_CHILE = 0
export const CONTAGIOS_REGIONALES_POR_100000_HABITANTES = 'CONTAGIOS_REGIONALES_POR_100000_HABITANTES'
export const CASOS_COMUNALES_POR_100000_HABITANTES = 'CASOS_COMUNALES_POR_100000_HABITANTES'
export const CASOS_COMUNALES = 'CASOS_COMUNALES'
export const CASOS_REGIONALES = 'CASOS_REGIONALES'
export const CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS = 'CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS'
export const CASOS_COMUNALES_INTERPOLADOS = 'CASOS_COMUNALES_INTERPOLADOS'

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
    },
    {
      id: CASOS_COMUNALES,
      datos: [],
      geoJSON: null,
      nombre: 'Casos comunales'
    },
    {
      id: CASOS_REGIONALES,
      datos: [],
      geoJSON: null,
      nombre: 'Casos regionales'
    },
    {
      id: CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS,
      datos: [],
      geoJSON: null,
      nombre: 'Casos comunales por 100.000 habitantes'
    },
    {
      id: CASOS_COMUNALES_INTERPOLADOS,
      datos: [],
      geoJSON: null,
      nombre: 'Casos comunales interpolados'
    }
  ],
  serieSeleccionada: {
    filtroValor: x => true,
    filtroRegion: x => true,
  },
  subserieSeleccionada: null,
  filtroToggle: false,
  geoJSONCuarentenasActivas: null,
  geoJSONCuarentenas: null,
  verCuarentenas: true,
  posicion: 0,
  interpolarComunas: false
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
      const posicion = Math.max(state.posicion - 1, 0)
      const fechaSerie = state.subserieSeleccionada.datos[posicion].fecha
      return {
        ...state,
        posicion,
        geoJSONCuarentenasActivas: obtenerCuarentenasActivas(state.geoJSONCuarentenas, fechaSerie) 
      }
    }
    case AVANZAR_EN_SERIE: {
      const posicion = Math.min(state.posicion + 1, state.subserieSeleccionada.datos.length - 1)
      const fechaSerie = state.subserieSeleccionada.datos[posicion].fecha
      return {
        ...state,
        posicion,
        geoJSONCuarentenasActivas: obtenerCuarentenasActivas(state.geoJSONCuarentenas, fechaSerie)
      }
    }
    case FIJAR_POSICION_SERIE: {
      const posicion = action.payload
      const fechaSerie = state.subserieSeleccionada.datos[posicion].fecha
      return {
        ...state,
        posicion,
        geoJSONCuarentenasActivas: obtenerCuarentenasActivas(state.geoJSONCuarentenas, fechaSerie)
      }
    }
    case SELECCIONAR_SERIE: {
      const idSerie = action.payload
      const nuevaSerieSeleccionada = state.series.find(s => s.id === idSerie)
      return {
        ...state,
        serieSeleccionada: {
          ...nuevaSerieSeleccionada,
          filtroRegion: state.serieSeleccionada.filtroRegion,
          filtroValor: state.serieSeleccionada.filtroValor,
        },
        subserieSeleccionada: nuevaSerieSeleccionada.datos[0],
        posicion: nuevaSerieSeleccionada.datos[0].datos.length - 1,
        geoJSONCuarentenasActivas: obtenerCuarentenasActivas(state.geoJSONCuarentenas, nuevaSerieSeleccionada.datos[0].datos.slice(-1)[0].fecha),
        interpolarComunas: idSerie === CASOS_COMUNALES_POR_100000_HABITANTES_INTERPOLADOS
      }
    }
    case SELECCIONAR_SUBSERIE: {
      const codigo = action.payload
      if (codigo === CODIGO_CHILE) {
        const serieRegional = state.series.find(c => c.id === CONTAGIOS_REGIONALES_POR_100000_HABITANTES)
        const serieChile = serieRegional.datos.find(s => s.codigo === CODIGO_CHILE)
        return {
          ...state,
          serieSeleccionada: {
            ...serieRegional,
            filtroRegion: state.serieSeleccionada.filtroRegion,
            filtroValor: state.serieSeleccionada.filtroValor
          },
          subserieSeleccionada: serieChile,
          posicion: serieChile.datos.length - 1 
        }
      }
      return {
        ...state,
        subserieSeleccionada: state.serieSeleccionada.datos.find(s => s.codigo === codigo)
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
    case FIJAR_GEOJSON_CUARENTENAS: {
      return {
        ...state,
        geoJSONCuarentenas: action.payload
      }
    }
    case VER_CUARENTENAS: {
      return {
        ...state,
        verCuarentenas: action.payload
      }
    }
    case INTERPOLAR_COMUNAS: {
      return {
        ...state,
        interpolarComunas: action.payload
      }
    }
    default:
      return state
  }
}