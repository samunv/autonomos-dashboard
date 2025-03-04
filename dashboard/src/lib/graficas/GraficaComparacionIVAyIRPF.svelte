<script>
  import Chart from "chart.js/auto";
  import { onMount, tick } from "svelte";
  import { db } from "../../firebase";
  import { collection, getDocs } from "firebase/firestore";

  let chartClientes, chartProveedores;
  let datosFacturacionClientes = [];
  let datosFacturacionProveedores = [];

  async function obtenerDatosFacturas() {
    try {
      console.log("Cargando datos desde Firestore...");

      const facturasSnapshot = await getDocs(collection(db, "facturas"));
      let facturacionPorCliente = {};
      let facturacionPorProveedor = {};

      // Recorrer todas las facturas
      facturasSnapshot.forEach((doc) => {
        let data = doc.data();
        let cliente = data.cliente || "Desconocido"; 
        let proveedor = data.nombre || "Desconocido"; // 'nombre' representa la empresa que emite la factura
        let baseImponible = data.baseImponible || 0;

        // Sumar base imponible por cliente
        if (!facturacionPorCliente[cliente]) {
          facturacionPorCliente[cliente] = 0;
        }
        facturacionPorCliente[cliente] += baseImponible;

        // Sumar base imponible por proveedor
        if (!facturacionPorProveedor[proveedor]) {
          facturacionPorProveedor[proveedor] = 0;
        }
        facturacionPorProveedor[proveedor] += baseImponible;
      });

      // Convertir los datos a un array para Chart.js
      datosFacturacionClientes = Object.entries(facturacionPorCliente).map(([cliente, total]) => ({
        cliente,
        total
      }));

      datosFacturacionProveedores = Object.entries(facturacionPorProveedor).map(([proveedor, total]) => ({
        proveedor,
        total
      }));

      await tick();
      renderCharts();
    } catch (error) {
      console.error("Error al obtener datos de Firestore:", error);
    }
  }

  function renderCharts() {
    let canvasClientes = document.getElementById("chartClientes");
    let canvasProveedores = document.getElementById("chartProveedores");

    if (!canvasClientes || !canvasProveedores) {
      console.error("No se encontraron los canvas en el DOM");
      return;
    }

    if (chartClientes) {
      chartClientes.destroy();
    }
    if (chartProveedores) {
      chartProveedores.destroy();
    }

    if (datosFacturacionClientes.length === 0 || datosFacturacionProveedores.length === 0) {
      console.warn("No hay datos suficientes para mostrar en las gráficas.");
      return;
    }

    chartClientes = new Chart(canvasClientes, {
      type: "bar",
      data: {
        labels: datosFacturacionClientes.map((d) => d.cliente),
        datasets: [
          {
            label: "Total Facturado (€)",
            data: datosFacturacionClientes.map((d) => d.total),
            backgroundColor: "#5e81f4",
          }
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });

    chartProveedores = new Chart(canvasProveedores, {
      type: "bar",
      data: {
        labels: datosFacturacionProveedores.map((d) => d.proveedor),
        datasets: [
          {
            label: "Dinero Ganado (€)",
            data: datosFacturacionProveedores.map((d) => d.total),
            backgroundColor: "#f4a05e",
          }
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

  onMount(obtenerDatosFacturas);
</script>

<!-- Contenedor con dos gráficas en fila -->
<div class="contenedor-graficas">
  <div class="grafica">
    <h3>Total Facturado por Cliente</h3>
    <canvas id="chartClientes"></canvas>
  </div>
  <div class="grafica">
    <h3>Dinero Ganado por Empresas (Proveedores)</h3>
    <canvas id="chartProveedores"></canvas>
  </div>
</div>

<style>
  .contenedor-graficas {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
    width: 90%;
    margin: auto;
    gap: 20px;
  }

  .grafica {
    width: 45%;
    min-width: 400px;
    text-align: center;
  }

  canvas {
    max-width: 100%;
  }

  h3 {
    color: #5e81f4;
  }
</style>
