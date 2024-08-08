interface DataFormatter<Data, FormattedData> {
  format(data: Data): FormattedData;
}

export default DataFormatter;
