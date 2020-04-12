import { CAMBIAR_FECHA, SELECCIONAR_REGION } from './actionTypes'
import infectadosPor100000 from '../data/regional/infectados_por_100000.json'
import moment from 'moment'
import fechaInicial from '../config/fechaInicial'

export const fijarDia = dia => ({
  type: CAMBIAR_FECHA,
  payload: Math.min(Math.max(0, Number(dia)), moment().diff(fechaInicial, 'days'))
})

export const seleccionarRegion = (nombre, codigo) => ({
  type: SELECCIONAR_REGION,
  payload: {
    nombre,
    codigo,
    datos: infectadosPor100000.find(r => Number(r.codigo) === Number(codigo)).datos
  }
})