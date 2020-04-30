const localeIndexOf = require('locale-index-of')(Intl)

export const busqueda = (termino, frase) => {
  return localeIndexOf(frase, termino, 'es', { sensitivity: 'base' })
}