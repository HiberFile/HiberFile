import axios from 'axios';

export default async (fileId: string, apiUrl: string) => {
	const response = await axios.get<{
		downloadUrl: string;
		filename: string;
		expire: string;
	}>(`${apiUrl}/files/${fileId}`);

	return response.data;
};
