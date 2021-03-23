module.exports = {
    environment: process.env.NODE_ENV || "development",
    DATABASE_URI: process.env.DATABASE_URI,
    jwtConfig: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
    },
    baseURL: process.env.NODE_ENV === 'production' ? 'https://visitnomad.com' : 'http://localhost:3000',
    exportURL: process.env.NODE_ENV === 'production' ? 'https://exports.visitnomad.com' : 'http://localhost:8080',
    nodemailerPass: 'lztihdfmqztstuiw',
};
