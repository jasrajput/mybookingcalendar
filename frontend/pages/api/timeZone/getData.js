

export default async (req, res) => {
    try {
        if(req.method === 'GET') {
            const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/timezone`)

            const backendData = await backendRes.json()

            if(backendRes.ok) {
                res.status(200).json(backendData)
            } else {
                res.status(backendRes.status).json(backendData)
            }
        } else {
            res.setHeader('Allow', ['GET'])
            res.status(405).json({ message : `method ${req.method} not allowed` })
        }
    } catch (error) {
        res.status(500).json({ message : 'Cannot connect to the server' })
    }
}