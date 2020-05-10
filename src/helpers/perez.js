import demografiaRegiones from '../data/demografia/regiones.json'
import demografiaComunas from '../data/demografia/comunas.json'
import moment from 'moment/min/moment-with-locales'
import polylabel from 'polylabel'

const calcularPoloDeInaccesibilidad = ({ coordinates: puntos }) => {
  const [longitude, latitude] = polylabel(puntos)
  return { longitude: longitude, latitude: latitude }
}

const formatearDatosRegion = csv => {
  let filas = csv.split('\n')
  const fechas = filas[0].split(',').slice(2).map(fecha => moment(fecha, 'MM/DD/YYYY'))
  if (filas.slice(-1)[0].trim() === '') {
    filas = filas.slice(0, -1)
  }
  return filas
    .slice(1)
    .map(fila => fila.split(','))
    .map(fila => {
      const codigo = Number(fila[0])
      const nombre = demografiaRegiones.find(r => Number(r.codigo) === codigo).nombre
      return {
        codigo,
        nombre,
        datos: fila
          .slice(2)
          .map(Number)
          .reduce((prev, x, i, arr) => {
            return i > 0 ?
              [...prev, { fecha: fechas[i], valor: Math.max(0, x - arr[i - 1]) }] :
              [{ fecha: fechas[0], valor: x }]
          }, [])
          .slice(1)
      }
    })
}

const obtenerCasosRegionalesPorHabitantes = (region, habitantes) => {
  const { poblacion } = demografiaRegiones.find(r => Number(r.codigo) === region.codigo)
    return {
      ...region,
      datos: region.datos.map(r => ({ ...r, valor: Math.round(100 * r.valor * habitantes / poblacion) / 100 }))
    }
}
const formatearDatosOriginalesRegiones = csv => {
  let filas = csv.split('\n')
  const fechas = filas[0].split(',').slice(2).map(fecha => moment(fecha, 'MM/DD/YYYY'))
  if (filas.slice(-1)[0].trim() === '') {
    filas = filas.slice(0, -1)
  }
  return filas
    .slice(1)
    .map(fila => fila.split(','))
    .map(fila => {
      const codigo = Number(fila[0])
      const nombre = demografiaRegiones.find(r => Number(r.codigo) === codigo).nombre
      return {
        codigo,
        nombre,
        datos: fila
          .slice(2)
          .map((x, i) => ({
            fecha: fechas[i],
            valor: isNaN(x) ? 0 : Number(x)
          }))
      }
    })
}

export const procesarRegiones = async (csv, geoJSON) => {
  let casosPorRegion = formatearDatosRegion(csv)
  let casosPor100000Habitantes = casosPorRegion.map(region => obtenerCasosRegionalesPorHabitantes(region, 100000))
  const poblacionChile = demografiaRegiones.reduce((suma, { poblacion }) => suma + Number(poblacion), 0)
  const datosChile = casosPorRegion
    .reduce((prev, { datos }) => ({
      ...prev,
      datos: prev.datos.map((v, i) => ({ ...v, valor: v.valor + datos[i].valor }))
    }))
    .datos.map(v => ({ ...v, valor: (100000.0 * v.valor) / poblacionChile }))
  casosPor100000Habitantes = [...casosPor100000Habitantes, {
    codigo: 0,
    nombre: 'Chile',
    datos: datosChile
  }]
  const geoJSONConDatos = {
    ...geoJSON,
    features: geoJSON.features.map(region => {
      const id = Number(region.properties.codregion)
      const { datos: datosRegion } = casosPor100000Habitantes.find(({ codigo }) => codigo === id)
      if (!datosRegion) {
        return {}
      }
      return {
        ...region,
        properties: {
          ...region.properties,
          nombre: region.properties.Region,
          codigo: Number(region.properties.codregion),
          codigoRegion: Number(region.properties.codregion),
          ...datosRegion.reduce((prev, d, i) => ({...prev, [`v${i}`]: d.valor }), {})
        }
      }
    })
  }
  return [casosPor100000Habitantes, geoJSONConDatos, formatearDatosOriginalesRegiones(csv)]
}

//.map((val, i) => ({ fecha: fechas[i], valor: isNaN(val) ? -1 : Number(val) }))
const formatearDatosComuna = csv => {
  let filas = csv.split('\n')
  const fechas = filas[0].split(',').slice(4).map(fecha => moment(fecha, 'MM/DD/YYYY'))
  if (filas.slice(-1)[0].trim() === '') {
    filas = filas.slice(0, -1)
  }
  return filas
    .slice(1)
    .map(fila => fila.split(','))
    .map(fila => {
      const codigoRegion = Number(fila[0])
      const codigo = Number(fila[2])
      const nombre = demografiaComunas.find(r => Number(r.codigo) === codigo).nombre
      return {
        codigo,
        nombre,
        codigoRegion,
        datos: fila
          .slice(4)
          .map(x => isNaN(x) ? 0 : Number(x))
          .reduce((prev, x, i, arr) => {
            const diasDiferencia = fechas[i].diff(fechas[i - 1], 'days')
            return i > 0 ?
              [...prev, { fecha: fechas[i], valor: Math.max(0, (x - arr[i - 1]) / diasDiferencia) }] :
              [{ fecha: fechas[0], valor: x }]
          }, [])
          .slice(1)
      }
    })
}

const obtenerCasosComunalesPorHabitantes = (comuna, habitantes) => {
  const { poblacion } = demografiaComunas.find(c => Number(c.codigo) === comuna.codigo)
  return {
    ...comuna,
    datos: comuna.datos.map(d => d.valor < 0 ? d : ({ ...d, valor: Math.round(100 * d.valor * habitantes / poblacion) / 100 }))
  }
}

const formatearDatosOriginalesComunas = csv => {
  let filas = csv.split('\n')
  const fechas = filas[0].split(',').slice(4).map(fecha => moment(fecha, 'MM/DD/YYYY'))
  if (filas.slice(-1)[0].trim() === '') {
    filas = filas.slice(0, -1)
  }
  return filas
    .slice(1)
    .map(fila => fila.split(','))
    .map(fila => {
      const codigoRegion = Number(fila[0])
      const codigo = Number(fila[2])
      const nombre = demografiaComunas.find(r => Number(r.codigo) === codigo).nombre
      return {
        codigo,
        nombre,
        codigoRegion,
        datos: fila
          .slice(4)
          .map((x, i) => ({
            fecha: fechas[i],
            valor: isNaN(x) ? 0 : Number(x)
          }))
          .slice(1)
      }
    })
}

export const procesarComunas = async (csv, geoJSON) => {
  let casosPorComuna = formatearDatosComuna(csv)
  let casosPor100000Habitantes = casosPorComuna.map(comuna => obtenerCasosComunalesPorHabitantes(comuna, 100000))
  const geoJSONConDatos = {
    ...geoJSON,
    features: geoJSON.features.map(feature => {
      const id = Number(feature.properties.COD_COMUNA)
      const x = casosPor100000Habitantes.find(({ codigo }) => codigo === id)
      if (!x) {
        return {}
      }
      const datosFeature = x.datos
      return {
        ...feature,
        properties: {
          ...feature.properties,
          nombre: feature.properties.NOM_COM,
          codigo: Number(feature.properties.COD_COMUNA),
          codigoRegion: Number(x.codigoRegion),
          ...datosFeature.reduce((prev, d, i) => ({...prev, [`v${i}`]: d.valor }), {})
        }
      }
    })
  }
  return [casosPor100000Habitantes, geoJSONConDatos, formatearDatosOriginalesComunas(csv)]
}

export const interpolarComunas = async (datosComunales, datosRegionales, geoJSONComunas) => {
  datosComunales = datosComunales.map(comuna => ({
    ...comuna,
    datos: [
      {
        fecha: datosRegionales[0].datos[0].fecha.clone(),
        valor: 0
      },
      ...comuna.datos
    ]
  }))
  const fechasDatosComunas = datosComunales[0].datos.map(d => d.fecha)
  const aumentoRegional = datosRegionales.map(region => ({
    ...region,
    datos: region.datos
      .filter(d => fechasDatosComunas.some(f => f.diff(d.fecha, 'days') === 0))
      .map((d, i, arr) => ({
        ...d,
        valor: i > 0 ? Math.max(d.valor - arr[i - 1].valor, 0) : 0
      }))
  }))
  datosComunales = datosComunales.map(comuna => {
    const aumentoRegion = aumentoRegional.find(({ codigo }) => codigo === comuna.codigoRegion)
    return {
      ...comuna,
      datos: comuna.datos.map((d, i, arr) => {
        const aumentoComunaFecha = d.valor - arr[Math.max(0, i - 1)].valor
        const aumentoRegionFecha = aumentoRegion.datos[i].valor
        return {
          ...d,
          aumentoRegionFecha,
          aumentoComunaFecha,
          factorFecha: aumentoRegionFecha > 0 ? (1.0 * aumentoComunaFecha / aumentoRegionFecha) : 0
        }
      })
    }
  })
  const datosComunalesInterpolados = datosComunales.map(comuna => ({
    ...comuna,
    datos: datosRegionales
      .find(({ codigo }) => codigo === comuna.codigoRegion)
      .datos
      .reduce(({ indiceDatosComunales: idc, datos: prev, acum }, { fecha }, i) => {
        const datosRegion = datosRegionales
            .find(({ codigo }) => codigo === comuna.codigoRegion)
        const aumentoRegion = datosRegion.datos[i].valor - datosRegion.datos[Math.max(0, i - 1)].valor
        if (idc < comuna.datos.length && comuna.datos[idc].fecha.diff(fecha, 'days') === 0) {
          return {
            indiceDatosComunales: idc + 1,
            acum: 0,
            datos: [...prev, {
              ...comuna.datos[idc],
              interpolado: false
            }]
          }
        }
        else if (idc >= comuna.datos.length) {
          return {
            indiceDatosComunales: idc,
            acum: acum + aumentoRegion,
            datos: [...prev, {
              fecha,
              valor: comuna.datos[idc - 1].valor + (acum + aumentoRegion) * comuna.datos[idc - 1].factorFecha,
              interpolado: true
            }]
          }
        }
        else {
          const muestraAnterior = comuna.datos[Math.max(0, idc - 1)]
          const muestraSiguiente = comuna.datos[Math.min(idc, comuna.datos.length - 1)]
          const regionEnFechaAnterior = datosRegion.datos.find(v => v.fecha.diff(muestraAnterior.fecha, 'days') === 0)
          const regionEnFechaSiguiente = datosRegion.datos.find(v => v.fecha.diff(muestraSiguiente.fecha, 'days') === 0)
          const aumentoTotalRegion = regionEnFechaSiguiente.valor - regionEnFechaAnterior.valor
          const proporcion = aumentoRegion / (aumentoTotalRegion === 0 ? 1 : aumentoTotalRegion)
          const aumentoComuna = proporcion * (muestraSiguiente.valor - muestraAnterior.valor)
          return {
            indiceDatosComunales: idc,
            acum: acum + aumentoComuna,
            datos: [...prev, {
              fecha,
              valor: muestraAnterior.valor + acum + aumentoComuna,
              interpolado: true
            }]
          }
        }
      }, { indiceDatosComunales: 0, acum: 0, datos: [] }).datos
  }))
  const datosComunalesInterpoladosNormalizados = datosComunalesInterpolados.map(comuna => {
    const { poblacion } = demografiaComunas.find(c => Number(c.codigo) === comuna.codigo)
    return {
      ...comuna,
      datos: comuna.datos.map(d => ({
        ...d,
        valorNormalizado: d.valor * 1e5 / poblacion
      }))
    }
  })
  const aumentoComunal = datosComunalesInterpoladosNormalizados.map(comuna => ({
    ...comuna,
    datos: comuna.datos
      .map((d, i, arr) => ({
        ...d,
        valor: i > 0 ? Math.max(d.valorNormalizado - arr[i - 1].valorNormalizado, 0) : 0
      }))
  }))
  const geoJSONConDatos = {
    ...geoJSONComunas,
    features: geoJSONComunas.features.map(feature => {
      const id = Number(feature.properties.COD_COMUNA)
      const x = aumentoComunal.find(({ codigo }) => codigo === id)
      if (!x) {
        return {}
      }
      const datosFeature = x.datos
      return {
        ...feature,
        properties: {
          ...feature.properties,
          nombre: feature.properties.NOM_COM,
          codigo: Number(feature.properties.COD_COMUNA),
          codigoRegion: Number(x.codigoRegion),
          ...datosFeature.reduce((prev, d, i) => ({...prev, [`v${i}`]: d.valor }), {})
        }
      }
    })
  }
  return [aumentoComunal, geoJSONConDatos, datosComunalesInterpolados]
}