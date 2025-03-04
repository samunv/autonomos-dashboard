<script>
  import Chart from "chart.js/auto";
  import { onMount, tick } from "svelte";
  import { db } from "../../firebase";
  import { collection, getDocs } from "firebase/firestore";

  let chartInstance;
  let lessTecnologias = [];
  let tecnologias = [];
  let chartType = "pie";

  async function obtenerTecnologias() {
    const tecnologiasSnapshot = await getDocs(collection(db, "tecnologias"));
    tecnologias = tecnologiasSnapshot.docs.map((doc) => doc.data());
  }

  async function obtenerPeoresTecnologias() {
    try {
      const proyectosSnapshot = await getDocs(collection(db, "proyectos"));
      let tecnologiaCount = {};

      proyectosSnapshot.forEach((doc) => {
        let tecnologiasUsadas = doc.data().tecnologias;
        tecnologiasUsadas.forEach((tecnologia) => {
          tecnologiaCount[tecnologia] = (tecnologiaCount[tecnologia] || 0) + 1;
        });
      });

      let totalUsos = Object.values(tecnologiaCount).reduce(
        (sum, value) => sum + value,
        0
      );

      let tecnologiasOrdenadas = Object.entries(tecnologiaCount)
        .map(([nombre, cantidad]) => ({
          nombre,
          cantidad,
          porcentaje: ((cantidad / totalUsos) * 100).toFixed(2),
        }))
        .sort((a, b) => a.cantidad - b.cantidad);

      lessTecnologias = tecnologiasOrdenadas
        .slice(0, 5)
        .map(({ nombre, cantidad, porcentaje }) => {
          const tecnologia = tecnologias.find((t) => t.nombre === nombre);
          return {
            nombre,
            cantidad,
            porcentaje,
            icono: tecnologia ? tecnologia.icono : "",
          };
        });

      await tick();
      renderChart();
    } catch (error) {
      console.error("Error al obtener datos de Firestore:", error);
    }
  }

  function renderChart() {
    let canvas = document.getElementById("chartCanvasLess");

    if (!canvas) {
      console.error("No se encontró el canvas en el DOM");
      return;
    }

    if (chartInstance) {
      chartInstance.destroy();
    }

    if (lessTecnologias.length === 0) {
      console.warn("No hay datos suficientes para la gráfica");
      return;
    }

    chartInstance = new Chart(canvas, {
      type: chartType,
      data: {
        labels: lessTecnologias
          .map((tec) => `${tec.nombre} (${tec.porcentaje}%)`).slice(0,4),
        datasets: [
          {
            label: "Porcentaje de uso",
            data: lessTecnologias.map((t) => t.porcentaje),
            backgroundColor: ["#5e81f4", "#3b5998", "#1e3a8a", "#60a5fa"],
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
    await obtenerPeoresTecnologias();
  });
</script>

<div class="contenedor-conjunto">
  <div class="contenedor-top-tecnologias">
    <h1 class="titulo-top-tecnologias">5 Tecnologías Menos Usadas</h1>
    {#each lessTecnologias as { nombre, porcentaje, icono }, index}
      <div class="tecnologia-item">
        <p class="indice-posicion">{index + 1}</p>
        {#if icono}
          <img src={icono} alt="{nombre} icono" class="icono-tecnologia" />
        {/if}
        <p class="nombre-tecnologia">{nombre} - {porcentaje}%</p>
      </div>
    {/each}
    <button class="toggle-button" on:click={toggleChartType}>
      Cambiar a {chartType === "pie" ? "Barras" : "Circular"}
    </button>
  </div>

  <div class="columna-responsive">
    <canvas id="chartCanvasLess"></canvas>
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
    height: 100%;
  }

  .columna-responsive {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 500px;
    max-width: 450px;
    max-height: 450px;
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
