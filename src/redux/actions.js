import { CAMBIAR_FECHA, SELECCIONAR_REGION, SELECCIONAR_CHILE, ACTUALIZAR_SERIE, AVANZAR_EN_SERIE, RETROCEDER_EN_SERIE, FIJAR_POSICION_SERIE } from './actionTypes'

export const fijarDia = (dia, region) => {
  const dias = region.datos.length
  return {
    type: CAMBIAR_FECHA,
    payload: Math.min(Math.max(0, Number(dia)), dias - 1)
  }
}

export const seleccionarRegion = (nombre, codigo) => ({
  type: SELECCIONAR_REGION,
  payload: {
    nombre,
    codigo
  }
})

export const seleccionarChile = () => ({
  type: SELECCIONAR_CHILE
})

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
  payload: pos
})