import React from 'react'
import './RankingComunas.css'
import { useSelector } from 'react-redux'
import { CASOS_COMUNALES_POR_100000_HABITANTES } from '../../../redux/reducers/series'

const RankingComunas = () => {

  const { series, posicion } = useSelector(state => state.series)
  const serieComunas = series.find(({ id }) => id === CASOS_COMUNALES_POR_100000_HABITANTES)

  console.log({serieComunas})

  return (
    <div className="RankingComunas">
      <h1 className="RankingComunas__titulo">Comunas con más casos</h1>
    </div>
  )
}

export default RankingComunas
