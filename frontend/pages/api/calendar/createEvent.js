export default async (req, res) => {
    try {
        if(req.method === 'POST'){
            const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/calendar/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(req.body)
            })
            
            const backendData = await backendRes.json()
    
            if(backendRes.ok){
                res.status(200).json(backendData.event)
            }else{
                res.status(backendRes.status).json(backendData)
            }
        }else{
            res.setHeader('Allow', ['POST'])
            res.status(405).json({message: `method ${req.method} not allowed`})
        }
        
    } catch (error) {
        res.status(500).json({message: 'Can not connect to the server'})
    }
}