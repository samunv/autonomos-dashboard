<script>
  import Chart from "chart.js/auto";
  import { onMount, tick } from "svelte";
  import { db } from "../../firebase";
  import { collection, getDocs } from "firebase/firestore";

  let chartInstance;
  let topTecnologias = [];

  async function obtenerTopTecnologias() {
    try {
      console.log(" Cargando datos desde Firestore...");

      // Obtener todos los proyectos
      const proyectosSnapshot = await getDocs(collection(db, "proyectos"));
      let tecnologiaCount = {};

      // Contar la cantidad de veces que aparece cada tecnología
      proyectosSnapshot.forEach((doc) => {
        let tecnologias = doc.data().tecnologias; // Obtener array de tecnologías

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
      console.error("Error al obtener datos de Firestore:", error);
    }
  }

  function renderChart() {
    let canvas = document.getElementById("chartCanvas");

    if (!canvas) {
      console.error(" No se encontró el canvas en el DOM");
      return;
    }

    //  Destruir la instancia previa del gráfico si existe
    if (chartInstance) {
      chartInstance.destroy();
    }

    // Verificar si hay datos para graficar
    if (topTecnologias.length === 0) {
      console.warn(" No hay datos suficientes para la gráfica");
      return;
    }

    // Crear la gráfica con los datos reales
    chartInstance = new Chart(canvas, {
      type: "bar",
      data: {
        labels: topTecnologias.map((t) => t.nombre),
        datasets: [
          {
            label: "Cantidad de Uso",
            data: topTecnologias.map((t) => t.cantidad),
            backgroundColor: ["#5e81f4"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

  onMount(obtenerTopTecnologias);
</script>

<canvas id="chartCanvas"></canvas>
