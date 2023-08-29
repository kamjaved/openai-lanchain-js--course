import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PineconeClient } from '@pinecone-database/pinecone';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import multer from 'multer';

// Example: https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/pdf
export default async function handler(req, res) {
	if (req.method === 'POST') {
		const upload = multer({ storage: multer.memoryStorage() });
		const blob = upload.single(req.body);
		console.log('Inside the PDF handler');

		/** STEP ONE: LOAD DOCUMENT */
		const loader = new PDFLoader(blob);
		const docs = await loader.load();

		console.log({ docs });

		if (docs.length === 0) {
			console.log('No Docs Found');
			return;
		}

		// Chunk it
		const splitter = new CharacterTextSplitter({
			separator: ' ', // separator is space for other sometime we use comma
			chunkSize: 250, // chunks size 250 charcater
			chunkOverlap: 10, // overlap word from prev chunks for referance & make search easier
		});

		const splitDocs = await splitter.splitDocuments(docs);

		console.log({ splitDocs });

		// Reduce the size of the metadata
		const reducedDocs = splitDocs.map((doc) => {
			const reducedMetadata = { ...doc.metadata };
			delete reducedMetadata.pdf;
			return new Document({
				pageContent: doc.pageContent,
				metadata: reducedMetadata,
			});
		});

		console.log({ reducedDocs });

		/** STEP TWO: UPLOAD TO DATABASE */
		const client = new PineconeClient();
		await client.init({
			apiKey: process.env.PINECONE_API_KEY,
			environment: process.env.PINECONE_ENVIRONMENT,
		});

		const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

		// upload documents to Pinecone

		// await PineconeStore.fromDocuments(reducedDocs, new OpenAIEmbeddings(), {
		// 	pineconeIndex,
		// });

		console.log('Successfully uploaded to Database');
		return res.status(200).json({ result: docs });
	} else {
		res.status(405).json({ message: 'Method not allowed' });
	}
}
