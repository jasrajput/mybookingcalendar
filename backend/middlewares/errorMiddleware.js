export const notFound = (req, res, next) => {
    const error = `Not Found - ${req.originalUrl}`
    res.status(404)
    next(error)
}

export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode

    if(err.message === 'invalid_grant') {
        res.status(401).json({ message: 'Google calendar not integrated' })
        return
    }

    res.status(statusCode).json({ message: err.message, stack: process.env.NODE_ENV === 'production' ? null : err.stack })
}