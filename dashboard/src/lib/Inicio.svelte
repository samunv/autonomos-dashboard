<script>
  import Filtros from "./Filtros.svelte";
  import Header from "./Header.svelte";
  import Principal from "./Principal.svelte";

  import { textoFiltro } from "../store";
  import { fade } from "svelte/transition";
</script>

<Header />
<section class="seccion-cuerpo">
  <div class="columna-uno">
    <h1 class="titulos">Filtros</h1>
    <Filtros />
  </div>

  <div class="columna-dos">
    <h1 class="titulos" transition:fade={{ duration: 1000 }}>{$textoFiltro}</h1>
    <Principal />
  </div>
</section>

<style>
  .seccion-cuerpo {
    padding: 20px;
    padding-left: 30px;
    padding-right: 30px;
    height: calc(100vh - 100px);
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .titulos {
    margin-bottom: 10px;
  }

  .columna-uno {
    width: 40vw;
  }
  .columna-dos {
    width: 100vw;
  }
</style>
