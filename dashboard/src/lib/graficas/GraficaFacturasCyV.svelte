<script>
  import Chart from "chart.js/auto";
  import { onMount, tick } from "svelte";
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

    if (chartInstance) {
      chartInstance.destroy();
    }

    if (topFacturas.length === 0) {
      console.warn("No hay datos suficientes para la gráfica");
      return;
    }

    chartInstance = new Chart(canvas, {
      type: "bar",
      data: {
        labels: topFacturas.map((f) => f.nombre + " - " + f.numeroFactura  || "Sin nombre"),
        datasets: [
          {
            label: "Total de Factura",
            data: topFacturas.map((f) => f.total),
            backgroundColor: "#5e81f4",
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

  onMount(obtenerFacturas);
</script>

<div class="filtros">
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

<canvas id="chartCanvas"></canvas>
