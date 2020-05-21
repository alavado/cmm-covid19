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
            fecha: fechas[i].format('DD/MM')
          }
        })
      }
    })
  return [serieChile, seriesRegiones]
}

export const procesarCSVComunas = (csv, seriesRegiones) => {
  const ti = Date.now()
  const [encabezados, datos] = separarCSVEnFilas(csv)
  const fechaInicial = moment(seriesRegiones[0].serie[0].fecha, 'DD/MM')
  const fechasComunas = [fechaInicial, ...encabezados.slice(4).map(f => moment(f, 'MM/DD/YYYY'))]
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
        let secuencia = [{ fecha: fechasComunas[i].format('DD/MM'), valor }]
        if (i > 0) {
          const indiceEnSerieRegional = fechasComunas[i].diff(fechaInicial, 'days')
          const indiceAnteriorEnSerieRegional = fechasComunas[i - 1].diff(fechaInicial, 'days')
          const casosFecha = serieRegion[indiceEnSerieRegional].valor
          const casosAnteriores = serieRegion[indiceAnteriorEnSerieRegional].valor
          const diferenciaRegion = Math.max(1, casosFecha - casosAnteriores)
          const diferenciaComuna = arr[i] - arr[i - 1]
          for (let j = indiceEnSerieRegional - 1; j > indiceAnteriorEnSerieRegional; j--) {
            const casosIntermedios = serieRegion[j].valor
            secuencia = [
              {
                fecha: fechaInicial.clone().add(j, 'days').format('DD/MM'),
                valor: Math.round(arr[i - 1] + diferenciaComuna * (casosIntermedios - casosAnteriores) / diferenciaRegion)
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