// export const escala = [
//   [0, '#abdda4'],
//   [0.5, '#e6f598'],
//   [1.0, '#ffffbf'],
//   [2.5, '#fee08b'],
//   [5.0, '#fdae61'],
//   [10.0, '#f46d43'],
//   [50.0, '#d53e4f']
// ]
export const escala = [
  [0, '#89B183'],
  [0.5, '#B8C47A'],
  [1.0, '#CCCC99'],
  [2.5, '#CBB36F'],
  [5.0, '#CA8B4E'],
  [10.0, '#C35736'],
  [50.0, '#AA323F']
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

export const obtenerColor = (valor, dataset, colores) => {
  let indiceLimite = dataset.escala.findIndex(limite => limite > valor) - 1
  indiceLimite = indiceLimite * Math.ceil((colores.length - 1) / (dataset.escala.length - 1))
  if (indiceLimite < 0) {
    indiceLimite = colores.length - 1
  }
  let invertirColores = dataset.opciones.invertirColores
  return colores[invertirColores ? (colores.length - 1 - indiceLimite): indiceLimite][1]
}