import moment from 'moment';
import { MessageType } from '@adi_solanki21/resync_common_module';

export const formatMessage = (username: string, message: string, type: MessageType) => {
    return {
        username,
        message,
        type,
        time: moment().format('h:mm a')
    }
};
