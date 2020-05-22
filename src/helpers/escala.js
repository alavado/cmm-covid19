export const escala = [
  [0, '#abdda4'],
  [0.5, '#e6f598'],
  [1.0, '#ffffbf'],
  [2.5, '#fee08b'],
  [5.0, '#fdae61'],
  [10.0, '#f46d43'],
  [50.0, '#d53e4f']
]

export const colorApagado = '#424242'

export const escalaDaltonica = [
  [0, '#6174B2'],
  [0.5, '#7587C6'],
  [1.0, '#90A2E1'],
  [2.5, '#A7B8F8'],
  [5.0, '#AAAEB6'],
  [10.0, '#ACA685'],
  [50.0, '#AE9D4A']
]

export const escalaAbsoluta = [
  [0, '#abdda4'],
  [10, '#e6f598'],
  [100, '#ffffbf'],
  [500, '#fee08b'],
  [1000, '#fdae61'],
  [5000, '#f46d43'],
  [10000, '#d53e4f']
]

export const colorApagadoDaltonico = '#333333'

export const obtenerColor = (valor, escala, colores) => {
  const indiceLimite = escala.findIndex(limite => limite > valor)
  return indiceLimite >= 0 ? colores[Math.max(0, indiceLimite - 1)][1] : colores.slice(-1)[0][1]
}