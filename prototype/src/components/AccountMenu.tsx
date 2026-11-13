import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { AuthUser } from '../auth/AuthContext';

type Props = {
	user: AuthUser;
	onSignOut: () => void | Promise<void>;
	settingsTo?: string;
};

export function AccountMenu({ user, onSignOut, settingsTo = '/app/settings' }: Props) {
	const menuId = useId();
	const rootRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const itemRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);
	const [open, setOpen] = useState(false);
	const { pathname } = useLocation();

	const close = useCallback(() => {
		setOpen(false);
		triggerRef.current?.focus();
	}, []);

	const openMenu = useCallback(() => {
		setOpen(true);
		requestAnimationFrame(() => itemRefs.current[0]?.focus());
	}, []);

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (!open) return;
		const onPointer = (e: MouseEvent) => {
			if (rootRef.current?.contains(e.target as Node)) return;
			close();
		};
		document.addEventListener('mousedown', onPointer);
		return () => document.removeEventListener('mousedown', onPointer);
	}, [open, close]);

	const items = [
		{ kind: 'link' as const, label: 'Settings', to: settingsTo },
		{ kind: 'action' as const, label: 'Sign out' },
	];

	const focusItem = (index: number) => {
		const el = itemRefs.current[index];
		el?.focus();
	};

	const onTriggerKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			if (!open) openMenu();
			else focusItem(e.key === 'ArrowDown' ? 0 : items.length - 1);
			return;
		}
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (open) close();
			else openMenu();
		}
		if (e.key === 'Escape' && open) {
			e.preventDefault();
			close();
		}
	};

	const onMenuKeyDown = (e: React.KeyboardEvent) => {
		const current = itemRefs.current.findIndex((el) => el === document.activeElement);
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			focusItem((current + 1 + items.length) % items.length);
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			focusItem((current - 1 + items.length) % items.length);
		}
		if (e.key === 'Home') {
			e.preventDefault();
			focusItem(0);
		}
		if (e.key === 'End') {
			e.preventDefault();
			focusItem(items.length - 1);
		}
	};

	const displayName = user.name?.trim() || user.login;

	return (
		<div className="account-menu" ref={rootRef}>
			<button
				ref={triggerRef}
				type="button"
				className="account-menu__trigger"
				id={`${menuId}-trigger`}
				data-testid="account-menu-trigger"
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={menuId}
				onClick={() => (open ? close() : openMenu())}
				onKeyDown={onTriggerKeyDown}
			>
				{user.avatarUrl ? (
					<img className="user-avatar" src={user.avatarUrl} alt="" width={32} height={32} />
				) : (
					<span className="user-avatar user-avatar--initial" aria-hidden>
						{user.login.slice(0, 1).toUpperCase()}
					</span>
				)}
				<span className="account-menu__name">{displayName}</span>
			</button>
			{open ? (
				<div
					id={menuId}
					role="menu"
					aria-labelledby={`${menuId}-trigger`}
					className="account-menu__panel"
					data-testid="account-menu-panel"
					onKeyDown={onMenuKeyDown}
				>
					{items.map((item, i) =>
						item.kind === 'link' ? (
							<Link
								key={item.label}
								ref={(el) => {
									itemRefs.current[i] = el;
								}}
								role="menuitem"
								tabIndex={-1}
								to={item.to}
								className="account-menu__item"
								data-testid="account-menu-settings"
								onClick={() => setOpen(false)}
							>
								{item.label}
							</Link>
						) : (
							<button
								key={item.label}
								ref={(el) => {
									itemRefs.current[i] = el;
								}}
								type="button"
								role="menuitem"
								tabIndex={-1}
								className="account-menu__item"
								data-testid="account-menu-sign-out"
								onClick={() => {
									setOpen(false);
									void onSignOut();
								}}
							>
								{item.label}
							</button>
						),
					)}
				</div>
			) : null}
		</div>
	);
}
