import { useState } from 'react';
import type { AuthUser } from '../auth/AuthContext';

type Props = {
	user: AuthUser;
	size?: number;
	className?: string;
};

export function UserAvatar({ user, size = 32, className = 'user-avatar' }: Props) {
	const [broken, setBroken] = useState(false);
	const showImage = Boolean(user.avatarUrl) && !broken;
	const initial = (user.name?.trim() || user.login).slice(0, 1).toUpperCase();

	if (showImage) {
		return (
			<img
				className={className}
				src={user.avatarUrl!}
				alt=""
				width={size}
				height={size}
				data-testid="user-avatar-image"
				onError={() => setBroken(true)}
			/>
		);
	}

	return (
		<span className={`${className} user-avatar--initial`} aria-hidden data-testid="user-avatar-initials">
			{initial}
		</span>
	);
}