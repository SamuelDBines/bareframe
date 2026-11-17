import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
	projectId: string;
	projectName: string;
	onDeleted: () => void;
	onDelete: (projectId: string) => Promise<void>;
};

export function ProjectCardMenu({ projectId, projectName, onDeleted, onDelete }: Props) {
	const [open, setOpen] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const wrapRef = useRef<HTMLDivElement>(null);
	const menuId = useId();

	useEffect(() => {
		if (!open) return;
		const close = (e: MouseEvent) => {
			if (wrapRef.current?.contains(e.target as Node)) return;
			setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		document.addEventListener('mousedown', close);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', close);
			document.removeEventListener('keydown', onKey);
		};
	}, [open]);

	async function confirmDelete() {
		setBusy(true);
		setError(null);
		try {
			await onDelete(projectId);
			onDeleted();
		} catch (e) {
			setError(e instanceof Error ? e.message : 'We could not delete that project.');
		} finally {
			setBusy(false);
			setConfirmOpen(false);
		}
	}

	return (
		<>
			<div className="project-card__menu" ref={wrapRef}>
				<button
					type="button"
					className="btn btn-ghost btn-sm btn-icon project-card__menu-btn"
					aria-haspopup="menu"
					aria-expanded={open}
					aria-controls={menuId}
					data-testid={`project-menu-${projectId}`}
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						setOpen((v) => !v);
					}}
				>
					<span aria-hidden>⋯</span>
					<span className="sr-only">Project options for {projectName}</span>
				</button>
				{open ? (
					<div className="project-card__menu-popover" role="menu" id={menuId}>
						<button
							type="button"
							role="menuitem"
							className="project-card__menu-danger"
							onClick={() => {
								setOpen(false);
								setConfirmOpen(true);
							}}
						>
							Delete project
						</button>
					</div>
				) : null}
			</div>
			{confirmOpen
				? createPortal(
						<div className="bx-dialog-backdrop" role="presentation" onMouseDown={() => !busy && setConfirmOpen(false)}>
							<div
								className="bx-dialog bx-dialog--danger"
								role="alertdialog"
								aria-labelledby="delete-project-title"
								aria-describedby="delete-project-desc"
								data-testid="delete-project-dialog"
								onMouseDown={(e) => e.stopPropagation()}
							>
								<h2 id="delete-project-title">Delete “{projectName}”?</h2>
								<p id="delete-project-desc">
									This removes the project, flow map, designs and reviews. This cannot be undone.
								</p>
								{error ? (
									<p className="bx-notice bx-notice--warn" role="alert">
										{error}
									</p>
								) : null}
								<div className="bx-dialog__actions">
									<button type="button" className="btn btn-secondary" disabled={busy} onClick={() => setConfirmOpen(false)}>
										Cancel
									</button>
									<button
										type="button"
										className="btn btn-danger"
										disabled={busy}
										data-testid="confirm-delete-project"
										onClick={() => void confirmDelete()}
									>
										{busy ? 'Deleting…' : 'Delete project'}
									</button>
								</div>
							</div>
						</div>,
						document.body,
					)
				: null}
		</>
	);
}