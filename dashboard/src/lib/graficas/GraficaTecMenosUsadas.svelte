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

      // Obtener todos los proyectos desde Firestore
      const proyectosSnapshot = await getDocs(collection(db, "proyectos"));
      let tecnologiaCount = {};

      // Recorrer los proyectos y contar cuántas veces aparece cada tecnología
      proyectosSnapshot.forEach((doc) => {
        let tecnologias = doc.data().tecnologias || []; // Asegurar que siempre sea un array

        tecnologias.forEach((tecnologia) => {
          tecnologiaCount[tecnologia] = (tecnologiaCount[tecnologia] || 0) + 1;
        });
      });

      //  Obtener exactamente los mismos datos que en la gráfica de más utilizadas
      let tecnologiasOrdenadas = Object.entries(tecnologiaCount).sort(
        (a, b) => b[1] - a[1]
      ); //  Primero ordenar de mayor a menor (igual que en la otra gráfica)

      //  Invertir los datos para mostrarlos de menor a mayor
      topTecnologias = tecnologiasOrdenadas
        .reverse() // Invierte el array
        .slice(0, 4) //  Seleccionar las 4 menos utilizadas
        .map(([nombre, cantidad]) => ({ nombre, cantidad }));

      // Esperar a que el DOM esté listo antes de renderizar la gráfica
      await tick();
      renderChart();
    } catch (error) {
      console.error(" Error al obtener datos de Firestore:", error);
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
    // @ts-ignore
    chartInstance = new Chart(canvas, {
      type: "bar",
      data: {
        labels: topTecnologias.map((t) => t.nombre),
        datasets: [
          {
            label: "Cantidad de Uso",
            data: topTecnologias.map((t) => t.cantidad),
            backgroundColor: ["#f47c7c"], //Color rojo claro para diferenciarlo
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 2, // Fija el eje Y para que llegue hasta 2
          },
        },
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
