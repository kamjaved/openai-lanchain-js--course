import { OpenAI } from 'langchain/llms/openai';
import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';

let model;
let memory;
let chain;

export default async function (req, res) {
	if (req.method === 'POST') {
		const { input, firstMsg } = req.body;
		if (!input) {
			throw new Error('No Input');
		}

		if (firstMsg) {
			console.log('initilizing chain....');
			model = new OpenAI({});
			memory = new BufferMemory();
			chain = new ConversationChain({ llm: model, memory });
		}

		console.log({ input });
		const response = await chain.call({ input });
		console.log({ response });

		return res.status(200).json({ output: response });
	} else {
		res.status(405).json({ message: 'Only POST method can work' });
	}
}
