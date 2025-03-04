import { writable } from "svelte/store";

export let textoFiltro = writable("‎");

  // Definir el writable con un objeto asociativo
  export const graficaFiltrada = writable({
    "GraficaTecMasUsadas": false,
    "GraficaTecMenosUsadas": false,
    "GraficaProyectosMasPresupuesto": false,
    "GraficaFacturasCyV": false,
    "GraficaProyectosMenosPresupuesto" : false
  });