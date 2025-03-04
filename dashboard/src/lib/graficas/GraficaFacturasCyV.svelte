<script>
  import Chart from "chart.js/auto";
  import { onDestroy, onMount, tick } from "svelte";
  import { db } from "../../firebase";
  import { collection, getDocs } from "firebase/firestore";
  import { textoFiltro } from "../../store";

  let chartInstance;
  let facturas = []; // Guardamos todas las facturas
  let topFacturas = []; // Facturas filtradas a mostrar en la gráfica

  async function obtenerFacturas() {
    try {
      console.log("Cargando datos desde Firestore...");

      const facturasSnapshot = await getDocs(collection(db, "facturas"));
      facturas = facturasSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          total: parseFloat(data.total) || 0, // Parseamos total a número
          tipo: data.tipo || "Desconocido",
        };
      });

      console.log("Facturas cargadas:", facturas);

      // Por defecto, mostramos las de Venta
      filtrarPorTipo("Venta");
    } catch (error) {
      console.error("Error al obtener datos de Firestore:", error);
    }
  }

  function filtrarPorTipo(tipo) {
    topFacturas = facturas
      .filter((factura) => factura.tipo === tipo)
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    console.log(`Top 4 facturas de tipo ${tipo}:`, topFacturas);

    renderChart();
  }

  async function renderChart() {
    await tick();
    let canvas = document.getElementById("chartCanvas");

    if (!canvas) {
      console.error("No se encontró el canvas en el DOM");
      return;
    }

    const labels = topFacturas.map(
      (f) => f.nombre + " - " + f.numeroFactura || "Sin nombre"
    );
    const data = topFacturas.map((f) => f.total);

    if (chartInstance) {
      // Si ya existe, actualizamos los datos sin destruir el gráfico
      chartInstance.data.labels = labels;
      chartInstance.data.datasets[0].data = data;
      chartInstance.update();
      return;
    }

    // Solo se crea una vez
    chartInstance = new Chart(canvas, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Total de Factura",
            data: data,
            backgroundColor: "#5e81f4",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        animation: {
          duration: 1000,
          easing: "easeOutQuart",
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

  onDestroy(() => {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
      console.log("Gráfico destruido correctamente.");
    }
  });

  onMount(obtenerFacturas);
</script>

<div class="botones-filtros">
  <button
    class="botones"
    on:click={() => {
      filtrarPorTipo("Compra"), textoFiltro.set("Facturas de Compras");
    }}>Compras</button
  >
  <button
    class="botones"
    on:click={() => {
      filtrarPorTipo("Venta"), textoFiltro.set("Facturas de Ventas");
    }}>Ventas</button
  >
</div>

<div class="columna-responsive">
  <canvas id="chartCanvas"></canvas>
</div>

<style>
  .botones-filtros {
    display: flex;
    width: 90%;
    justify-content: center;
    margin-bottom: 20px;
  }

  .botones-filtros .botones {
    background-color: #5e81f4;
    color: white;
    border: none;
    margin-right: 10px;
    padding: 10px;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .botones-filtros .botones:hover {
    background-color: #3a60db;
  }

  .columna-responsive {
    width: 100%;
    height: 400px;
    display: flex;
    justify-content: center;
  }
</style>
