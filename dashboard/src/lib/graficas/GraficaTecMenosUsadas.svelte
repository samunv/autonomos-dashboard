<script>
  import Chart from "chart.js/auto";
  import { onMount, tick } from "svelte";
  import { db } from "../../firebase";
  import { collection, getDocs } from "firebase/firestore";

  let chartInstanceLess;
  let lessTecnologias = [];
  let tecnologias = [];

  async function obtenerTecnologias() {
    const tecnologiasSnapshot = await getDocs(collection(db, "tecnologias"));
    tecnologias = tecnologiasSnapshot.docs.map((doc) => doc.data());
    console.log("Tecnologías encontradas:", tecnologias);
  }

  async function obtenerDatosTecnologias() {
    try {
      console.log("Cargando datos desde Firestore...");
      const proyectosSnapshot = await getDocs(collection(db, "proyectos"));
      let tecnologiaCount = {};

      proyectosSnapshot.forEach((doc) => {
        let tecnologiasUsadas = doc.data().tecnologias;

        tecnologiasUsadas.forEach((tecnologia) => {
          tecnologiaCount[tecnologia] = (tecnologiaCount[tecnologia] || 0) + 1;
        });
      });

      let tecnologiasOrdenadas = Object.entries(tecnologiaCount)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => a.cantidad - b.cantidad);

      lessTecnologias = tecnologiasOrdenadas.slice(0, 5).map(({ nombre, cantidad }) => {
        return { nombre, cantidad };
      });

      await tick();
      renderChartLess();
    } catch (error) {
      console.error("❌ Error al obtener datos de Firestore:", error);
    }
  }

  function renderChartLess() {
    let canvas = document.getElementById("chartCanvasLess");
    if (!canvas) {
      console.error("No se encontró el canvas en el DOM");
      return;
    }

    if (chartInstanceLess) {
      chartInstanceLess.destroy();
    }

    if (lessTecnologias.length === 0) {
      console.warn("No hay datos suficientes para la gráfica");
      return;
    }

    const total = lessTecnologias.reduce((sum, t) => sum + t.cantidad, 0);
    const porcentajes = lessTecnologias.map((t) => ((t.cantidad / total) * 100).toFixed(2));

    chartInstanceLess = new Chart(canvas, {
      type: "pie",
      data: {
        labels: lessTecnologias.map((tec, posicion) => `${tec.nombre} (${porcentajes[posicion]}%)`),
        datasets: [
          {
            data: lessTecnologias.map((t) => t.cantidad),
            backgroundColor: ["#ff8c00", "#ff4500", "#ff6347", "#b22222", "#d2691e"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
  }

  onMount(async () => {
    await obtenerTecnologias();
    await obtenerDatosTecnologias();
  });
</script>

<div class="contenedor-conjunto">
  <div class="contenedor-peores-tecnologias">
    <h1 class="titulo-peores-tecnologias">Peores 5 Tecnologías</h1>
    {#each lessTecnologias as { nombre, cantidad }, index}
      <div class="tecnologia-item">
        <p class="indice-posicion">{index + 1}</p>
        <p class="nombre-tecnologia">{nombre} - {cantidad} </p>
      </div>
    {/each}
  </div>
  <div class="contenedor-top-tecnologias">
    <h1 class="titulo-top-tecnologias">Tecnologías Menos Usadas</h1>
    <canvas id="chartCanvasLess"></canvas>
  </div>
</div>

<style>
  .contenedor-conjunto {
    display: flex;
    align-items: stretch;
    justify-content: center;
    gap: 30px;
  }

  .contenedor-peores-tecnologias {
    padding: 20px;
    background-color: #e8eeff;
    border-radius: 5px;
    flex: 0 0 250px;
    display: flex;
    flex-direction: column;
  }

  .titulo-peores-tecnologias {
    color: #5e81f4;
    font-size: 25px;
  }

  .tecnologia-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 10px;
    gap: 5px;
  }

  .indice-posicion {
    color: white;
    padding: 5px;
    border-radius: 50%;
    background-color: #ff4500;
    font-weight: bold;
    font-size: 18px;
    margin-right: 5px;
    width: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .contenedor-top-tecnologias {
    padding: 20px;
    background-color: #e8eeff;
    border-radius: 5px;
    flex: 0 0 250px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .titulo-top-tecnologias {
    color: #5e81f4;
    font-size: 25px;
  }
</style>
