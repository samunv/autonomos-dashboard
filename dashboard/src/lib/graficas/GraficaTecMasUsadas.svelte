<script>
  import Chart from "chart.js/auto";
  import { onMount, tick } from "svelte";
  import { db } from "../../firebase";
  import { collection, getDocs } from "firebase/firestore";

  let chartInstance;
  let topTecnologias = [];
  let tecnologias = [];
  let chartType = "pie";

  let tecnologiasConIcono = [];

  $: tecnologiasConIcono = topTecnologias
  .map(({ nombre, cantidad, porcentaje }) => {
    const tecnologia = tecnologias.find((t) => t.nombre === nombre);
    return tecnologia
      ? { nombre, cantidad, porcentaje, icono: tecnologia.icono }
      : { nombre, cantidad, porcentaje, icono: "" };
  })
  .slice(0, 7);


  async function obtenerTecnologias() {
    const tecnologiasSnapshot = await getDocs(collection(db, "tecnologias"));
    tecnologias = tecnologiasSnapshot.docs.map((doc) => doc.data());
    console.log("Tecnologías encontradas:", tecnologias);
  }

  async function obtenerTopTecnologias() {
    try {
      console.log("Cargando datos desde Firestore...");

      const proyectosSnapshot = await getDocs(collection(db, "proyectos"));
      let tecnologiaCount = {};

      proyectosSnapshot.forEach((doc) => {
        let tecnologias = doc.data().tecnologias;

        tecnologias.forEach((tecnologia) => {
          tecnologiaCount[tecnologia] = (tecnologiaCount[tecnologia] || 0) + 1;
        });
      });

      let totalUsos = Object.values(tecnologiaCount).reduce((sum, value) => sum + value, 0);
      
      topTecnologias = Object.entries(tecnologiaCount)
        .sort((a, b) => b[1] - a[1])
        .map(([nombre, cantidad]) => ({ nombre, cantidad, porcentaje: ((cantidad / totalUsos) * 100).toFixed(2) }));

      await tick();
      renderChart();
    } catch (error) {
      console.error("❌ Error al obtener datos de Firestore:", error);
    }
  }

  function renderChart() {
    let canvas = document.getElementById("chartCanvas");

    if (!canvas) {
      console.error("No se encontró el canvas en el DOM");
      return;
    }

    if (chartInstance) {
      chartInstance.destroy();
    }

    if (topTecnologias.length === 0) {
      console.warn("No hay datos suficientes para la gráfica");
      return;
    }

    chartInstance = new Chart(canvas, {
      type: chartType,
      data: {
        labels: topTecnologias
          .map((tec) => `${tec.nombre} (${tec.porcentaje}%)`)
          .slice(0, 4),
        datasets: [
          {
            label: "Porcentaje de uso",
            data: topTecnologias.map((t) => t.porcentaje).slice(0, 4),
            backgroundColor: ["#5e81f4", "#1d4ed8", "#60a5fa", "#0f172a"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
  }

  function toggleChartType() {
    chartType = chartType === "pie" ? "bar" : "pie";
    renderChart();
  }

  onMount(async () => {
    await obtenerTecnologias();
    await obtenerTopTecnologias();
  });
</script>

<div class="contenedor-conjunto">
  <div class="contenedor-top-tecnologias">
    <h1 class="titulo-top-tecnologias">Top 7 Tecnologías</h1>
    {#each tecnologiasConIcono as { nombre, cantidad, icono, porcentaje }, index}
      <div class="tecnologia-item">
        <p class="indice-posicion">{index + 1}</p>
        {#if icono}
          <img src={icono} alt="{nombre} icono" class="icono-tecnologia" />
        {/if}
        <p class="nombre-tecnologia">{nombre} - {porcentaje}% </p>
      </div>
    {/each}
    <button class="toggle-button" on:click={toggleChartType}>
      Cambiar a {chartType === "pie" ? "Barras" : "Circular"}
    </button>
  </div>
  <div class="columna-responsive">
    <canvas id="chartCanvas"></canvas>
  </div>
</div>

<style>
  .indice-posicion {
    color: white;
    padding: 5px;
    border-radius: 50%;
    background-color: #5e81f4;
    font-weight: bold;
    font-size: 18px;
    margin-right: 5px;
    width: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .contenedor-conjunto {
    display: flex;
    align-items: stretch;
    justify-content: center;
    gap: 30px;
  }

  .columna-responsive {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 500px;
  }

  .contenedor-top-tecnologias {
    padding: 20px;
    background-color: #e8eeff;
    border-radius: 5px;
    flex: 0 0 250px;
    display: flex;
    flex-direction: column;
  }
  .titulo-top-tecnologias {
    color: #5e81f4;
    font-size: 25px;
  }

  .icono-tecnologia {
    object-fit: contain;
    width: 25px;
    height: 25px;
  }

  .tecnologia-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 10px;
    gap: 5px;
  }

  .toggle-button {
    margin-top: 15px;
    padding: 10px;
    border: none;
    background-color: #5e81f4;
    color: white;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
  }

  .toggle-button:hover {
    background-color: #3b5998;
  }
</style>
