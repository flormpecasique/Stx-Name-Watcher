document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultContainer = document.getElementById('result');

    // Función para obtener el número actual de bloque de Stacks
    function getCurrentBlockHeight() {
        return fetch('https://api.hiro.so/v2/info')
            .then(response => response.json())
            .then(data => data.stacks_tip_height)
            .catch(error => {
                console.error('Error obteniendo el bloque actual:', error);
                return null;
            });
    }

    // Función para calcular la fecha de expiración basada en el bloque de expiración
    async function calculateExpirationDate(expireBlock) {
        const currentBlock = await getCurrentBlockHeight();
        if (currentBlock !== null) {
            const blocksRemaining = expireBlock - currentBlock;
            const daysRemaining = blocksRemaining / 144; // Aproximadamente 144 bloques por día
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + daysRemaining);
            return expirationDate.toLocaleDateString();
        } else {
            return 'Fecha de expiración no disponible';
        }
    }

    // Evento de clic para el botón de búsqueda
    searchButton.addEventListener('click', async function () {
        let name = searchInput.value.trim().toLowerCase();

        if (name) {
            if (!name.endsWith('.btc')) {
                name += '.btc';
            }

            try {
                const response = await fetch(`https://api.hiro.so/v1/names/${name}`);
                const data = await response.json();

                if (data.error) {
                    resultContainer.innerHTML = `
                        <div class="result-card bg-red-500 text-white p-4 rounded-lg">
                            <strong>Error:</strong> ${data.error}. Por favor, intenta nuevamente más tarde.
                        </div>`;
                } else if (data.address) {
                    const expirationDate = await calculateExpirationDate(data.expire_block);
                    const transactionLink = data.last_txid ? `<a href="https://explorer.stacks.co/txid/${data.last_txid}" target="_blank">Ver en el explorador</a>` : 'No disponible';

                    resultContainer.innerHTML = `
                        <div class="result-card bg-yellow-500 text-white p-4 rounded-lg">
                            <strong>Dominio:</strong> ${name}<br>
                            <strong>Dirección:</strong> ${data.address}<br>
                            <strong>Estado:</strong> Ocupado<br>
                            <strong>Fecha de Expiración:</strong> ${expirationDate}<br>
                            <strong>Última Transacción:</strong> ${transactionLink}<br>
                            <strong>Nota:</strong> Los dominios en el espacio .btc tienen una duración de 5 años desde su registro. Es recomendable renovarlos antes de su expiración para mantener la propiedad.
                        </div>`;
                } else {
                    resultContainer.innerHTML = `
                        <div class="result-card bg-green-500 text-white p-4 rounded-lg">
                            <strong>Dominio:</strong> ${name}<br>
                            <strong>Estado:</strong> Disponible<br>
                            <strong>Regístralo en:</strong> 
                            <a href="https://bns.foundation" target="_blank" class="underline text-blue-300">BNS Foundation</a>
                            <br><strong>Nota:</strong> Los dominios están disponibles para registro. Los precios pueden variar.
                        </div>`;
                }
            } catch (error) {
                resultContainer.innerHTML = `
                    <div class="result-card bg-red-500 text-white p-4 rounded-lg">
                        <strong>Error:</strong> ${error.message}. Por favor, intenta nuevamente más tarde.
                    </div>`;
            }
        } else {
            resultContainer.innerHTML = `
                <div class="result-card bg-yellow-500 text-white p-4 rounded-lg">
                    Por favor, ingresa un nombre de dominio para buscar.
                </div>`;
        }
    });

    // Permitir la búsqueda al presionar Enter
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });
});
