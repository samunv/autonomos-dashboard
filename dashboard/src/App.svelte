<script>
  import { Router, Route } from "svelte-routing";
  import Inicio from "./lib/Inicio.svelte";
  import Perfil from "./lib/Perfil.svelte";
</script>

<div>
<Inicio />
  <Router>
    <Route path="/" component={Inicio} />
    <Route path="/perfil" component={Perfil} />
  </Router>
</div>
