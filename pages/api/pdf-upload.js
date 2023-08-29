import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PineconeClient } from '@pinecone-database/pinecone';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { CharacterTextSplitter } from 'langchain/text_splitter';

// Example: https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/pd
export default async function handler(req, res) {
	if (req.method === 'GET') {
		console.log('Inside the PDF handler');
		console.log('Uploading book');

		/** STEP ONE: LOAD DOCUMENT */
		const bookPath =
			'/home/kamran/WORK/LANGCHAIN AND GENRATIVE AI/openai-javascript-course-1-start-here/data/resumes/resume_kaito_esquivel.pdf';

		const loader = new PDFLoader(bookPath);

		const docs = await loader.load();

		if (docs.length === 0) {
			console.log('No documents found.');
			return;
		}

		// split pdf into CHUNKS

		const splitter = new CharacterTextSplitter({
			separator: ' ',
			chunkSize: 250,
			chunkOverlap: 10,
		});

		const splitDocs = await splitter.splitDocuments(docs);

		// Reduce the size of the metadata for each document -- lots of useless pdf information
		const reducedDocs = splitDocs.map((doc) => {
			const reducedMetadata = { ...doc.metadata };
			delete reducedMetadata.pdf; // Remove the 'pdf' field
			return new Document({
				pageContent: doc.pageContent,
				metadata: reducedMetadata,
			});
		});

		/** STEP TWO: UPLOAD TO DATABASE */

		const client = new PineconeClient();

		await client.init({
			apiKey: process.env.PINECONE_API_KEY,
			environment: process.env.PINECONE_ENVIRONMENT,
		});

		const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

		await PineconeStore.fromDocuments(reducedDocs, new OpenAIEmbeddings(), {
			pineconeIndex,
		});

		console.log('Successfully uploaded to DB');

		return res.status(200).json({ result: docs });
	} else {
		res.status(405).json({ message: 'Method not allowed' });
	}
}
