exports.getAirtableRecords = (table, options) => {
  let records = [];
  const params = {
    view: 'Grid view',
    pageSize: 15,
  };

  Object.assign(params, options);

  return new Promise((resolve, reject) => {
    // Cache results if called already
    if (records.length > 0) {
      resolve(records);
    }

    const processPage = (partialRecords, fetchNextPage) => {
      records = [...records, ...partialRecords];
      fetchNextPage();
    };

    const processRecords = err => {
      if (err) {
        reject(err);
        return;
      }

      resolve(records);
    };

    table.select(params).eachPage(processPage, processRecords);
  });
};

exports.updateRecord = (table, recordId, fieldsToUpdate) => {
  table.update(recordId, fieldsToUpdate, (err, record) => {
    if (err) {
      console.log(Error(err));
      return;
    }

    return record;
  });
};
