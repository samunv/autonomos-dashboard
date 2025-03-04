<script>
  import Chart from "chart.js/auto";
  import { onMount, tick } from "svelte";
  import { db } from "../../firebase";
  import { collection, getDocs } from "firebase/firestore";

  let chartInstance;
  let topTecnologias = [];

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

      topTecnologias = Object.entries(tecnologiaCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }));

      await tick();
      renderChart();
    } catch (error) {
      console.error("Error al obtener datos de Firestore:", error);
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

    const total = topTecnologias.reduce((sum, t) => sum + t.cantidad, 0);
    const porcentajes = topTecnologias.map((t) =>
      ((t.cantidad / total) * 100).toFixed(2)
    );

    chartInstance = new Chart(canvas, {
      type: "pie",
      data: {
        labels: topTecnologias.map(
          (tec, posicion) => `${tec.nombre} (${porcentajes[posicion]}%)`
        ),
        datasets: [
          {
            data: topTecnologias.map((t) => t.cantidad),
            backgroundColor: ["#5e81f4", "#1d4ed8", "#60a5fa", "#0f172a"]

            ,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
  }

  onMount(obtenerTopTecnologias);
</script>

<div class="columna-responsive">
  <canvas id="chartCanvas"></canvas>
</div>

<style>
  .columna-responsive {
    width: 100%;
    height: 400px;
    display: flex;
    justify-content: center;
  }
</style>
