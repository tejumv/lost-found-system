const validator = require('validator');

const validateRegisterInput = (data) => {
    const errors = {};
    
    // Email validation
    if (!validator.isEmail(data.email)) {
        errors.email = 'Valid email is required';
    }
    
    // Password validation
    if (!validator.isLength(data.password, { min: 6 })) {
        errors.password = 'Password must be at least 6 characters';
    }
    
    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
};

const validateItemInput = (data) => {
    const errors = {};
    
    if (!data.title || data.title.trim().length < 3) {
        errors.title = 'Title must be at least 3 characters';
    }
    
    if (!data.description || data.description.trim().length < 10) {
        errors.description = 'Description must be at least 10 characters';
    }
    
    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
};

module.exports = {
    validateRegisterInput,
    validateItemInput
};