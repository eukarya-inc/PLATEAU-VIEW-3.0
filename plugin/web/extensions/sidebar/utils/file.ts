export const getExtension = (filename?: string) => {
  if (!filename || !filename.includes(".")) return "";

  return filename.toLowerCase().slice(filename.lastIndexOf(".") + 1, filename.length);
};

// getNameFromPath("xxx/yyy/zzz") -> "zzz"
export const getNameFromPath = (path?: string) => {
  if (!path) return;
  if (!path.includes("/")) return path;

  return path.split("/").slice(-1)[0];
};
