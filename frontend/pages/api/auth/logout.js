import cookie from 'cookie'

export default async (req, res) => {
    if(req.method === 'GET'){
        // destroy cookie
        res.setHeader('Set-Cookie', cookie.serialize('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(0),
            sameSite: 'strict',
            path: '/'
        }))

        res.status(200).json({message: 'cookie destroyed'})
    }else{
        res.setHeader('Allow', ['GET'])
        res.status(405).json({message: `method ${req.method} not allowed`})
    }
}