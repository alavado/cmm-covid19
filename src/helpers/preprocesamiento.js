import moment from 'moment/min/moment-with-locales'

const separarCSVEnFilas = csv => {
  let filas = csv.split('\n')
  if (filas.slice(-1)[0].trim() === '') {
    filas = filas.slice(0, -1)
  }
  const encabezados = filas[0].split(',')
  const datos = filas.slice(1).map(fila => fila.split(','))
  return [encabezados, datos]
}

export const procesarCSVRegiones = csv => {
  const [encabezados, datos] = separarCSVEnFilas(csv)
  const fechas = encabezados.slice(2).map(fecha => moment(fecha, 'MM/DD/YYYY'))
  const serieChile = fechas.map(f => ({ valor: 0, fecha: f.clone() }))
  const seriesRegiones = datos
    .map(dato => {
      const [codigo, nombre, ...serie] = dato.map((v, i) => i !== 1 ? Number(v) : v)
      return {
        codigo,
        nombre,
        serie: serie.map((valor, i) => {
          serieChile[i].valor += valor
          return {
            valor,
            fecha: fechas[i].clone()
          }
        })
      }
    })
  return [serieChile, seriesRegiones]
}

export const procesarCSVComunas = (csv, seriesRegiones) => {
  const ti = Date.now()
  const [encabezados, datos] = separarCSVEnFilas(csv)
  const todasLasFechas = seriesRegiones[0].serie.map(d => d.fecha)
  const fechasComunas = [
    todasLasFechas[0].clone(),
    ...encabezados.slice(4).map(fecha => moment(fecha, 'MM/DD/YYYY'))
  ]
  const hashRegiones = seriesRegiones.reduce((obj, r) => ({ ...obj, [r.codigo]: r }), {})
  const seriesComunas = datos.map(comuna => {
    const [codigoRegion, region, codigo, nombre, ...serie] = comuna
      .map((v, i) => (i !== 1 && i !== 3) ? (isNaN(v) ? 0 : Number(v)) : v)
    const serieRegion = hashRegiones[codigoRegion].serie
    return {
      codigo,
      nombre,
      codigoRegion,
      region,
      serie: [0, ...serie].reduce((prev, valor, i, arr) => {
        let secuencia = [{ fecha: fechasComunas[i].clone(), valor }]
        if (i > 0) {
          const casosFecha = serieRegion[fechasComunas[i].diff(fechasComunas[0], 'days')].valor
          const casosAnteriores = serieRegion[fechasComunas[i - 1].diff(fechasComunas[0], 'days')].valor
          for (let fecha = fechasComunas[i].clone().add(-1, 'days');
            fecha.diff(fechasComunas[i - 1]) > 0;
            fecha.add(-1, 'days')) {
            const casosIntermedios = serieRegion[fecha.diff(fechasComunas[0], 'days')].valor
            secuencia = [{
                fecha: fecha.clone(),
                valor: Math.round(arr[i - 1] + (arr[i] - arr[i - 1]) * (casosIntermedios - casosAnteriores) / (casosFecha - casosAnteriores))
              },
              ...secuencia
            ]
          }
        }
        return [...prev, ...secuencia]
      }, [])
    }
  })
  console.log('tf new', Date.now() - ti)
  return seriesComunas
}