import moment from 'moment';

export class DateHelper {
  static formatDate(date: string) {
    moment.locale('pt-br');
    const momentDate = moment(date);
    return momentDate.format('L');
  }
}
