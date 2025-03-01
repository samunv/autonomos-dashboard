<script>
  import { backIn } from "svelte/easing";
  import { textoFiltro } from "../store";

  function actualizarTextoFiltro(texto) {
    textoFiltro.set(texto);
  }
</script>

<section class="contenedor-filtros">
  <div class="filtros proyectos-facturas">
    <h3>Proyectos y Facturas</h3>
    <ul>
      <li
        on:click={() => actualizarTextoFiltro("Proyectos con más presupuesto")}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" />
        </svg>Proyectos con más presupuesto
      </li>
      <li
        on:click={() => actualizarTextoFiltro("Facturas de Compras y Ventas")}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" />
        </svg>Facturas de compras y ventas
      </li>
    </ul>
  </div>

  <div class="filtros tecnologias">
    <h3>Tecnologías</h3>
    <ul>
      <li on:click={() => actualizarTextoFiltro("Tecnologías más utilizadas")}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" />
        </svg>Más Utilizadas
      </li>
      <li
        on:click={() => actualizarTextoFiltro("Tecnologías menos utilizadas")}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" />
        </svg>Menos Utilizadas
      </li>
    </ul>
  </div>
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
