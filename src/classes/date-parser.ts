export class DateParser {

  static parse = (date: Date): string => {
    if (date) {
      let parsedDate = date.toISOString().substring(0, 10).match(/^(\d{4})\-(\d{2})\-(\d{2}))/);
      if (parsedDate) {
        let dateString = `${parsedDate[3]}/${parsedDate[2]}/${parsedDate[1]}`;
        return dateString;
      }
    }
    return null;
  }

}
