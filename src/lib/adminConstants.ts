/**
 * Shared visual constants for the admin dashboard. Roles are rendered on three
 * different pages (RizinOS, Minecraft, Discord), so their chip styles live here
 * to stay identical everywhere.
 */

/** Tailwind classes for a role chip, keyed by role name. */
export const ROLE_CHIP: Record<string, string> = {
	admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
	moderator: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
	developer: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
	supporter: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
	betatester: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
	beta: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
	trusted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
	user: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
	bot: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
};

/** Fallback chip classes for an unknown role. */
export const CHIP_FALLBACK = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
