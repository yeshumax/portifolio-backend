const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};
export const validateVerifyEmail = (req, res, next) => {
    const errors = [];
    const { email, token } = req.body;
    if (!email) {
        errors.push({ field: 'email', message: 'Email is required' });
    }
    else if (!validateEmail(email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    else if (email.length > 100) {
        errors.push({ field: 'email', message: 'Email must be less than 100 characters' });
    }
    if (!token) {
        errors.push({ field: 'token', message: 'Verification token is required' });
    }
    else if (typeof token !== 'string' || token.length !== 64) {
        errors.push({ field: 'token', message: 'Invalid verification token format' });
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    next();
};
export const validateResendVerification = (req, res, next) => {
    const errors = [];
    const { email } = req.body;
    if (!email) {
        errors.push({ field: 'email', message: 'Email is required' });
    }
    else if (!validateEmail(email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    else if (email.length > 100) {
        errors.push({ field: 'email', message: 'Email must be less than 100 characters' });
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    next();
};
