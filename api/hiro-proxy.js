export default async function handler(req, res) {
    const { name } = req.query;
    
    if (!name) {
        return res.status(400).json({ error: "No name provided" });
    }

    try {
        const response = await fetch(`https://api.hiro.so/extended/v1/bns/names/${encodeURIComponent(name)}`, {
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}` // Usa la API Key de forma segura
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Error fetching data" });
    }
}
