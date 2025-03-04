<script>
    import Chart from "chart.js/auto";
    import { onMount, tick } from "svelte";
    import { db } from "../../firebase";
    import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
  
    let chartInstance;
    let topProyectos = [];
  
    async function obtenerTopProyectos() {
      try {
        console.log("⏳ Cargando proyectos con mayor presupuesto desde Firestore...");
  
        // Obtener los proyectos ordenados por presupuesto en orden descendente
        const proyectosQuery = query(collection(db, "proyectos"), orderBy("presupuesto", "desc"), limit(4));
        const proyectosSnapshot = await getDocs(proyectosQuery);
  
        // Almacenar los datos en topProyectos
        topProyectos = proyectosSnapshot.docs.map((doc) => ({
          nombre: doc.data().nombre,
          presupuesto: doc.data().presupuesto,
        }));
  
        // Esperar a que el DOM esté listo antes de renderizar la gráfica
        await tick();
        renderChart();
      } catch (error) {
        console.error("❌ Error al obtener proyectos de Firestore:", error);
      }
    }
  
    function renderChart() {
      let canvas = document.getElementById("chartCanvas");
  
      if (!canvas) {
        console.error("⚠ No se encontró el canvas en el DOM");
        return;
      }
  
      // 🔥 Destruir la instancia previa del gráfico si existe
      if (chartInstance) {
        chartInstance.destroy();
      }
  
      // Verificar si hay datos para graficar
      if (topProyectos.length === 0) {
        console.warn("⚠ No hay datos suficientes para la gráfica");
        return;
      }
  
      // Crear la gráfica con los datos reales
      chartInstance = new Chart(canvas, {
        type: "bar",
        data: {
          labels: topProyectos.map((p) => p.nombre),
          datasets: [
            {
              label: "Presupuesto (€)",
              data: topProyectos.map((p) => p.presupuesto),
              backgroundColor: ["#f47c7c", "#7cf4a5", "#7cbff4", "#f4e87c"], // 🔥 Colores distintos para cada barra
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: { 
              beginAtZero: true,
              suggestedMax: Math.max(...topProyectos.map((p) => p.presupuesto)) + 5000 // 🔥 Ajusta dinámicamente el eje Y
            },
          },
        },
      });
    }
  
    onMount(obtenerTopProyectos);
  </script>
  
  <canvas id="chartCanvas"></canvas>
  