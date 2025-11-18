export const isValidObjectId = (id) => {
  if (!id || id.trim() === "") {
    return true;
  }
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id.trim());
};
