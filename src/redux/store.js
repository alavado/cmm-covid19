import { createStore, applyMiddleware } from 'redux'
import rootReducer from './reducers'
import { save, load } from 'redux-localstorage-simple'

const createStoreWithMiddleware =
  applyMiddleware(save({ states: ['colores', 'comparacion']}))
  (createStore)

export default createStoreWithMiddleware(
  rootReducer,    
  load({
    states: ['colores', 'comparacion']
  })
)
