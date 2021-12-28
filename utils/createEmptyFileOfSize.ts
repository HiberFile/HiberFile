export default (fileSize: number) => {
  const file = new Uint8Array(fileSize);
  return new Blob([file], { type: "application/octet-stream" });
};
