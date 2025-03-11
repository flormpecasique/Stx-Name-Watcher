export default async function handler(req, res) {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: "Missing 'name' parameter" });
    }

    try {
        const response = await fetch(`https://api.hiro.so/bns/v1/names/${encodeURIComponent(name)}`, {
            method: 'GET',
            headers: {
                'x-api-key': process.env.HIRO_API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
}
