document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultContainer = document.getElementById('result');

    // Función para limpiar el resultado
    function clearResults() {
        resultContainer.innerHTML = '';
    }

    // Agregamos un evento de clic al botón de búsqueda
    searchButton.addEventListener('click', function () {
        const name = searchInput.value.trim().toLowerCase(); // Asegura que se usa en minúsculas

        if (name) {
            clearResults();  // Limpiamos los resultados anteriores
            fetch(`/api/hiro-proxy?name=${name}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        resultContainer.innerHTML = `Error: ${data.error}`;
                    } else if (data.address) {
                        // Si se encuentra el dominio
                        resultContainer.innerHTML = `
                            <div class="result-card bg-green-500">
                                <h2>Domain: ${name}</h2>
                                <p>Address: ${data.address}</p>
                                <p>Status: ${data.status}</p>
                                <p>Expiration: ${data.expiration || 'N/A'}</p>
                            </div>
                        `;
                    } else {
                        // Si no se encuentra el dominio
                        resultContainer.innerHTML = `
                            <div class="result-card bg-yellow-500">
                                <h2>${name} is Available!</h2>
                                <p>Click below to register:</p>
                                <a href="https://stacks.id" target="_blank">Register at Stacks.id</a><br>
                                <a href="https://bnsx.com" target="_blank">Register at BNSx</a>
                            </div>
                        `;
                    }
                })
                .catch(error => {
                    resultContainer.innerHTML = `Error fetching data: ${error}`;
                });
        } else {
            resultContainer.innerHTML = 'Please enter a name.';
        }
    });

    // También agregamos la funcionalidad para presionar Enter y realizar la búsqueda
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });
});
