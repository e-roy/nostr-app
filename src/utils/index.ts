export * from "./get-tag-values";

export const getTimeAndDate = (time: number) => {
  const date = new Date(time * 1000);
  return date.toLocaleString();
};
