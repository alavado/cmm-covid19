import { CAMBIAR_FECHA } from '../actionTypes'
import moment from 'moment'

const initialState = {
  dia: 0
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