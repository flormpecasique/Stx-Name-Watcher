// Esperamos a que el documento esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultContainer = document.getElementById('result');

    // Agregamos un evento de clic al botón de búsqueda
    searchButton.addEventListener('click', function () {
        const name = searchInput.value.trim().toLowerCase(); // Asegura que se usa en minúsculas y elimina espacios

        if (name) {
            fetch(`/api/hiro-proxy?name=${name}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        resultContainer.innerHTML = `Error: ${data.error}`;
                    } else if (data.address) {
                        resultContainer.innerHTML = `Name: ${name}<br>Address: ${data.address}<br>Status: ${data.status}`;
                    } else {
                        resultContainer.innerHTML = 'No data found for this domain.';
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

