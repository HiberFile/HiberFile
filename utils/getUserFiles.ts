import axios from 'axios';

const files = async (
  userId: number,
  token: string
): Promise<{ fileId: string; filename: string; expire: Date }[] | null> => {
  return (
    await axios.get<{
      files: { hiberfileId: string; filename: string; expire: string }[];
    }>(`${process.env.HIBERAPI_URL}/accounts/${userId}/files`, {
      headers: { authorization: `Basic ${token}` }
    })
  ).data.files.map((file) => ({
    ...file,
    expire: new Date(file.expire),
    fileId: file.hiberfileId
  }));
};

export default files;
