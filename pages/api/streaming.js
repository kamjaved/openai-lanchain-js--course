import { OpenAI } from 'langchain/llms/openai';
import SSE from 'express-sse';

const sse = new SSE();

export default function handler(req, res) {
	if (req.method === 'POST') {
		const { input } = req.body;

		if (!input) {
			throw new Error('No input');
		}
		// Initialize model
		const chatModal = new OpenAI({
			// NOTE: Learn About What other parameter of OpenAI like temprature,streaming,callbacks bard or in chatGPT research
			streaming: true,
			callbacks: [
				{
					handleLLMNewToken(token) {
						sse.send(token, 'newToken');
					},
				},
			],
		});

		// create the prompt
		const prompt = `Create a short rap about my name nad city. Make it funny. add hindi on it. Name: ${input}`;

		console.log({ prompt });
		// call frontend to backend
		chatModal.call(prompt).then(() => {
			sse.send(null, 'end'); // this line ensure that once we created our rap song send nothing and end eventsource.
		});

		return res.status(200).json({ result: 'Streaming Complete.' });
	} else if (req.method === 'GET') {
		sse.init(req, res);
	} else {
		res.status(405).json({ message: 'Method not allowed' });
	}
}
