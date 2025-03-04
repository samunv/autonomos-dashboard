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
      .slice(0, 7);

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
    // Cambiamos el tipo a "line"
    chartInstance = new Chart(canvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Total de Factura",
            data: data,
            borderColor: "#5e81f4",
            backgroundColor: "rgba(94, 129, 244, 0.2)", // Relleno sutil debajo de la línea
            borderWidth: 2,
            tension: 0.4, // Hace que la línea tenga curvas suaves
            fill: true, // Rellenar bajo la línea
            pointBackgroundColor: "#1d4ed8",
            pointBorderColor: "#1d4ed8",
            pointRadius: 5, // Tamaño de los puntos
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
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Total (€)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Facturas (Cliente- Número)",
            },
          },
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
      filtrarPorTipo("Compra"),
        textoFiltro.set("Facturas de Compras con Mayor Total");
    }}
    ><svg
      xmlns="http://www.w3.org/2000/svg"
      height="20px"
      viewBox="0 -960 960 960"
      width="20px"
      fill="white"
      ><path
        d="M240-80q-33 0-56.5-23.5T160-160v-480q0-33 23.5-56.5T240-720h80q0-66 47-113t113-47q66 0 113 47t47 113h80q33 0 56.5 23.5T800-640v480q0 33-23.5 56.5T720-80H240Zm0-80h480v-480h-80v80q0 17-11.5 28.5T600-520q-17 0-28.5-11.5T560-560v-80H400v80q0 17-11.5 28.5T360-520q-17 0-28.5-11.5T320-560v-80h-80v480Zm160-560h160q0-33-23.5-56.5T480-800q-33 0-56.5 23.5T400-720ZM240-160v-480 480Z"
      /></svg
    > Compras</button
  >
  <button
    class="botones"
    on:click={() => {
      filtrarPorTipo("Venta"),
        textoFiltro.set("Facturas de Ventas con Mayor Total");
    }}
    ><svg
      xmlns="http://www.w3.org/2000/svg"
      height="20px"
      viewBox="0 -960 960 960"
      width="20px"
      fill="white"
      ><path
        d="M856-390 570-104q-12 12-27 18t-30 6q-15 0-30-6t-27-18L103-457q-11-11-17-25.5T80-513v-287q0-33 23.5-56.5T160-880h287q16 0 31 6.5t26 17.5l352 353q12 12 17.5 27t5.5 30q0 15-5.5 29.5T856-390ZM513-160l286-286-353-354H160v286l353 354ZM260-640q25 0 42.5-17.5T320-700q0-25-17.5-42.5T260-760q-25 0-42.5 17.5T200-700q0 25 17.5 42.5T260-640Zm220 160Z"
      /></svg
    > Ventas</button
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
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    width: 100px;
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
