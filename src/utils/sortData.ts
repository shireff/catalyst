export const sortDate = <T>(
  items: T[],
  dateKey: keyof T,
  order: "asc" | "desc" = "desc"
): T[] => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[dateKey] as string).getTime();
    const dateB = new Date(b[dateKey] as string).getTime();

    return order === "asc" ? dateA - dateB : dateB - dateA;
  });
};
