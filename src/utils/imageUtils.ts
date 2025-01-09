export const getFullImageUrl = (imagePath: string | null): string => {
  if (!imagePath) return "/default-avatar.png";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const API_BASE_URL = "https://bio3.catalyst.com.eg/public";
  return `${API_BASE_URL}/${imagePath}`;
};
