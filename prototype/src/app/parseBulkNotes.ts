export type ParsedBulkNote = {
	index: number;
	where: string;
	issue: string;
};

const ISSUE_HEADER =
	/^(?:(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\s+issue|issue\s+(?:one|two|three|four|five|six|seven|eight|nine|ten|\d+))\s*:?\s*$/i;

const WORD_NUMBER: Record<string, number> = {
	one: 1,
	two: 2,
	three: 3,
	four: 4,
	five: 5,
	six: 6,
	seven: 7,
	eight: 8,
	nine: 9,
	ten: 10,
	first: 1,
	second: 2,
	third: 3,
	fourth: 4,
	fifth: 5,
	sixth: 6,
	seventh: 7,
	eighth: 8,
	ninth: 9,
	tenth: 10,
};

function headerIndex(line: string): number | null {
	const trimmed = line.trim();
	if (!ISSUE_HEADER.test(trimmed)) return null;
	const lower = trimmed.toLowerCase().replace(/:$/, '');
	const issueWord = lower.match(/^issue\s+(\w+|\d+)/);
	if (issueWord) {
		const token = issueWord[1]!;
		const n = Number(token);
		if (!Number.isNaN(n)) return n;
		return WORD_NUMBER[token] ?? null;
	}
	const ordinal = lower.match(/^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\s+issue/);
	if (ordinal) return WORD_NUMBER[ordinal[1]!] ?? null;
	return null;
}

type FieldKey = 'where' | 'issue';

const FIELD_START = /^\s*(where|issue|isse)\s*:\s*(.*)$/i;

function parseBlock(lines: string[], fallbackIndex: number): ParsedBulkNote | null {
	let where = '';
	let issue = '';
	let current: FieldKey | null = null;

	for (const raw of lines) {
		const line = raw.trimEnd();
		if (!line.trim()) continue;
		const m = FIELD_START.exec(line);
		if (m) {
			const key = m[1]!.toLowerCase();
			current = key === 'isse' || key === 'issue' ? 'issue' : 'where';
			const rest = m[2] ?? '';
			if (current === 'where') where = rest;
			else issue = rest;
			continue;
		}
		if (current === 'where') where = where ? `${where}\n${line}` : line;
		else if (current === 'issue') issue = issue ? `${issue}\n${line}` : line;
	}

	where = where.trim();
	issue = issue.trim();
	if (!issue && !where) return null;
	if (!issue && where) {
		issue = where;
		where = '';
	}
	return { index: fallbackIndex, where, issue };
}

/**
 * Parses owner-style review note blobs into discrete Where/Issue pairs.
 */
export function parseBulkNotes(text: string): ParsedBulkNote[] {
	const normalized = text.replace(/\r\n/g, '\n').trim();
	if (!normalized) return [];

	const lines = normalized.split('\n');
	const chunks: { index: number | null; body: string }[] = [];
	let buf: string[] = [];
	let pendingIndex: number | null = null;

	const flush = () => {
		const body = buf.join('\n').trim();
		if (body) chunks.push({ index: pendingIndex, body });
		buf = [];
		pendingIndex = null;
	};

	for (const line of lines) {
		const idx = headerIndex(line);
		if (idx !== null) {
			flush();
			pendingIndex = idx;
			continue;
		}
		if (!line.trim() && buf.length) {
			flush();
			continue;
		}
		if (!line.trim()) continue;
		buf.push(line);
	}
	flush();

	const out: ParsedBulkNote[] = [];
	let auto = 1;
	for (const chunk of chunks) {
		const n = chunk.index ?? auto;
		const parsed = parseBlock(chunk.body.split('\n'), n);
		if (parsed) {
			out.push({ ...parsed, index: n });
			auto = Math.max(auto, n + 1);
		}
	}

	return out.sort((a, b) => a.index - b.index);
}