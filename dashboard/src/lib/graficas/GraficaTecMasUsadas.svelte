<script>
  import Chart from "chart.js/auto";
  import { onMount, tick } from "svelte";
  import { db } from "../../firebase";
  import { collection, getDocs } from "firebase/firestore";

  let chartInstance;
  let topTecnologias = [];
  let chartType = "bar"; // Estado para cambiar entre "bar" y "pie"

  async function obtenerTopTecnologias() {
    try {
      console.log("📡 Cargando datos desde Firestore...");

      // Obtener todos los proyectos
      const proyectosSnapshot = await getDocs(collection(db, "proyectos"));
      let tecnologiaCount = {};

      // Contar la cantidad de veces que aparece cada tecnología
      proyectosSnapshot.forEach((doc) => {
        let tecnologias = doc.data().tecnologias || []; // Obtener array de tecnologías

        tecnologias.forEach((tecnologia) => {
          tecnologiaCount[tecnologia] = (tecnologiaCount[tecnologia] || 0) + 1;
        });
      });

      // Ordenar por frecuencia y obtener las 4 más utilizadas
      topTecnologias = Object.entries(tecnologiaCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }));

      // Esperar a que el DOM esté listo antes de renderizar la gráfica
      await tick();
      renderChart();
    } catch (error) {
      console.error("❌ Error al obtener datos de Firestore:", error);
    }
  }

  function renderChart() {
    let canvas = document.getElementById("chartCanvas");

    if (!canvas) {
      console.error("⚠ No se encontró el canvas en el DOM");
      return;
    }

    //  Destruir la instancia previa del gráfico si existe
    if (chartInstance) {
      chartInstance.destroy();
    }

    // Verificar si hay datos para graficar
    if (topTecnologias.length === 0) {
      console.warn("⚠ No hay datos suficientes para la gráfica");
      return;
    }

    // Crear la gráfica con el tipo seleccionado
    chartInstance = new Chart(canvas, {
      type: chartType, // Puede ser "bar" o "pie"
      data: {
        labels: topTecnologias.map((t) => t.nombre),
        datasets: [
          {
            label: "Cantidad de Uso",
            data: topTecnologias.map((t) => t.cantidad),
            backgroundColor: ["#5e81f4", "#f4a05e", "#f45e5e", "#5ef47a"], // Azul, Naranja, Rojo, Verde
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: chartType === "bar" ? { y: { beginAtZero: true } } : {}, // Quita escalas en "pie"
      },
    });
  }

  function toggleChartType(event) {
    chartType = event.target.checked ? "pie" : "bar"; // Si el checkbox está marcado, usa "pie"
    renderChart();
  }

  onMount(obtenerTopTecnologias);
</script>

<!-- Checkbox para cambiar entre Barra y Pastel -->
<div class="toggle-container">
  <label>
    <input type="checkbox" on:change={toggleChartType} />
    Mostrar en formato Pastel (Pie)
  </label>
</div>

<!-- Gráfico -->
<div class="contenedor-grafica">
  <h3>Principales Tecnologías Utilizadas</h3>
  <canvas id="chartCanvas"></canvas>
</div>

<style>
  .toggle-container {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
  }

  .contenedor-grafica {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80%;
    margin: auto;
  }

  canvas {
    max-width: 600px;
  }

  h3 {
    text-align: center;
    color: #5e81f4;
  }
</style>
