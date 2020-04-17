import { SELECCIONAR_SERIE, SELECCIONAR_SUBSERIE, ACTUALIZAR_SERIE, AVANZAR_EN_SERIE, RETROCEDER_EN_SERIE, FIJAR_POSICION_SERIE } from './actionTypes'

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