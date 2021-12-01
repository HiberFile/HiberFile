import axios from 'axios';

export default async (fileId: string, apiUrl: string, token?: string) => {
  const response = await axios.get<{
    downloadUrl: string;
    filename: string;
    expire: string;
  }>(
    `${apiUrl}/files/${fileId}`,
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      : undefined
  );

  return response.data;
};
