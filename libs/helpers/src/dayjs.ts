import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';

// eslint-disable-next-line import/no-named-as-default-member
dayjs.extend(relativeTime);

export { dayjs };
