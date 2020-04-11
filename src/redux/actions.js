import { CAMBIAR_FECHA, SELECCIONAR_REGION } from './actionTypes'
import infectadosPor100000 from '../data/regional/infectados_por_100000.json'

export const fijarDia = dia => ({
  type: CAMBIAR_FECHA,
  payload: Number(dia)
})

export const seleccionarRegion = (nombre, codigo) => ({
  type: SELECCIONAR_REGION,
  payload: {
    nombre,
    codigo,
    datos: infectadosPor100000.find(r => Number(r.codigo) === Number(codigo)).datos
  }
})