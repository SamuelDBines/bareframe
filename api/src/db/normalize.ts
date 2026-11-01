/** node-pg returns BIGINT/int8 as string; normalize for strict equality checks. */
export function normalizeUserId(id: number | string): number {
	return typeof id === 'number' ? id : Number(id);
}

export function mapUserRow<T extends { id: number | string }>(row: T): T & { id: number } {
	return { ...row, id: normalizeUserId(row.id) };
}

export function mapProjectRow<T extends { owner_user_id: number | string; version: number | string }>(
	row: T,
): T & { owner_user_id: number; version: number } {
	return {
		...row,
		owner_user_id: normalizeUserId(row.owner_user_id),
		version: Number(row.version),
	};
}
