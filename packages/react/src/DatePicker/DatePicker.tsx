import { forwardRef } from 'react';
import type { DateValue } from '@internationalized/date';
import {
	Button as RACButton,
	Calendar,
	CalendarCell,
	CalendarGrid,
	CalendarGridBody,
	CalendarGridHeader,
	CalendarHeaderCell,
	DateInput,
	DatePicker as RACDatePicker,
	DateSegment,
	Dialog,
	Group,
	Heading,
	Label,
	Popover,
	type DatePickerProps as RACDatePickerProps,
} from 'react-aria-components';
import { cn } from '../utils/cn';

export type DatePickerProps = RACDatePickerProps<DateValue> & {
	label?: string;
	className?: string;
};

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(
	{ label = 'Date', className, ...props },
	ref,
) {
	return (
		<RACDatePicker {...props} className={cn('bf-datepicker', className)} ref={ref}>
			<Label className="bf-field__label">{label}</Label>
			<Group className="bf-datepicker__group">
				<DateInput className="bf-input bf-datepicker__input">
					{(segment) => <DateSegment segment={segment} />}
				</DateInput>
				<RACButton className="btn btn-secondary btn-sm bf-datepicker__trigger" aria-label="Open calendar">
					📅
				</RACButton>
			</Group>
			<Popover className="bf-datepicker__popover" placement="bottom start" offset={8}>
				<Dialog className="bf-datepicker__dialog">
					<Calendar>
						<header className="bf-calendar__header">
							<RACButton slot="previous" aria-label="Previous month">
								‹
							</RACButton>
							<Heading />
							<RACButton slot="next" aria-label="Next month">
								›
							</RACButton>
						</header>
						<CalendarGrid className="bf-calendar__grid">
							<CalendarGridHeader>
								{(day) => <CalendarHeaderCell className="bf-calendar__dow">{day}</CalendarHeaderCell>}
							</CalendarGridHeader>
							<CalendarGridBody>
								{(date) => <CalendarCell date={date} className="bf-calendar__day" />}
							</CalendarGridBody>
						</CalendarGrid>
					</Calendar>
				</Dialog>
			</Popover>
		</RACDatePicker>
	);
});

DatePicker.displayName = 'DatePicker';
