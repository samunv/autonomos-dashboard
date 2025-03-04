<script>
  import { textoFiltro, graficaFiltrada } from "../store";

  function actualizarTextoFiltro(texto) {
    textoFiltro.set(texto);
  }

  // Función para activar solo una clave y desactivar las demás
  function activarGrafica(grafica) {
    graficaFiltrada.update(() => {
      let newState = {
        GraficaTecMasUsadas: false,
        GraficaTecMenosUsadas: false,
        GraficaProyectosMasPresupuesto: false,
        GraficaProyectosMenosPresupuesto: false,
        GraficaFacturasCyV: false,
        GraficaComparacion: false,
      };
      newState[grafica] = true; // Solo una clave en true
      return newState;
    });
  }
</script>

<section class="contenedor-filtros">
  <div class="filtros proyectos-facturas">
    <h3>Proyectos</h3>
    <ul>
      <li
        on:click={() => {
          actualizarTextoFiltro("Proyectos con más presupuesto"),
            activarGrafica("GraficaProyectosMasPresupuesto");
        }}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" />
        </svg>Proyectos con más presupuesto
      </li>
      <li
      on:click={() => {
        actualizarTextoFiltro("Proyectos con menos presupuesto"),
          activarGrafica("GraficaProyectosMenosPresupuesto");
      }}
    >
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" />
    </svg>Proyectos con menos presupuesto
  </li>
    </ul>
</div>
  <div class="filtros proyectos-facturas">
      <h3>Facturas</h3>
      <ul>
      <li
        on:click={() => {
          actualizarTextoFiltro("Facturas de Ventas"),
            activarGrafica("GraficaFacturasCyV");
        }}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" />
        </svg>Facturas con mayor Total
      </li>
  </ul>
  </div>

  <div class="filtros tecnologias">
    <h3>Tecnologías en Proyectos</h3>
    <ul>
      <li
        on:click={() => {
          actualizarTextoFiltro("Tecnologías más utilizadas"),
            activarGrafica("GraficaTecMasUsadas");
        }}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" />
        </svg>Más Utilizadas
      </li>
      <li
        on:click={() => {
          actualizarTextoFiltro("Tecnologías menos utilizadas"),
            activarGrafica("GraficaTecMenosUsadas");
        }}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" />
        </svg>Menos Utilizadas
      </li>
    </ul>
  </div>


  <div class="filtros provedor-cliente">
    <h3>Proveedores y Clientes.</h3>
    <ul>
      <li
        on:click={() => {
          actualizarTextoFiltro("Proveedores y clientes"),
            activarGrafica("GraficaComparacion");
        }}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" />
        </svg>Comparación Facturado y Ingresos
      </li>


</section>



<style>
  .filtros {
    margin-bottom: 30px;
    width: 80%;
    margin-left: auto;
    margin-right: auto;
  }
  .filtros ul li {
    list-style: none;
    margin-top: 3px;
    margin-bottom: 3px;
    padding: 10px;
    transition: all 0.3s ease;
    border-radius: 5px;
    cursor: pointer;
    color: #8181a5;
    fill: #8181a5;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .filtros ul li svg {
    width: 13px;
    height: 13px;
    margin-right: 5px;
  }

  .filtros ul li:hover {
    background-color: #e8eeff;
    color: #5e81f4;
    fill: #5e81f4;
  }

  .contenedor-filtros {
    background-color: white;
    border-radius: 12px;
    height: 70vh;
    margin-right: 30px;
    padding: 30px 0px;
  }
</style>
