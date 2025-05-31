const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generator = require('generate-password');

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = 60 * 60;
const REFRESH_TOKEN_EXPIRES_IN = 24 * 60 * 60;

const generateAccessToken = (user) => {
    return jwt.sign(
        { sub: user.email, email: user.email, userId: user._id, role: user.role },
        ACCESS_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { sub: user.email, email: user.email, userId: user._id, role: user.role },
        REFRESH_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        }
    );
};

const validateToken = (token, isRefreshToken = false) => {
    try {
        const secret = isRefreshToken ? REFRESH_SECRET : ACCESS_SECRET;
        const decoded = jwt.verify(token, secret);
        return {
            valid: true,
            decoded,
        };
    } catch (error) {
        return {
            valid: false,
            error: error.message,
        };
    }
};

const decryptToken = (token, isRefreshToken = false) => {
    try {
        const secret = isRefreshToken ? REFRESH_SECRET : ACCESS_SECRET;
        const decoded = jwt.decode(token, secret);

        if (!decoded) {
            return {
                success: false,
                error: "Invalid token format"
            };
        }

        return {
            success: true,
            data: {
                email: decoded.email,
                userId: decoded.userId,
                role: decoded.role,
                exp: decoded.exp,
                iat: decoded.iat
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

const generatePassword = () => {
    return generator.generate({
        length: 8,
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: false,
        strict: false,
    });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    encryptPassword,
    comparePassword,
    generatePassword,
    validateToken,
    decryptToken,
};
