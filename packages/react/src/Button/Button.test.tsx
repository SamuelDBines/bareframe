import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
	it('renders label', () => {
		render(<Button>Save</Button>);
		expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
	});

	it('supports variants', () => {
		render(<Button variant="destructive">Delete</Button>);
		expect(screen.getByRole('button')).toHaveClass('bf-btn--destructive');
	});

	it('fires onPress', async () => {
		const user = userEvent.setup();
		const onPress = vi.fn();
		render(<Button onPress={onPress}>Go</Button>);
		await user.click(screen.getByRole('button'));
		expect(onPress).toHaveBeenCalledOnce();
	});

	it('is disabled when loading', () => {
		render(<Button loading>Saving</Button>);
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('has no axe violations', async () => {
		const { container } = render(<Button>Primary</Button>);
		expect(await axe(container)).toHaveNoViolations();
	});
});
