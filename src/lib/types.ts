export type ID = `${number}`;

export enum Role {
	User = 'user',
	Bot = 'bot',
	Admin = 'admin',
	Moderator = 'moderator',
	Developer = 'developer',
	Supporter = 'supporter',
	BetaTester = 'beta',
	Trusted = 'trusted'
}

export type UserID = ID;

/**
 * Can be negated with `!`
 *
 * Can be restricted to a role with `@`
 *
 * Can be restricted to a user with its ID
 */
export type Restrict = `@${Role}` | UserID | `!@${Role}` | `!${UserID}`;

/**
 * User shape as delivered by the backend API (no `passwordHash`). Mirrors the
 * `users` table; kept hand-written here so the static frontend stays free of
 * any `$db`/Drizzle imports.
 */
export interface UserData {
	id: UserID;
	username: string;
	email: string;
	firstName: string;
	lastName: string;
	roles: Role[];
	gender: 'male' | 'female';
	credit: number;
	birthdate: string | Date;
	lastOnline: string | Date;
	isOnline?: boolean;
	bannedUntil: string | Date | null;
	bannedReason: string | null;
}
