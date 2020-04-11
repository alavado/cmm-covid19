import { CAMBIAR_FECHA } from "./actionTypes";

export const fijarDia = dia => ({
  type: CAMBIAR_FECHA,
  payload: Number(dia)
})