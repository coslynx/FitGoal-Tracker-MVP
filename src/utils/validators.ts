import * as yup from 'yup';
import { User } from '@api/models/userModel';
import { Goal } from '@api/models/goalInterface';
import { ProgressEntryInput } from '@api/models/progressInterface';
import { PostInput } from '@api/models/postModel';
import { ValidationError } from '@utils/errors';
import { sanitizeInput } from '@utils/helpers';


const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/;

export const validateRegisterInput = (userData: User): { errors: any; isValid: boolean } => {
    const schema = yup.object().shape({
        firstName: yup.string().required('First name is required'),
        lastName: yup.string().required('Last name is required'),
        email: yup.string().email('Invalid email').required('Email is required'),
        password: yup.string().min(8, 'Password must be at least 8 characters').max(50, 'Password must be less than 50 characters').matches(passwordRegex, 'Password must contain at least one uppercase, one lowercase, one number and one special character').required('Password is required'),
        confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm Password is required')
    });
    try {
        schema.validateSync(userData, { abortEarly: false });
        return { errors: {}, isValid: true };
    } catch (error: any) {
        const errors = {};
        error.inner.forEach((err: any) => {
            errors[err.path] = err.message;
        });
        return { errors, isValid: false };
    }
};


export const validateLoginInput = (userData: { email: string; password: string }): { errors: any; isValid: boolean } => {
    const schema = yup.object().shape({
        email: yup.string().email('Invalid email').required('Email is required'),
        password: yup.string().min(8, 'Password must be at least 8 characters').max(50, 'Password must be less than 50 characters').required('Password is required'),
    });
    try {
        schema.validateSync(userData, { abortEarly: false });
        return { errors: {}, isValid: true };
    } catch (error: any) {
        const errors = {};
        error.inner.forEach((err: any) => {
            errors[err.path] = err.message;
        });
        return { errors, isValid: false };
    }
};

export const validateGoalInput = (goalData: Partial<Goal>): { errors: any; isValid: boolean } => {
    const schema = yup.object().shape({
        goalType: yup.string().required('Goal type is required'),
        targetValue: yup.number().positive().integer().required('Target value is required'),
        deadline: yup.date().min(new Date(), 'Deadline must be in the future').required('Deadline is required'),
    });
    try {
        schema.validateSync(goalData, { abortEarly: false });
        return { errors: {}, isValid: true };
    } catch (error: any) {
        const errors = {};
        error.inner.forEach((err: any) => {
            errors[err.path] = err.message;
        });
        return { errors, isValid: false };
    }
};

export const validateProgressInput = (progressData: ProgressEntryInput): { errors: any; isValid: boolean } => {
    const schema = yup.object().shape({
        userId: yup.string().required('User ID is required'),
        goalId: yup.string().required('Goal ID is required'),
        date: yup.date().required('Date is required'),
        progressValue: yup.number().min(0).required('Progress value is required'),
    });
    try {
        schema.validateSync(progressData, { abortEarly: false });
        return { errors: {}, isValid: true };
    } catch (error: any) {
        const errors = {};
        error.inner.forEach((err: any) => {
            errors[err.path] = err.message;
        });
        return { errors, isValid: false };
    }
};

export const validatePostInput = (postInput: PostInput): { errors: any; isValid: boolean } => {
    const schema = yup.object().shape({
        userId: yup.string().required('User ID is required'),
        content: yup.string().required('Content is required').min(1, 'Content must be at least 1 character'),
    });
    try {
        const sanitizedContent = sanitizeInput(postInput.content);
        schema.validateSync({ ...postInput, content: sanitizedContent }, { abortEarly: false });
        return { errors: {}, isValid: true };
    } catch (error: any) {
        const errors = {};
        error.inner.forEach((err: any) => {
            errors[err.path] = err.message;
        });
        return { errors, isValid: false };
    }
};

export const validateProfileUpdate = (userData: User): { errors: any; isValid: boolean } => {
    const schema = yup.object().shape({
        firstName: yup.string().required('First Name is required'),
        lastName: yup.string().required('Last Name is required'),
        email: yup.string().email('Invalid email').required('Email is required'),
    });
    try {
        schema.validateSync(userData, { abortEarly: false });
        return { errors: {}, isValid: true };
    } catch (error: any) {
        const errors = {};
        error.inner.forEach((err: any) => {
            errors[err.path] = err.message;
        });
        return { errors, isValid: false };
    }
};
```