<script>
    import Chart from "chart.js/auto";
    import { onMount, tick } from "svelte";
    import { db } from "../../firebase";
    import { collection, getDocs } from "firebase/firestore";
  
    let chartBarras, chartRadar;
    let datosImpuestos = [];
  
    async function obtenerDatosImpuestos() {
      try {
        console.log("Cargando datos desde Firestore...");
  
        // Obtener todas las facturas
        const facturasSnapshot = await getDocs(collection(db, "facturas"));
        let impuestosPorEntidad = {};
  
        // Agrupar por cliente/proveedor y sumar IVA e IRPF
        facturasSnapshot.forEach((doc) => {
          let cliente = doc.data().cliente || "Desconocido";
          let iva = doc.data().iva || 0;
          let irpf = doc.data().irpf || 0;
  
          if (!impuestosPorEntidad[cliente]) {
            impuestosPorEntidad[cliente] = { iva: 0, irpf: 0 };
          }
          impuestosPorEntidad[cliente].iva += iva;
          impuestosPorEntidad[cliente].irpf += irpf;
        });
  
        // Convertir los datos a un array usable por Chart.js
        datosImpuestos = Object.entries(impuestosPorEntidad).map(([cliente, impuestos]) => ({
          cliente,
          iva: impuestos.iva,
          irpf: impuestos.irpf
        }));
  
        // Esperar a que el DOM esté listo antes de renderizar las gráficas
        await tick();
        renderChartBarras();
        renderChartRadar();
      } catch (error) {
        console.error("Error al obtener datos de Firestore:", error);
      }
    }
  
    function renderChartBarras() {
      let canvas = document.getElementById("chartBarras");
  
      if (!canvas) {
        console.error("No se encontró el canvas en el DOM");
        return;
      }
  
      if (chartBarras) {
        chartBarras.destroy();
      }
  
      chartBarras = new Chart(canvas, {
        type: "bar",
        data: {
          labels: datosImpuestos.map((d) => d.cliente),
          datasets: [
            {
              label: "IVA",
              data: datosImpuestos.map((d) => d.iva),
              backgroundColor: "#5e81f4",
            },
            {
              label: "IRPF",
              data: datosImpuestos.map((d) => d.irpf),
              backgroundColor: "#f45e5e",
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
  
    function renderChartRadar() {
      let canvas = document.getElementById("chartRadar");
  
      if (!canvas) {
        console.error("No se encontró el canvas en el DOM");
        return;
      }
  
      if (chartRadar) {
        chartRadar.destroy();
      }
  
      chartRadar = new Chart(canvas, {
        type: "radar",
        data: {
          labels: datosImpuestos.map((d) => d.cliente),
          datasets: [
            {
              label: "IVA",
              data: datosImpuestos.map((d) => d.iva),
              backgroundColor: "rgba(94, 129, 244, 0.2)",
              borderColor: "#5e81f4",
              borderWidth: 1,
            },
            {
              label: "IRPF",
              data: datosImpuestos.map((d) => d.irpf),
              backgroundColor: "rgba(244, 94, 94, 0.2)",
              borderColor: "#f45e5e",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            r: { beginAtZero: true },
          },
        },
      });
    }
  
    onMount(obtenerDatosImpuestos);
  </script>
  
  <!-- Contenedor de las gráficas -->
  <div class="contenedor-graficas">
    <div>
      <h3>Comparación de IVA e IRPF por Cliente/Proveedor (Barras)</h3>
      <canvas id="chartBarras"></canvas>
    </div>
  
    <div>
      <h3>Comparación de IVA e IRPF por Cliente/Proveedor (Radar)</h3>
      <canvas id="chartRadar"></canvas>
    </div>
  </div>
  
  <style>
    .contenedor-graficas {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 30px;
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
  