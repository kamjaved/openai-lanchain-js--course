// /pages/api/transcript.js
import { YoutubeTranscript } from 'youtube-transcript';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { CharacterTextSplitter } from 'langchain/text_splitter';

// Global variables
let chain;
let chatHistory = [];

// DO THIS SECOND
const initializeChain = async (initialPrompt, transcript) => {
	try {
		const model = new ChatOpenAI({
			temperature: 0.8,
			modelName: 'gpt-3.5-turbo',
		});

		// HNSWLib
		const vectorStore = await HNSWLib.fromDocuments(
			[{ pageContent: transcript }],
			new OpenAIEmbeddings()
		);

		//  HNSWLib can aslo save file in server with vector embedding and index

		// const directcory =
		// 	'/home/kamran/WORK/LANGCHAIN AND GENRATIVE AI/openai-javascript-course-1-start-here/data/HNSWFiles';
		// await vectorStore.save(directcory);

		// const loadVectorStore = await HNSWLib.load(
		// 	directcory,
		// 	new OpenAIEmbeddings()
		// );

		chain = ConversationalRetrievalQAChain.fromLLM(
			model,
			vectorStore.asRetriever(),
			{ verbose: true }
		);

		const response = await chain.call({
			question: initialPrompt,
			chat_history: chatHistory,
		});

		chatHistory.push({
			role: 'assistant',
			content: response.text,
		});
		// console.log({ chatHistory });

		return response;
	} catch (error) {
		console.error(error);
	}
};

export default async function handler(req, res) {
	if (req.method === 'POST') {
		// DO THIS FIRST

		const { prompt, firstMsg } = req.body;

		// Then if it's the first message, we want to initialize the chain, since it doesn't exist yet
		if (firstMsg) {
			try {
				// And then we'll jsut get the response back and the chatHistory
				const initialPrompt = `Give me the Summary of the transcript: ${prompt}`;

				chatHistory.push({
					role: 'user',
					content: initialPrompt,
				});

				// Youutbe transcript API
				const transcriptResponse = await YoutubeTranscript.fetchTranscript(
					prompt
				);

				if (!transcriptResponse) {
					return res
						.status(400)
						.json({ error: 'Failed to get Transcript' });
				}

				let transcript = '';
				transcriptResponse.forEach((line) => {
					transcript += line.text;
				});

				const response = await initializeChain(initialPrompt, transcript);

				return res.status(200).json({ output: response, chatHistory });
			} catch (err) {
				console.error(err);
				return res
					.status(500)
					.json({ error: 'An error occurred while fetching transcript' });
			}
			// do this third!
		} else {
			// If it's not the first message, we can chat with the bot
			try {
				console.log('Recieved Question');

				chatHistory.push({
					role: 'user',
					content: prompt,
				});
				const response = await chain.call({
					question: prompt,
					chat_history: chatHistory,
				});

				chatHistory.push({
					role: 'assistant',
					content: response.text,
				});

				// console.log({ response });

				return res.status(200).json({ output: response, chatHistory });
			} catch (error) {
				// Generic error handling
				console.error(error);
				res.status(500).json({
					error: 'An error occurred during the conversation.',
				});
			}
		}
	}
}
