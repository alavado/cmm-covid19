import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './components/App'
import * as serviceWorker from './serviceWorker'
import { Provider } from 'react-redux'
import store from './redux/store'
import { BrowserRouter as Router } from 'react-router-dom'

if (window.location.pathname.indexOf('icovid') >= 0) {
  window.location.href = 'https://icovid.netlify.app/'
}
else {
  ReactDOM.render(
    <Router>
      <Provider store={store}>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </Provider>
    </Router>,
    document.getElementById('root')
  )
}

serviceWorker.unregister()
