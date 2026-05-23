export interface CloudinaryMap {
  generatedAt?: string;
  cloudName: string;
  folderPrefix?: string;
  items: Record<string, string>;
}

export function getCloudinaryPublicId(
  cloudinaryMap: CloudinaryMap | null | undefined,
  year: number,
  month: number,
  imageName: string
) {
  if (!cloudinaryMap?.items) {
    return null;
  }

  const imageBaseName = imageName.replace(/\.[^.]+$/, '');
  const monthKey = `${year}/${String(month).padStart(2, '0')}/${imageBaseName}`;

  return cloudinaryMap.items[monthKey] ?? cloudinaryMap.items[imageBaseName] ?? null;
}

export function buildCloudinaryImageUrl(
  cloudName: string,
  publicId: string,
  folderPrefix = ''
) {
  const normalizedFolderPrefix = folderPrefix.replace(/^\/+|\/+$/g, '');
  const normalizedPublicId = publicId.replace(/^\/+/, '');
  const pathPrefix = normalizedFolderPrefix ? `${normalizedFolderPrefix}/` : '';

  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${pathPrefix}${normalizedPublicId}`;
}