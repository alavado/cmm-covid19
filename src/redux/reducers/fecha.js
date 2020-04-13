import { CAMBIAR_FECHA } from '../actionTypes'
import fechaInicial from '../../config/fechaInicial'
import moment from 'moment'

const initialState = {
  dia: moment().diff(fechaInicial, 'days')
}

export default function(state = initialState, action) {
  switch (action.type) {
    case CAMBIAR_FECHA: {
      return {
        ...state,
        dia: action.payload
      }
    }
    default:
      return state
  }
}