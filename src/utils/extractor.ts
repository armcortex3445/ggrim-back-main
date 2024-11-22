export function extractValues<T>(obj: T, key: keyof T): any[] {
  const fieldValues = new Set<any>();

  const field = obj[key];

  if (Array.isArray(field)) {
    field.forEach((value) => fieldValues.add(field));
    return [...field];
  }

  fieldValues.add(field);

  return [...fieldValues];
}

export function extractValuesFromArray<T>(list: T[], key: keyof T): any[] {
  const fieldValues = new Set<any>();

  list.forEach((obj) => {
    const values = extractValues(obj, key);
    values.forEach((value) => fieldValues.add(value));
  });

  return [...fieldValues];
}
