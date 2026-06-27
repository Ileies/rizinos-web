import { z } from 'zod';

const yearsAgo = (years: number): number => {
	const date = new Date();
	date.setFullYear(date.getFullYear() - years);
	return date.getTime();
};

export const minAge = yearsAgo(12);
export const maxAge = yearsAgo(80);

// Zod schema for signup form validation
export const formSchema = z.object({
	gender: z.enum(['male', 'female']),
	birthdate: z.iso.date('Must be in YYYY-MM-DD format').refine((date) => {
		const dateTime = new Date(date).getTime();
		return !(dateTime < minAge || dateTime > maxAge);
	}, 'You must be between 12 and 80 years old'),
	firstName: z
		.string()
		.trim()
		.min(1, 'First name is required')
		.max(50, 'First name must be 50 characters or less')
		.regex(/^[A-Za-zÀ-ÖØ-öø-ÿ'.-]+(?: [A-Za-zÀ-ÖØ-öø-ÿ'.-]+)*$/, 'Invalid First name format'),
	lastName: z
		.string()
		.trim()
		.min(1, 'Last name is required')
		.max(50, 'Last name must be 50 characters or less')
		.regex(/^[A-Za-zÀ-ÖØ-öø-ÿ'.-]+(?: [A-Za-zÀ-ÖØ-öø-ÿ'.-]+)*$/, 'Invalid Last name format'),
	username: z
		.string()
		.min(5, 'Username must be at least 5 characters')
		.max(20, 'Username must be 20 characters or less')
		.regex(
			/^[a-z][a-z0-9]*$/,
			'Username must start with a letter and contain only lowercase letters and numbers'
		),
	password: z
		.string()
		.min(10, 'Password must be at least 10 characters')
		.max(71, 'Password must be 71 characters or less')
		.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
		.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
		.regex(/\d/, 'Password must contain at least one number')
		.regex(/[\W_]/, 'Password must contain at least one special character'),
	email: z.email('Invalid email address')
});

// Export the type for better TypeScript support
export type FormData = z.infer<typeof formSchema>;
