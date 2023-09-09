import { SerpAPI } from 'langchain/tools';

const SerpAPITool = () => {
	const serpAPI = new SerpAPI(process.env.SERPAPI_API_KEY, {
		baseUrl: '',
		location: 'Kolkata,India',
		hl: 'en',
		gl: 'us',
	});

	//  returnDirect : it will grab the most recent result
	serpAPI.returnDirect = true;

	return serpAPI;
};

export default SerpAPITool;
