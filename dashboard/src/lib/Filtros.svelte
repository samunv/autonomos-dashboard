<script>
  import { backIn } from "svelte/easing";
</script>

<section class="contenedor-filtros">
  <div class="filtros proyectos-facturas">
    <h3>Proyectos y Facturas</h3>
    <ul>
      <li>Proyectos con más presupuesto</li>
      <li>Facturas de compras y ventas</li>
    </ul>
  </div>

  <div class="filtros tecnologias">
    <h3>Tecnologías</h3>
    <ul>
      <li>Más Utilizadas</li>
      <li>Menos Utilizadas</li>
    </ul>
  </div>
</section>

<style>
  .filtros {
    margin-bottom: 30px;
  }
  .filtros ul li {
    list-style: none;
    margin-top: 3px;
    margin-bottom: 3px;
    padding: 10px;
    transition: all 0.3s ease;
    border-radius: 5px;
    cursor: pointer;
  }
  .filtros ul li:hover {
    background-color: #5e81f4;
    color: white;
  }

  .contenedor-filtros {
    background-color: white;
    padding: 30px;
    border-radius: 12px;
    height: 70vh;
    margin-right: 30px;
  }
</style>
