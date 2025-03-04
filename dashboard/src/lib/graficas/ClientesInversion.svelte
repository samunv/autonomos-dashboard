<script>
    import Chart from "chart.js/auto";
    import { onMount, tick } from "svelte";
    import { db } from "../../firebase";
    import { collection, getDocs } from "firebase/firestore";

    let chartInstance;
    let clientesData = [];
    let chartType = "bar"; // Se inicializa con barras
    let estadoSeleccionado = "Todos";
    let presupuestoMin = 0;
    let presupuestoMax = 100000;

    async function obtenerDatosClientes() {
        try {
            console.log("⏳ Cargando datos de clientes desde Firestore...");

            const proyectosSnapshot = await getDocs(collection(db, "proyectos"));
            let clientesInversion = {};

            proyectosSnapshot.forEach((doc) => {
                let data = doc.data();
                let cliente = data.cliente;
                let presupuesto = data.presupuesto;
                let estado = data.estado;

                if (
                    (estadoSeleccionado === "Todos" || estado === estadoSeleccionado) &&
                    presupuesto >= presupuestoMin &&
                    presupuesto <= presupuestoMax
                ) {
                    if (!clientesInversion[cliente]) {
                        clientesInversion[cliente] = {
                            totalInvertido: 0,
                            proyectos: 0,
                        };
                    }
                    clientesInversion[cliente].totalInvertido += presupuesto;
                    clientesInversion[cliente].proyectos += 1;
                }
            });

            clientesData = Object.entries(clientesInversion).map(([cliente, data]) => ({
                cliente,
                totalInvertido: data.totalInvertido,
                proyectos: data.proyectos,
            }));

            await tick();
            renderChart();
        } catch (error) {
            console.error("❌ Error al obtener datos de clientes:", error);
        }
    }

    function renderChart() {
    let canvas = document.getElementById("chartCanvas");

    if (!canvas) {
        console.error("⚠ No se encontró el canvas en el DOM");
        return;
    }

    if (chartInstance) {
        chartInstance.destroy();
    }

    if (clientesData.length === 0) {
        console.warn("⚠ No hay datos suficientes para la gráfica");
        return;
    }

    let labels = clientesData.map(c => c.cliente);
    let dataset;
    
    let options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: chartType === "bar" ? "Clientes" : "Número de Proyectos",
                },
                ticks: chartType === "bubble" ? { stepSize: 1, precision: 0 } : {}, // Asegura enteros en burbujas
            },
            y: {
                title: { display: true, text: "Inversión Total (€)" },
                beginAtZero: true,
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        let cliente = clientesData[tooltipItem.dataIndex];
                        return `Cliente: ${cliente.cliente}, \nProyectos: ${cliente.proyectos}, \nInversión Total: €${cliente.totalInvertido.toFixed(2)}`;
                    },
                },
            },
        },
    };

    if (chartType === "bubble") {
        dataset = {
            label: "Inversión por Cliente",
            data: clientesData.map(c => ({
                x: c.proyectos,
                y: c.totalInvertido,
                r: Math.min(c.totalInvertido / 1500, 25), // Controla el tamaño de la burbuja
            })),
            backgroundColor: "rgba(94, 129, 244, 0.7)",
        };
    } else if (chartType === "bar") {
        dataset = {
            label: "Inversión por Cliente",
            backgroundColor: "rgba(94, 129, 244, 0.8)",
            data: clientesData.map(c => c.totalInvertido),
        };
    }

    chartInstance = new Chart(canvas, {
        type: chartType,
        data: {
            labels: chartType === "bar" ? labels : undefined,
            datasets: [dataset],
        },
        options: options,
    });
}


    function cambiarTipoGrafico() {
        chartType = chartType === "bar" ? "bubble" : "bar";
        renderChart();
    }

    function cambiarEstado(event) {
        estadoSeleccionado = event.target.value;
        obtenerDatosClientes();
    }

    function actualizarPresupuestoMin(event) {
        presupuestoMin = Number(event.target.value);
        obtenerDatosClientes();
    }

    function actualizarPresupuestoMax(event) {
        presupuestoMax = Number(event.target.value);
        obtenerDatosClientes();
    }

    onMount(obtenerDatosClientes);
</script>

<!-- Contenedor principal -->
<div class="contenedor-cliente-inversion">
    <h2 class="titulo-seccion">Comparación de Inversión por Cliente</h2>

    <!-- Área de filtros -->
    <div class="filtros-clientes">
        <div class="filtro">
            <label for="estado">Estado:</label>
            <select id="estado" bind:value={estadoSeleccionado} on:change={cambiarEstado}>
                <option value="Todos">Todos</option>
                <option value="Finalizado">Finalizado</option>
                <option value="En Curso">En Curso</option>
                <option value="Sin Comenzar">Sin Comenzar</option>
            </select>
        </div>

        <div class="filtro">
            <label for="presupuesto-min">Presupuesto (€) Mínimo:</label>
            <input id="presupuesto-min" type="number" bind:value={presupuestoMin} on:change={actualizarPresupuestoMin} />
        </div>

        <div class="filtro">
            <label for="presupuesto-max">Presupuesto (€) Máximo:</label>
            <input id="presupuesto-max" type="number" bind:value={presupuestoMax} on:change={actualizarPresupuestoMax} />
        </div>

        <div class="boton-container">
            <button class="boton-toggle" on:click={cambiarTipoGrafico}>
                Modo: <strong>{chartType === "bar" ? "Barras" : "Burbujas"}</strong> | Cambiar
            </button>
        </div>
    </div>

    <!-- Contenedor del gráfico -->
    <div class="grafico-clientes">
        <canvas id="chartCanvas"></canvas>
    </div>
</div>

<!-- Estilos -->
<style>
    .contenedor-cliente-inversion {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        width: 100%;
    }

    .titulo-seccion {
        font-size: 22px;
        font-weight: bold;
        color: #333;
    }

    .filtros-clientes {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        justify-content: center;
        background: #e8eeff;
        padding: 15px;
        border-radius: 5px;
        width: 90%;
        max-width: 800px;
    }

    .filtro {
        display: flex;
        flex-direction: column;
        align-items: start;
        min-width: 180px;
    }

    .filtros-clientes label {
        font-weight: bold;
        margin-bottom: 5px;
    }

    .boton-toggle {
        padding: 10px;
        border: none;
        background-color: #5e81f4;
        color: white;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 10px;
    }

    .grafico-clientes {
        width: 90%;
        height: 400px;
        display: flex;
        justify-content: center;
    }
</style>
