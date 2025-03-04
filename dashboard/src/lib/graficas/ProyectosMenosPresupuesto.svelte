<script>
    import Chart from "chart.js/auto";
    import { onMount, tick } from "svelte";
    import { db } from "../../firebase";
    import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
  
    let chartInstance;
    let proyectosMenosPresupuesto = [];
  
    async function obtenerProyectosMenosPresupuesto() {
      try {
        console.log(" Cargando proyectos con menor presupuesto desde Firestore...");
  
        // Obtener los proyectos ordenados por presupuesto en orden ascendente (menor a mayor)
        const proyectosQuery = query(collection(db, "proyectos"), orderBy("presupuesto", "asc"), limit(4));
        const proyectosSnapshot = await getDocs(proyectosQuery);
  
        // Almacenar los datos en proyectosMenosPresupuesto
        proyectosMenosPresupuesto = proyectosSnapshot.docs.map((doc) => ({
          nombre: doc.data().nombre,
          presupuesto: doc.data().presupuesto,
        }));
  
        // Esperar a que el DOM esté listo antes de renderizar la gráfica
        await tick();
        renderChart();
      } catch (error) {
        console.error(" Error al obtener proyectos de Firestore:", error);
      }
    }
  
    function renderChart() {
      let canvas = document.getElementById("chartCanvasMenos");
  
      if (!canvas) {
        console.error(" No se encontró el canvas en el DOM");
        return;
      }
  
      // Destruir la instancia previa del gráfico si existe
      if (chartInstance) {
        chartInstance.destroy();
      }
  
      // Verificar si hay datos para graficar
      if (proyectosMenosPresupuesto.length === 0) {
        console.warn(" No hay datos suficientes para la gráfica");
        return;
      }
  
      // Crear la gráfica con los datos reales
      chartInstance = new Chart(canvas, {
        type: "bar",
        data: {
          labels: proyectosMenosPresupuesto.map((p) => p.nombre),
          datasets: [
            {
              label: "Presupuesto (€)",
              data: proyectosMenosPresupuesto.map((p) => p.presupuesto),
              backgroundColor: ["#f4a261", "#2a9d8f", "#e76f51", "#264653"], // Diferentes colores para cada barra
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: { 
              beginAtZero: true,
              suggestedMax: Math.max(...proyectosMenosPresupuesto.map((p) => p.presupuesto)) + 5000 // Ajuste dinámico del eje Y
            },
          },
        },
      });
    }
  
    onMount(obtenerProyectosMenosPresupuesto);
  </script>
  
  <canvas id="chartCanvasMenos"></canvas>
  