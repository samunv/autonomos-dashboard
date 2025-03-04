import { writable } from "svelte/store";

export let textoFiltro = writable("‎");

  // Definir el writable con un objeto asociativo
  export const graficaFiltrada = writable({
    "GraficaTecMasUsadas": false,
    "GraficaTecMenosUsadas": false,
    "GraficaFacturasCyV": false,
    "GraficaProyectosPresupuesto" : false,
    "GraficaComparacion" : false
  });