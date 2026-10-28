import { forwardRef } from 'react';
import type { DateValue } from '@internationalized/date';
import {
	Calendar as RACCalendar,
	CalendarCell,
	CalendarGrid,
	CalendarGridBody,
	CalendarGridHeader,
	CalendarHeaderCell,
	Heading,
	Button as RACButton,
	type CalendarProps as RACCalendarProps,
} from 'react-aria-components';
import { cn } from '../utils/cn';

export type CalendarProps = RACCalendarProps<DateValue> & {
	className?: string;
};

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
	{ className, ...props },
	ref,
) {
	return (
		<RACCalendar {...props} className={cn('bf-calendar', className)} ref={ref}>
			<div className="bf-calendar__header">
				<RACButton slot="previous">‹</RACButton>
				<Heading />
				<RACButton slot="next">›</RACButton>
			</div>
			<CalendarGrid className="bf-calendar__grid">
				<CalendarGridHeader>
					{(day) => <CalendarHeaderCell className="bf-calendar__dow">{day}</CalendarHeaderCell>}
				</CalendarGridHeader>
				<CalendarGridBody>
					{(date) => (
						<CalendarCell date={date} className="bf-calendar__day" />
					)}
				</CalendarGridBody>
			</CalendarGrid>
		</RACCalendar>
	);
});

Calendar.displayName = 'Calendar';
