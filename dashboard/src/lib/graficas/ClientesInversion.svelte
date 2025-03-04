<script>
    import Chart from "chart.js/auto";
    import { onMount, tick } from "svelte";
    import { db } from "../../firebase";
    import { collection, getDocs } from "firebase/firestore";

    let chartInstance;
    let clientesData = [];
    let chartType = "scatter"; // Inicialmente gráfico de dispersión
    let estadoSeleccionado = "Todos";
    let presupuestoMin = 25000;
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
                let tecnologias = data.tecnologias || [];

                // Aplicar filtros en código
                if (
                    (estadoSeleccionado === "Todos" || estado === estadoSeleccionado) &&
                    presupuesto >= presupuestoMin &&
                    presupuesto <= presupuestoMax
                ) {
                    if (!clientesInversion[cliente]) {
                        clientesInversion[cliente] = {
                            totalInvertido: 0,
                            proyectos: 0,
                            tecnologias: new Set(),
                        };
                    }
                    clientesInversion[cliente].totalInvertido += presupuesto;
                    clientesInversion[cliente].proyectos += 1;
                    tecnologias.forEach((tec) => clientesInversion[cliente].tecnologias.add(tec));
                }
            });

            clientesData = Object.entries(clientesInversion).map(([cliente, data]) => ({
                cliente,
                totalInvertido: data.totalInvertido,
                proyectos: data.proyectos,
                tecnologias: Array.from(data.tecnologias),
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

        chartInstance = new Chart(canvas, {
            type: chartType,
            data: {
                datasets: [
                    {
                        label: "Inversión por Cliente",
                        data: clientesData.map((c) => ({
                            x: c.proyectos,
                            y: c.totalInvertido,
                            r: Math.min(c.totalInvertido / 1500, 25), // Ajuste del tamaño relativo de la burbuja
                        })),
                        backgroundColor: "rgba(94, 129, 244, 0.7)",
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: "Número de Proyectos" },
                        ticks: {
                            stepSize: 1,  // Asegura que se muestren solo enteros
                            precision: 0,  // limina decimales
                            suggestedMin: 0, // Inicia en 0
                            suggestedMax: Math.max(...clientesData.map(c => c.proyectos), 5), // Se ajusta dinámicamente al máximo
                        },
                    },
                    y: {
                        title: { display: true, text: "Inversión Total (€)" },
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                let cliente = clientesData[tooltipItem.dataIndex];
                                return `${cliente.cliente}: €${cliente.totalInvertido} en ${cliente.proyectos} proyectos`;
                            },
                        },
                    },
                },
            },
        });
    }

    function cambiarTipoGrafico() {
        chartType = chartType === "scatter" ? "bubble" : "scatter";
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
    <h2 class="titulo-seccion">Clientes y Sus Inversiones</h2>

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
                Modo actual: <strong>{chartType === "scatter" ? "Dispersión" : "Burbuja"}</strong> | Cambiar
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

    .filtros-clientes select,
    .filtros-clientes input {
        padding: 8px;
        border-radius: 5px;
        border: 1px solid #5e81f4;
        background-color: white;
        font-size: 16px;
        width: 100%;
    }

    .boton-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
    }

    .grafico-clientes {
        width: 90%;
        height: 400px;
        display: flex;
        justify-content: center;
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

    .boton-toggle:hover {
        background-color: #3b5998;
    }
</style>
