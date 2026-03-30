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
    return {
        isValid: errors.length === 0,
        errors
    };
};
const checkPasswordStrength = (password) => {
    const feedback = [];
    let score = 0;
    // Length check
    if (password.length >= 8)
        score += 1;
    else
        feedback.push('Add at least 8 characters');
    // Uppercase check
    if (/[A-Z]/.test(password))
        score += 1;
    else
        feedback.push('Add uppercase letter');
    // Lowercase check
    if (/[a-z]/.test(password))
        score += 1;
    else
        feedback.push('Add lowercase letter');
    // Number check
    if (/\d/.test(password))
        score += 1;
    else
        feedback.push('Add a number');
    // Special character check
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
        score += 1;
    else
        feedback.push('Add special character');
    let strength;
    if (score <= 2)
        strength = 'weak';
    else if (score <= 4)
        strength = 'medium';
    else
        strength = 'strong';
    return { strength, feedback };
};
const validateName = (name) => {
    if (!name || name.trim().length === 0) {
        return { isValid: false, message: 'Name is required' };
    }
    if (name.trim().length < 2) {
        return { isValid: false, message: 'Name must be at least 2 characters long' };
    }
    if (name.trim().length > 50) {
        return { isValid: false, message: 'Name must be less than 50 characters long' };
    }
    if (!/^[a-zA-Z\s\-']+$/.test(name.trim())) {
        return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    return { isValid: true, message: '' };
};
export const validateLogin = (req, res, next) => {
    const errors = [];
    const { email, password } = req.body;
    if (!email) {
        errors.push({ field: 'email', message: 'Email is required' });
    }
    else if (!validateEmail(email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    else if (email.length > 100) {
        errors.push({ field: 'email', message: 'Email must be less than 100 characters' });
    }
    if (!password) {
        errors.push({ field: 'password', message: 'Password is required' });
    }
    else if (password.length < 8) {
        errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }
    else if (password.length > 100) {
        errors.push({ field: 'password', message: 'Password must be less than 100 characters' });
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
export const validateRegister = (req, res, next) => {
    const errors = [];
    const { name, email, password, confirmPassword, role } = req.body;
    // Name validation
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
        errors.push({ field: 'name', message: nameValidation.message });
    }
    // Email validation
    if (!email) {
        errors.push({ field: 'email', message: 'Email is required' });
    }
    else if (!validateEmail(email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    else if (email.length > 100) {
        errors.push({ field: 'email', message: 'Email must be less than 100 characters' });
    }
    // Password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        passwordValidation.errors.forEach(error => {
            errors.push({ field: 'password', message: error });
        });
    }
    // Confirm password validation
    if (!confirmPassword) {
        errors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
    }
    else if (password !== confirmPassword) {
        errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }
    // Role validation
    if (!role) {
        errors.push({ field: 'role', message: 'Please select an account type' });
    }
    else if (role !== 'user' && role !== 'admin') {
        errors.push({ field: 'role', message: 'Invalid account type selected' });
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
export const validateUpdateProfile = (req, res, next) => {
    const errors = [];
    const { name, email, currentPassword, newPassword, confirmNewPassword } = req.body;
    // Name validation (if provided)
    if (name !== undefined) {
        const nameValidation = validateName(name);
        if (!nameValidation.isValid) {
            errors.push({ field: 'name', message: nameValidation.message });
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
    if (newPassword) {
        if (!currentPassword) {
            errors.push({ field: 'currentPassword', message: 'Current password is required to change password' });
        }
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            passwordValidation.errors.forEach(error => {
                errors.push({ field: 'newPassword', message: error });
            });
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
export { checkPasswordStrength };
