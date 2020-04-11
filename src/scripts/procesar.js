const XLSX = require('xlsx')

const obtenerSiguienteColumna = columna => {
  const letras = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
    'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
    'X', 'Y', 'Z'
  ]
  const prefijo = columna.length > 1
  if (columna === letras.slice(-1)[0]) {
    return 'AA'
  }
  return (prefijo ? columna[0] : '') + letras[letras.findIndex(l => {
    return l === (prefijo ? columna[1] : columna)
  }) + 1]
}

const obtenerCodigoRegion = nombre => {
  switch (nombre) {
    case 'Arica y Parinacota':
      return 15
    case 'Tarapacá':
      return 1
    case 'Antofagasta':
      return 2
    case 'Atacama':
      return 3
    case 'Coquimbo':
      return 4
    case 'Valparaíso':
      return 5
    case 'Santiago':
      return 13
    case 'O’Higgins':
      return 6
    case 'Maule':
      return 7
    case 'Ñuble':
      return 16
    case 'Biobío':
      return 8
    case 'Araucanía':
      return 9
    case 'Los Ríos':
      return 14
    case 'Los Lagos':
      return 10
    case 'Aysén':
      return 11
    case 'Magallanes':
      return 12
    default:
      return 0
  }
}

const leerDatosRegionales = (hoja, filaInicio) => {
  const wb = XLSX.readFile('./src/scripts/excel/Datos_minsal 09Abril2020.xlsx')
  const sheet = wb.Sheets[hoja]
  const regiones = 16
  let datos = []
  for (let fila = filaInicio; fila < filaInicio + regiones; fila++) {
    let columna = 'A'
    let codigo
    let datosRegion = []
    let celda = `${columna}${fila}`
    while (sheet[celda]) {
      if (columna === 'A') {
        codigo = obtenerCodigoRegion(sheet[celda].v)
      }
      else {
        datosRegion.push(sheet[celda].v)
      }
      columna = obtenerSiguienteColumna(columna)
      celda = `${columna}${fila}`
    }
    datos = [...datos, { codigo, datos: datosRegion }]
  }
  return datos
}

console.log(leerDatosRegionales('estadisticas por hab', 24))