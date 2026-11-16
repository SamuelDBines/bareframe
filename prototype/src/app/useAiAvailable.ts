import { useContext } from 'react';
import { useReview } from './ReviewContext';
import { AuthContext } from '../auth/AuthContext';

/**
 * Whether AI features can run here: the server says AI is configured, and no AI request has
 * come back as unavailable. AI-only controls are hidden when this is false.
 */
export function useAiAvailable(): boolean {
	const review = useReview();
	return useAiConfigured() && !review?.aiUnavailable;
}

/** Whether this workspace has AI at all (a temporary outage still counts as configured). */
export function useAiConfigured(): boolean {
	return useContext(AuthContext)?.aiAvailable ?? true;
}
