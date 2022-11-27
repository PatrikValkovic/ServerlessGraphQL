import { ShieldFieldType } from './types';
import { allow } from './rules';

export const Query: ShieldFieldType<'Query'> = {
    onlineUsers: allow,
};
