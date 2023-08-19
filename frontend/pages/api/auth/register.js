import cookie from 'cookie'

export default async (req, res) => {
    try {
        if(req.method === 'POST') {
            const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(req.body)
            })

            const backendData = await backendRes.json()

            if(backendRes.ok) {
                // set cookie
                res.setHeader('Set-Cookie', cookie.serialize('token', backendData.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60*60*24*7, // 1 week
                    sameSite: 'strict',
                    path: '/'
                }))

                res.status(200).json(backendData.user)
            } else {
                res.status(backendRes.status).json(backendData)
            }
        } else {
            res.setHeader('Allow', ['POST'])
            res.status(405).json({ message : `method ${req.method} not allowed` })
        }
    } catch (error) {
        res.status(500).json({ message : 'Cannot connect to the server' })
    }
}