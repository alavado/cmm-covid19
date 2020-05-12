import { SELECCIONAR_SERIE, SELECCIONAR_SUBSERIE, ACTUALIZAR_SERIE,
  AVANZAR_EN_SERIE, RETROCEDER_EN_SERIE, FIJAR_POSICION_SERIE,
  FILTRAR_GEOJSON_POR_VALOR, FILTRAR_GEOJSON_POR_REGION, TOGGLE_FILTRO,
  LIMPIAR_FILTROS, ACTIVAR_DALTONISMO,
  MOSTRAR_AYUDA, FIJAR_GEOJSON_CUARENTENAS, VER_CUARENTENAS,
  DESTACAR_INDICE,
  ACTIVAR_ANIMACIONES,
  INTERPOLAR_COMUNAS,
  EXPANDIR_RANKING,
  NORMALIZAR_POR_100000_HABITANTES,
  CAMBIAR_ORDEN_RANKING,
  MOSTRAR_MINI_GRAFICOS
} from './actionTypes'

export const actualizarSerie = (id, propiedad, valor) => ({
  type: ACTUALIZAR_SERIE,
  payload: { id, propiedad, valor }
})

export const avanzarEnSerie = () => ({
  type: AVANZAR_EN_SERIE
})

export const retrocederEnSerie = () => ({
  type: RETROCEDER_EN_SERIE
})

export const fijarPosicionSerie = pos => ({
  type: FIJAR_POSICION_SERIE,
  payload: Number(pos)
})

export const seleccionarSerie = id => ({
  type: SELECCIONAR_SERIE,
  payload: id
})

export const seleccionarSubserie = codigo => ({
  type: SELECCIONAR_SUBSERIE,
  payload: codigo
})

export const filtrarGeoJSONPorValor = filtro => ({
  type: FILTRAR_GEOJSON_POR_VALOR,
  payload: filtro
})

export const filtrarGeoJSONPorRegion = filtro => ({
  type: FILTRAR_GEOJSON_POR_REGION,
  payload: filtro
})

export const toggleFiltro = estado => ({
  type: TOGGLE_FILTRO,
  payload: estado
})

export const limpiarFiltros = () => ({
  type: LIMPIAR_FILTROS
})

export const mostrarAyuda = mostrar => ({
  type: MOSTRAR_AYUDA,
  payload: mostrar
})

export const activarDaltonismo = estado => ({
  type: ACTIVAR_DALTONISMO,
  payload: estado
})

export const activarAnimaciones = estado => ({
  type: ACTIVAR_ANIMACIONES,
  payload: estado
})

export const destacarIndice = indice => ({
  type: DESTACAR_INDICE,
  payload: indice
})

export const fijarGeoJSONCuarentenas = geoJSON => ({
  type: FIJAR_GEOJSON_CUARENTENAS,
  payload: geoJSON
})

export const fijarVerCuarentenas = ver => ({
  type: VER_CUARENTENAS,
  payload: ver
})

export const interpolarComunas = interp => ({
  type: INTERPOLAR_COMUNAS,
  payload: interp
})

export const expandirRanking = expandir => ({
  type: EXPANDIR_RANKING,
  payload: expandir
})

export const normalizarPor100000Habitantes = normalizar => ({
  type: NORMALIZAR_POR_100000_HABITANTES,
  payload: normalizar
})

export const cambiarOrdenRanking = normalizar => ({
  type: CAMBIAR_ORDEN_RANKING,
  payload: normalizar
})

export const mostrarMiniGraficos = mostrar => ({
  type: MOSTRAR_MINI_GRAFICOS,
  payload: mostrar
})