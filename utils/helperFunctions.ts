const saveDataToDatabase = async (data: any, collection: any) => {
  const bulkOperations = data.map((d: any) => ({
    insertOne: {
      document: d,
    },
  }));

  try {
    const result = await collection.bulkWrite(bulkOperations);
    console.log(`Successfully inserted ${result.insertedCount} documents`);
  } catch (error) {
    console.error(`Error saving data: ${error}`);
  }
};

const normalizeKeys = (obj: any) => {
  const normalizedObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const normalizedKey = key.trim().toLowerCase();
      normalizedObj[normalizedKey] = obj[key];
    }
  }
  return normalizedObj;
};

export { saveDataToDatabase, normalizeKeys };
