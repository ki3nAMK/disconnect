import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';

const TimeHelper = {
	moment(inp?: moment.MomentInput): moment.Moment {
		// Get the current time in UTC
		const utcTime = momentTimezone.utc(inp);

		// Convert the UTC time to the Japan time zone
		const jpTime = utcTime.tz('Asia/Tokyo');

		return jpTime;
	},
	dateJpNow(): moment.Moment {
		// Get the current time in UTC
		const utcNow = momentTimezone.utc();

		// Convert the UTC time to the Japan time zone
		const jpNow = utcNow.tz('Asia/Tokyo');

		return jpNow;
	},
	dateJpNowToDate(): Date {
		// Get the current time in UTC
		const utcNow = momentTimezone.utc();

		// Convert the UTC time to the Japan time zone
		const jpNow = utcNow.tz('Asia/Tokyo');

		return jpNow.toDate();
	},
	formatFileName: 'YYYYMMDD-HHmmss',
	formatDate: 'YYYY-MM-DD',
	getAllDays(start: any, end: any) {
		const days = [];
		const current = start.clone();
		while (current.isSameOrBefore(end)) {
			days.push(current.format('YYYY-MM-DD'));
			current.add(1, 'day');
		}
		return days;
	},
	getAllMonths(start: any, end: any) {
		const months = [];
		const current = start.clone().startOf('month');
		while (current.isSameOrBefore(end)) {
			months.push(current.format('YYYY-MM'));
			current.add(1, 'month');
		}
		return months;
	},
	getAllYears(start: any, end: any) {
		const years = [];
		const current = start.clone().startOf('year');
		while (current.isSameOrBefore(end)) {
			years.push(current.format('YYYY'));
			current.add(1, 'year');
		}
		return years;
	},
	// Helper functions
};

export default TimeHelper;
