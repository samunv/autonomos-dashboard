<script>
    import Chart from "chart.js/auto";
    import { onMount, tick } from "svelte";
    import { db } from "../../firebase";
    import { collection, getDocs } from "firebase/firestore";
    import { textoFiltro } from "../../store"; // Importamos la variable reactiva


    let chartInstance;
    let proyectosFiltrados = [];
    let estadoSeleccionado = "Finalizado";
    let titulo = "Proyectos con más presupuesto"; // Inicialmente "Más presupuesto"
    let tipoPresupuesto = "mas"; // "mas" = Mayor presupuesto, "menos" = Menor presupuesto

    async function obtenerProyectosPresupuesto() {
        try {
            console.log(` Cargando TODOS los proyectos desde Firestore...`);

            const proyectosSnapshot = await getDocs(collection(db, "proyectos"));

            let proyectos = proyectosSnapshot.docs.map(doc => ({
                nombre: doc.data().nombre,
                presupuesto: doc.data().presupuesto,
                estado: doc.data().estado 
            }));

            proyectos = proyectos.filter(proyecto => proyecto.estado === estadoSeleccionado);

            if (tipoPresupuesto === "mas") {
                proyectos.sort((a, b) => b.presupuesto - a.presupuesto);
            } else {
                proyectos.sort((a, b) => a.presupuesto - b.presupuesto);
            }

            proyectosFiltrados = proyectos.slice(0, Math.min(4, proyectos.length));

            await tick();
            renderChart();
        } catch (error) {
            console.error("Error al obtener proyectos de Firestore:", error);
        }
    }

    function renderChart() {
        let canvas = document.getElementById("chartCanvas");

        if (!canvas) {
            console.error("No se encontró el canvas en el DOM");
            return;
        }

        if (chartInstance) {
            chartInstance.destroy();
        }

        if (proyectosFiltrados.length === 0) {
            console.warn(" No hay datos suficientes para la gráfica");
            return;
        }

        const coloresAzules = [
            "rgba(94, 129, 244, 0.9)",
            "rgba(58, 102, 244, 0.9)",
            "rgba(124, 151, 244, 0.9)",
            "rgba(164, 180, 247, 0.9)"
        ];

        let presupuestoMax = Math.max(...proyectosFiltrados.map((p) => p.presupuesto), 0);

        chartInstance = new Chart(canvas, {
            type: "bar",
            data: {
                labels: proyectosFiltrados.map((p) => p.nombre),
                datasets: [
                    {
                        label: `Presupuesto (€) - ${estadoSeleccionado} (${tipoPresupuesto === "mas" ? "Más" : "Menos"})`,
                        data: proyectosFiltrados.map((p) => p.presupuesto),
                        backgroundColor: coloresAzules.slice(0, proyectosFiltrados.length),
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                indexAxis: 'y', 
                maintainAspectRatio: false, 
                scales: {
                    x: { 
                        beginAtZero: true,
                        max: presupuestoMax + presupuestoMax * 0.1, 
                    },
                },
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                    },
                },
                barThickness: 30, 
            },
        });
    }

    onMount(obtenerProyectosPresupuesto);

    function cambiarEstado(event) {
    estadoSeleccionado = event.target.value;
    obtenerProyectosPresupuesto();
}


    function cambiarTipoPresupuesto(tipo) {
    tipoPresupuesto = tipo;
    textoFiltro.set(tipo === "mas" ? "Proyectos con más presupuesto" : "Proyectos con menos presupuesto");
    obtenerProyectosPresupuesto();
    }


</script>



<!-- Contenedor de filtros con botones alineados correctamente -->
<div class="filtros-container">
    <div class="botones-filtros">
        <button class="boton" on:click={() => cambiarTipoPresupuesto("mas")}>
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white">
                <path d="M480-160q-17 0-28.5-11.5T440-200v-560q0-17 11.5-28.5T480-800q17 0 28.5 11.5T520-760v560q0 17-11.5 28.5T480-160ZM280-360q-17 0-28.5-11.5T240-400v-160q0-17 11.5-28.5T280-600q17 0 28.5 11.5T320-560v160q0 17-11.5 28.5T280-360Zm400 0q-17 0-28.5-11.5T640-400v-160q0-17 11.5-28.5T680-600q17 0 28.5 11.5T720-560v160q0 17-11.5 28.5T680-360Z"/>
            </svg>
            Más presupuesto
        </button>

        <button class="boton" on:click={() => cambiarTipoPresupuesto("menos")}>
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white">
                <path d="M280-360q-17 0-28.5-11.5T240-400v-160q0-17 11.5-28.5T280-600q17 0 28.5 11.5T320-560v160q0 17-11.5 28.5T280-360Z"/>
            </svg>
            Menos presupuesto
        </button>
    </div>

    <div class="filtro-estado">
        <label for="estado">Filtrar por estado:</label>
        <select id="estado" bind:value={estadoSeleccionado} on:change={cambiarEstado}>
            <option value="Finalizado">Finalizado</option>
            <option value="Sin Comenzar">Sin Comenzar</option>
            <option value="En Curso">En Curso</option>
        </select>
    </div>
</div>

<!-- Gráfico -->
<div class="chart-container">
    <canvas id="chartCanvas"></canvas>
</div>

<style>
    .filtros-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 15px;
        margin-bottom: 40px;
    }

    .botones-filtros {
        display: flex;
        gap: 10px;
    }

    .boton {
        background-color: #5e81f4;
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        border: none;
        transition: 0.3s ease;
    }

    .boton:hover {
        background-color: #3a60db;
    }

    .filtro-estado {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
    }

    .filtro-estado label {
    font-size: 16px;
    color: #333;
    }

    .filtro-estado select {
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #5e81f4;
    background-color: white;
    font-size: 16px;
    color: #333;
    cursor: pointer;
    transition: all 0.3s ease;
    }

    .filtro-estado select:hover {
    border-color: #3a60db;
    }

    .filtro-estado select:focus {
    outline: none;
    border-color: #3a60db;
    box-shadow: 0 0 5px rgba(58, 102, 244, 0.5);
    }


    .chart-container {
        width: 90%;
        height: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
