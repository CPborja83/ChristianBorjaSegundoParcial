let myChart; 

let porcentajeMaya, porcentajeGarifuna, porcentajeXinca, porcentajeAfrodescendiente, porcentajeLadino, porcentajeExtranjero;

function cleanData(rawData) {
    return rawData
        .replace(/[{}"\\]/g, '')  
        .replace(/:/g, ' ')       
        .replace(/,/g, '\n');     
}

async function obtenerDatos() {
    const codigoMunicipio = document.getElementById("municipios").value;
    const municipioSeleccionado = document.getElementById("municipios").options[document.getElementById("municipios").selectedIndex].text;

    try {
        const response = await fetch(`https://censopoblacion.azurewebsites.net/API/indicadores/2/${codigoMunicipio}`);
        const data = await response.json();  // Parsear el JSON correctamente

        if (!data || Object.keys(data).length === 0) {
            Swal.fire({
                title: 'Municipio no encontrado',
                text: 'No se encontró un municipio con ese código.',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        document.getElementById("titulo-tabla").innerText = municipioSeleccionado;

        const rawData = JSON.stringify(data);
        const cleanText = cleanData(rawData);
        
        const tbody = document.getElementById('data-table').querySelector('tbody');
        tbody.innerHTML = ''; // Limpiar tabla antes de agregar nuevos datos

        cleanText.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(' '); // Separar la clave de los valores
            const value = valueParts.join(' '); // Unir los valores restantes

            if (key && value) {
                const row = `
                    <tr>
                        <td class="py-2 px-4 border">${key.trim()}</td>
                        <td class="py-2 px-4 border">${value.trim()}</td>
                    </tr>
                `;
                tbody.innerHTML += row;

                switch (key.trim()) {
                    case "porc_pueblo_maya":
                        porcentajeMaya = parseFloat(value.trim());
                        break;
                    case "porc_pueblo_garifuna":
                        porcentajeGarifuna = parseFloat(value.trim());
                        break;
                    case "porc_pueblo_xinca":
                        porcentajeXinca = parseFloat(value.trim());
                        break;
                    case "porc_pueblo_afrodescendiente":
                        porcentajeAfrodescendiente = parseFloat(value.trim());
                        break;
                    case "porc_pueblo_ladino":
                        porcentajeLadino = parseFloat(value.trim());
                        break;
                    case "porc_pueblo_extranjero":
                        porcentajeExtranjero = parseFloat(value.trim());
                        break;
                }
            }
        });

        obtenerDescripcionWikipedia(municipioSeleccionado);

        const porcentajes = {
            "Maya": porcentajeMaya || 0,
            "Garifuna": porcentajeGarifuna || 0,
            "Xinca": porcentajeXinca || 0,
            "Afrodescendiente": porcentajeAfrodescendiente || 0,
            "Ladino": porcentajeLadino || 0,
            "Extranjero": porcentajeExtranjero || 0
        };

        drawChart(porcentajes);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo obtener los datos del municipio. Por favor, inténtalo más tarde.',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
    }
}

async function obtenerDescripcionWikipedia(municipio) {
    const url = `https://es.wikipedia.org/w/api.php?action=query&origin=*&format=json&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(municipio)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const pages = data.query.pages;
        const page = Object.values(pages)[0];

        if (page.missing) {
            document.getElementById('porcentajes').value = `No se encontró información en Wikipedia para ${municipio}.`;
        } else {
            document.getElementById('porcentajes').value = page.extract;
        }
    } catch (error) {
        console.error('Error al obtener la información de Wikipedia:', error);
        document.getElementById('porcentajes').value = 'Error al obtener información de Wikipedia.';
    }
}

function drawChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'bar', 
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Porcentaje de Población',
                data: Object.values(data),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ],
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            return `${tooltipItem.label}: ${tooltipItem.raw.toFixed(2)}%`;
                        }
                    }
                }
            }
        }
    });
}

window.onload = () => {
    obtenerDatos();
};

