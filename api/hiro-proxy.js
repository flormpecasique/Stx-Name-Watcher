export default async function handler(req, res) {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: "Name parameter is required" });
    }

    const url = `https://api.hiro.so/v1/names/${name}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.HIRO_API_KEY}`, // Si necesitas una API Key, usa la variable de entorno
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        const data = await response.json();

        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error fetching data. Try again later.' });
    }
}
