<script>
  import { graficaFiltrada } from "../store";
  import GraficaFacturasCyV from "./graficas/GraficaFacturasCyV.svelte";
  import GraficaTecMasUsadas from "./graficas/GraficaTecMasUsadas.svelte";
  import GraficaTecMenosUsadas from "./graficas/GraficaTecMenosUsadas.svelte";
  import ProyectosConMasPresupuesto from "./graficas/ProyectosConMasPresupuesto.svelte";
</script>

<section class="contenedor-principal">
  <div class="contenedor-grafica">
    {#if $graficaFiltrada["GraficaTecMasUsadas"]}
      <GraficaTecMasUsadas />
    {:else if $graficaFiltrada["GraficaTecMenosUsadas"]}
      <GraficaTecMenosUsadas />
    {:else if $graficaFiltrada["GraficaProyectosMasPresupuesto"]}
      <ProyectosConMasPresupuesto />
    {:else if $graficaFiltrada["GraficaFacturasCyV"]}
      <GraficaFacturasCyV />
    {:else}
      <div class="no-grafica-seleccionada">
        <p>
          No hay ningún filtro marcado. Selecciona alguno para mostrar su
          gráfica.
        </p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="black"
          ><path
            d="M160-200h160v-320H160v320Zm240 0h160v-560H400v560Zm240 0h160v-240H640v240ZM80-120v-480h240v-240h320v320h240v400H80Z"
          /></svg
        >
      </div>
    {/if}
  </div>
</section>

<style>
  .contenedor-principal {
    background-color: white;
    padding: 30px;
    border-radius: 12px;
    height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .contenedor-grafica {
    height: 90%;

    display: flex;
    justify-content: center;
  }

  .no-grafica-seleccionada {
    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;
  }

  .no-grafica-seleccionada svg {
    fill: #c1c1c1;
    width: 100px;
    height: 100px;
    margin-top: 20px;
  }
</style>
