import moment from 'moment';
import { MessageType } from '../../common_types';

export const formatMessage = (username: string, message: string, type: MessageType) => {
    return {
        username,
        message,
        type,
        time: moment().format('h:mm a')
    }
};
