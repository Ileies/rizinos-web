import type { Component } from 'svelte';
import {
	Bug,
	Lightbulb,
	MessagesSquare,
	Newspaper,
	Scale,
	ShieldAlert,
	UserRound
} from '@lucide/svelte';
import { PUBLIC_ORIGIN } from '$app/env/public';
import * as messages from '#lib/messages.svelte.js';

/**
 * Contact form configuration, mirrored from the backend (`rizinos/src/lib/server/contact/topics.ts`).
 * Topics, detail fields and limits must stay in sync with it. The server is authoritative; this copy
 * only drives the UI and instant client-side validation.
 */

export type TopicId = 'general' | 'account' | 'bug' | 'feedback' | 'security' | 'press' | 'legal';
export type Mailbox = 'support' | 'security' | 'press' | 'privacy';

export interface FieldDef {
	key: string;
	type: 'text' | 'textarea' | 'select';
	max: number;
	options?: readonly string[];
	rows?: number;
}

export interface TopicDef {
	id: TopicId;
	icon: Component<{ class?: string }>;
	mailbox: Mailbox;
	fields: readonly FieldDef[];
	/** Message key of a notice shown above the form fields for this topic. */
	notice?: string;
	/** Offer to attach browser, OS and screen info (bug reports). */
	environment?: boolean;
}

export const TOPICS: readonly TopicDef[] = [
	{ id: 'general', icon: MessagesSquare, mailbox: 'support', fields: [] },
	{
		id: 'account',
		icon: UserRound,
		mailbox: 'support',
		fields: [
			{
				key: 'problem',
				type: 'select',
				max: 40,
				options: ['login', 'password_reset', 'email_confirm', 'delete_account', 'other']
			},
			{ key: 'username', type: 'text', max: 40 }
		]
	},
	{
		id: 'bug',
		icon: Bug,
		mailbox: 'support',
		environment: true,
		fields: [
			{
				key: 'area',
				type: 'select',
				max: 40,
				options: [
					'desktop',
					'apps',
					'files',
					'terminal',
					'account',
					'website',
					'minecraft',
					'discord',
					'other'
				]
			},
			{ key: 'steps', type: 'textarea', max: 2000, rows: 4 },
			{ key: 'expected', type: 'textarea', max: 1000, rows: 3 }
		]
	},
	{
		id: 'feedback',
		icon: Lightbulb,
		mailbox: 'support',
		fields: [
			{
				key: 'kind',
				type: 'select',
				max: 40,
				options: ['feature', 'improvement', 'praise', 'other']
			}
		]
	},
	{
		id: 'security',
		icon: ShieldAlert,
		mailbox: 'security',
		notice: 'contact_security_hint',
		fields: [
			{
				key: 'severity',
				type: 'select',
				max: 40,
				options: ['unknown', 'low', 'medium', 'high', 'critical']
			},
			{ key: 'affected', type: 'text', max: 300 }
		]
	},
	{
		id: 'press',
		icon: Newspaper,
		mailbox: 'press',
		fields: [
			{ key: 'outlet', type: 'text', max: 120 },
			{ key: 'deadline', type: 'text', max: 40 }
		]
	},
	{
		id: 'legal',
		icon: Scale,
		mailbox: 'privacy',
		notice: 'contact_legal_hint',
		fields: [
			{
				key: 'kind',
				type: 'select',
				max: 40,
				options: ['privacy_request', 'dmca', 'abuse', 'other']
			},
			{ key: 'reference', type: 'text', max: 500 }
		]
	}
];

export const LIMITS = {
	name: 80,
	email: 254,
	subject: 150,
	message: 5000,
	minMessage: 10,
	attachments: 3,
	attachmentBytes: 5 * 1024 * 1024
} as const;

export const RETENTION_MONTHS = 12;
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const;
export const MAILBOXES: readonly Mailbox[] = ['support', 'security', 'press', 'privacy'];

export const mailboxAddress = (mailbox: Mailbox) => `${mailbox}@${PUBLIC_ORIGIN}`;

export function isTopicId(value: unknown): value is TopicId {
	return typeof value === 'string' && TOPICS.some((t) => t.id === value);
}

export function topicById(id: TopicId): TopicDef {
	return TOPICS.find((t) => t.id === id)!;
}

type MessageFn = (params?: Record<string, string | number>) => string;

/**
 * Looks up a message by a computed key (`contact_f_<topic>_<field>` and friends). Returns an empty
 * string if the key does not exist. Reads the reactive locale, so it works inside `$derived` and templates.
 */
export function t(key: string, params?: Record<string, string | number>): string {
	const fn = (messages as unknown as Record<string, MessageFn | undefined>)[key];
	return typeof fn === 'function' ? fn(params) : '';
}

export const fieldLabel = (topic: TopicId, key: string) => t(`contact_f_${topic}_${key}`);
export const fieldPlaceholder = (topic: TopicId, key: string) => t(`contact_p_${topic}_${key}`);
export const optionLabel = (topic: TopicId, key: string, option: string) =>
	t(`contact_o_${topic}_${key}_${option}`);

export type ErrorCode = 'required' | 'too_short' | 'too_long' | 'invalid_email' | 'invalid_option';
export type FieldErrors = Record<string, ErrorCode>;

export function errorText(code: ErrorCode, field: string, topic?: TopicDef): string {
	switch (code) {
		case 'required':
			return messages.contact_err_required();
		case 'too_short':
			return messages.contact_err_too_short({ min: LIMITS.minMessage });
		case 'too_long': {
			const max =
				field in LIMITS
					? LIMITS[field as keyof typeof LIMITS]
					: (topic?.fields.find((f) => f.key === field)?.max ?? LIMITS.message);
			return messages.contact_err_too_long({ max });
		}
		case 'invalid_email':
			return messages.contact_err_invalid_email();
		case 'invalid_option':
			return messages.contact_err_invalid_option();
	}
}

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

export interface FormValues {
	name: string;
	email: string;
	subject: string;
	message: string;
	details: Record<string, string>;
}

/** Same rules as the server's `validateContact`, for instant feedback. Returns field -> error code. */
export function validateClient(topic: TopicDef, v: FormValues): FieldErrors {
	const errors: FieldErrors = {};
	const name = v.name.trim();
	if (!name) errors.name = 'required';
	else if (name.length > LIMITS.name) errors.name = 'too_long';

	const email = v.email.trim();
	if (!email) errors.email = 'required';
	else if (email.length > LIMITS.email || !EMAIL_RE.test(email)) errors.email = 'invalid_email';

	const subject = v.subject.trim();
	if (!subject) errors.subject = 'required';
	else if (subject.length > LIMITS.subject) errors.subject = 'too_long';

	const message = v.message.trim();
	if (!message) errors.message = 'required';
	else if (message.length < LIMITS.minMessage) errors.message = 'too_short';
	else if (message.length > LIMITS.message) errors.message = 'too_long';

	for (const field of topic.fields) {
		const value = (v.details[field.key] ?? '').trim();
		if (!value) continue;
		if (value.length > field.max) errors[field.key] = 'too_long';
		else if (field.options && !field.options.includes(value)) errors[field.key] = 'invalid_option';
	}
	return errors;
}

/** Browser, OS, screen and language, attached to bug reports when the user agrees. */
export function collectEnvironment(): string {
	const parts = [
		navigator.userAgent,
		`screen ${screen.width}x${screen.height} @${window.devicePixelRatio}x`,
		`viewport ${window.innerWidth}x${window.innerHeight}`,
		`lang ${navigator.language}`,
		`tz ${Intl.DateTimeFormat().resolvedOptions().timeZone}`
	];
	return parts.join(' | ').slice(0, 600);
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
