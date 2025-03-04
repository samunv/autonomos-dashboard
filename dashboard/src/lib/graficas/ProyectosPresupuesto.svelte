<script>
    import Chart from "chart.js/auto";
    import { onMount, tick } from "svelte";
    import { db } from "../../firebase";
    import { collection, getDocs } from "firebase/firestore";
  
    let chartInstance;
    let proyectosFiltrados = [];
    let estadoSeleccionado = "Finalizado"; // Estado inicial por defecto
    let tipoPresupuesto = "mas"; // 🔼 "mas" = Mayor presupuesto, 🔽 "menos" = Menor presupuesto
  
    async function obtenerProyectosPresupuesto() {
      try {
        console.log(`⏳ Cargando TODOS los proyectos desde Firestore...`);
  
        // 🔥 Obtener TODOS los proyectos sin filtrar en Firestore
        const proyectosSnapshot = await getDocs(collection(db, "proyectos"));
  
        let proyectos = proyectosSnapshot.docs.map(doc => ({
          nombre: doc.data().nombre,
          presupuesto: doc.data().presupuesto,
          estado: doc.data().estado // Traer el estado para filtrar en el código
        }));
  
        // 🔥 Filtrar en código los proyectos con el estado seleccionado
        proyectos = proyectos.filter(proyecto => proyecto.estado === estadoSeleccionado);
  
        // 🔼 🔽 Ordenar por presupuesto según el filtro seleccionado
        if (tipoPresupuesto === "mas") {
          proyectos.sort((a, b) => b.presupuesto - a.presupuesto); // 🔼 Mayor presupuesto
        } else {
          proyectos.sort((a, b) => a.presupuesto - b.presupuesto); // 🔽 Menor presupuesto
        }
  
        // 🔥 Seleccionar solo los 4 proyectos relevantes
        proyectosFiltrados = proyectos.slice(0, 4);
  
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
      if (proyectosFiltrados.length === 0) {
        console.warn("⚠ No hay datos suficientes para la gráfica");
        return;
      }
  
      // 🔵 Tonos azulados basados en #5E81F4
      const coloresAzules = [
        "#5E81F4", // Azul original
        "#3A66F4", // Azul más oscuro
        "#7C97F4", // Azul más claro
        "#A4B4F7"  // Azul aún más suave
      ];
  
      // Crear la gráfica con los datos filtrados
      chartInstance = new Chart(canvas, {
        type: "bar",
        data: {
          labels: proyectosFiltrados.map((p) => p.nombre),
          datasets: [
            {
              label: `Presupuesto (€) - ${estadoSeleccionado} (${tipoPresupuesto === "mas" ? "Más" : "Menos"})`,
              data: proyectosFiltrados.map((p) => p.presupuesto),
              backgroundColor: coloresAzules, // 🔵 Colores azulados
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: { 
              beginAtZero: true,
              suggestedMax: Math.max(...proyectosFiltrados.map((p) => p.presupuesto), 0) + 5000 // Ajuste dinámico del eje Y
            },
          },
        },
      });
    }
  
    // Ejecutar la consulta cuando se monta el componente
    onMount(obtenerProyectosPresupuesto);
  
    // Función para cambiar el estado y actualizar la gráfica
    function cambiarEstado(event) {
      estadoSeleccionado = event.target.value;
      obtenerProyectosPresupuesto(); // Recargar los datos con el nuevo estado
    }
  
    // Función para cambiar entre "más presupuesto" y "menos presupuesto"
    function cambiarTipoPresupuesto(event) {
      tipoPresupuesto = event.target.value;
      obtenerProyectosPresupuesto(); // Recargar los datos con el nuevo filtro
    }
  </script>
  
  <!-- Contenedor de filtros -->
  <div class="filter-container">
    <label for="tipoPresupuesto">Mostrar:</label>
    <select id="tipoPresupuesto" bind:value={tipoPresupuesto} on:change={cambiarTipoPresupuesto}>
      <option value="mas">Proyectos con más presupuesto</option>
      <option value="menos">Proyectos con menos presupuesto</option>
    </select>
  
    <label for="estado">Filtrar por estado:</label>
    <select id="estado" bind:value={estadoSeleccionado} on:change={cambiarEstado}>
      <option value="Finalizado">Finalizado</option>
      <option value="Sin Comenzar">Sin Comenzar</option>
      <option value="En Curso">En Curso</option>
    </select>
  </div>
  
  <!-- Gráfico de barras -->
  <canvas id="chartCanvas"></canvas>
  
  <style>
    .filter-container {
      margin: 20px 0;
      text-align: center;
      display: flex;
      justify-content: center;
      gap: 15px;
    }
  
    select {
      padding: 5px;
      font-size: 16px;
    }
  </style>
  