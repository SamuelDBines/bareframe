import type pg from 'pg';
import { randomToken, hashToken } from '../auth/crypto.js';

export type ProductPackageRow = {
  id: string;
  owner_user_id: number;
  name: string;
  status: string;
  revision: number;
  document: Record<string, unknown>;
  designer_project_id: string | null;
  share_token_hash: string | null;
  created_at: Date;
  updated_at: Date;
};

export type PackageJobRow = {
  id: string;
  owner_user_id: number;
  package_id: string | null;
  status: string;
  stage: string | null;
  progress: Record<string, unknown>;
  intake: Record<string, unknown>;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
};

export class PackageAccessError extends Error {
  constructor(
    message: string,
    public status = 403,
  ) {
    super(message);
    this.name = 'PackageAccessError';
  }
}

export async function listPackagesForUser(pool: pg.Pool, userId: number) {
  const { rows } = await pool.query<{
    id: string;
    name: string;
    status: string;
    revision: number;
    updated_at: Date;
  }>(
    `SELECT id, name, status, revision, updated_at FROM product_packages WHERE owner_user_id = $1 ORDER BY updated_at DESC`,
    [userId],
  );
  return rows;
}

export async function getPackageById(pool: pg.Pool, id: string) {
  const { rows } = await pool.query<ProductPackageRow>(`SELECT * FROM product_packages WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function assertPackageOwner(pool: pg.Pool, packageId: string, userId: number) {
  const pkg = await getPackageById(pool, packageId);
  if (!pkg) throw new PackageAccessError('Not found', 404);
  if (pkg.owner_user_id !== userId) throw new PackageAccessError('Forbidden', 403);
  return pkg;
}

export async function createPackageJob(pool: pg.Pool, userId: number, intake: Record<string, unknown>) {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO package_generation_jobs (owner_user_id, intake) VALUES ($1, $2) RETURNING id`,
    [userId, JSON.stringify(intake)],
  );
  return rows[0]!.id;
}

export async function getPackageJob(pool: pg.Pool, jobId: string) {
  const { rows } = await pool.query<PackageJobRow>(`SELECT * FROM package_generation_jobs WHERE id = $1`, [jobId]);
  return rows[0] ?? null;
}

export async function updatePackageJob(
  pool: pg.Pool,
  jobId: string,
  patch: Partial<Pick<PackageJobRow, 'status' | 'stage' | 'progress' | 'package_id' | 'error_message'>>,
) {
  const fields: string[] = [];
  const values: unknown[] = [jobId];
  let i = 2;
  for (const key of ['status', 'stage', 'progress', 'package_id', 'error_message'] as const) {
    if (patch[key] !== undefined) {
      fields.push(`${key} = $${i++}`);
      values.push(key === 'progress' ? JSON.stringify(patch[key]) : patch[key]);
    }
  }
  fields.push('updated_at = NOW()');
  await pool.query(`UPDATE package_generation_jobs SET ${fields.join(', ')} WHERE id = $1`, values);
}

export async function insertProductPackage(
  pool: pg.Pool,
  userId: number,
  name: string,
  document: Record<string, unknown>,
  designerProjectId: string,
  shareToken: string,
) {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO product_packages (owner_user_id, name, status, document, designer_project_id, share_token, share_token_hash)
     VALUES ($1, $2, 'in_review', $3, $4, $5, $6) RETURNING id`,
    [userId, name, JSON.stringify(document), designerProjectId, shareToken, hashToken(shareToken)],
  );
  return rows[0]!.id;
}

export async function updateProductPackageDocument(
  pool: pg.Pool,
  packageId: string,
  document: Record<string, unknown>,
  patch?: { status?: string; revision?: number },
) {
  await pool.query(
    `UPDATE product_packages SET document = $2, status = COALESCE($3, status), revision = COALESCE($4, revision), updated_at = NOW() WHERE id = $1`,
    [packageId, JSON.stringify(document), patch?.status ?? null, patch?.revision ?? null],
  );
}

export async function getUsage(pool: pg.Pool, userId: number) {
  const { rows } = await pool.query<{ packages_this_month: number; period_start: string }>(
    `SELECT packages_this_month, period_start FROM user_package_usage WHERE user_id = $1`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function incrementUsage(pool: pg.Pool, userId: number) {
  await pool.query(
    `INSERT INTO user_package_usage (user_id, packages_this_month, period_start)
     VALUES ($1, 1, date_trunc('month', CURRENT_DATE)::date)
     ON CONFLICT (user_id) DO UPDATE SET
       packages_this_month = CASE
         WHEN user_package_usage.period_start < date_trunc('month', CURRENT_DATE)::date THEN 1
         ELSE user_package_usage.packages_this_month + 1
       END,
       period_start = date_trunc('month', CURRENT_DATE)::date`,
    [userId],
  );
}

export async function canGeneratePackage(pool: pg.Pool, userId: number, monthlyLimit: number): Promise<boolean> {
  const usage = await getUsage(pool, userId);
  if (!usage) return true;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  if (new Date(usage.period_start) < monthStart) return true;
  return usage.packages_this_month < monthlyLimit;
}

export function mintShareToken(): { token: string; hash: string } {
  const token = randomToken(24);
  return { token, hash: hashToken(token) };
}

export async function setPackageShareToken(pool: pg.Pool, packageId: string, tokenHash: string) {
  await pool.query(`UPDATE product_packages SET share_token_hash = $2, updated_at = NOW() WHERE id = $1`, [
    packageId,
    tokenHash,
  ]);
}

export async function getPackageByShareToken(pool: pg.Pool, token: string) {
  const { rows } = await pool.query<ProductPackageRow>(
    `SELECT * FROM product_packages WHERE share_token = $1 OR share_token_hash = $2`,
    [token, hashToken(token)],
  );
  return rows[0] ?? null;
}

export function resetPackageTablesForTests(pool: pg.Pool) {
  return pool.query(`TRUNCATE product_packages, package_generation_jobs, user_package_usage RESTART IDENTITY CASCADE`);
}
