const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (password.length > 100) {
        errors.push('Password must be less than 100 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
export const validateProfileUpdate = (req, res, next) => {
    const errors = [];
    const { name, email, currentPassword, newPassword, confirmNewPassword } = req.body;
    // Name validation (if provided)
    if (name !== undefined) {
        if (!name || name.trim().length === 0) {
            errors.push({ field: 'name', message: 'Name is required' });
        }
        else if (name.trim().length < 3) {
            errors.push({ field: 'name', message: 'Name must be at least 3 characters long' });
        }
        else if (name.trim().length > 50) {
            errors.push({ field: 'name', message: 'Name must be less than 50 characters long' });
        }
        else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
            errors.push({ field: 'name', message: 'Name can only contain letters and spaces' });
        }
    }
    // Email validation (if provided)
    if (email !== undefined) {
        if (!email) {
            errors.push({ field: 'email', message: 'Email is required' });
        }
        else if (!validateEmail(email)) {
            errors.push({ field: 'email', message: 'Please enter a valid email address' });
        }
        else if (email.length > 100) {
            errors.push({ field: 'email', message: 'Email must be less than 100 characters' });
        }
    }
    // Password validation (if changing password)
    if (newPassword !== undefined) {
        if (!currentPassword) {
            errors.push({ field: 'currentPassword', message: 'Current password is required to change password' });
        }
        if (newPassword) {
            const passwordValidation = validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                passwordValidation.errors.forEach(error => {
                    errors.push({ field: 'newPassword', message: error });
                });
            }
        }
        if (confirmNewPassword !== undefined && newPassword !== confirmNewPassword) {
            errors.push({ field: 'confirmNewPassword', message: 'New passwords do not match' });
        }
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
export const validateAccountDeletion = (req, res, next) => {
    const errors = [];
    const { password, confirmation } = req.body;
    if (!password) {
        errors.push({ field: 'password', message: 'Password is required to delete account' });
    }
    if (!confirmation) {
        errors.push({ field: 'confirmation', message: 'Please type DELETE to confirm account deletion' });
    }
    else if (confirmation !== 'DELETE') {
        errors.push({ field: 'confirmation', message: 'Please type DELETE exactly to confirm account deletion' });
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
