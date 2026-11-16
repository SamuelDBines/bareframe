/** Appended to LLM system prompts so generated copy avoids Unicode dash punctuation. */
export const NO_EMDASH_INSTRUCTION =
	'Do not use em dashes (Unicode U+2014) or en dashes (U+2013) in any generated user-facing text; use commas, periods, colons, or ASCII hyphens instead.';