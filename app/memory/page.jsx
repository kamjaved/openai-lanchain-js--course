// start here
'use client';
import React, { useState } from 'react';

import Title from '../components/Title';
import PageHeader from '../components/PageHeader';
import TwoColumnLayout from '../components/TwoColumnLayout';
import ResultWithSources from '../components/ResultWithSources';
import PromptBox from '../components/PromptBox';
import '../globals.css';

const Memmory = () => {
	const [prompt, setPrompt] = useState('');
	const [error, setError] = useState('');
	const [firstMsg, setFirstMsg] = useState(true);
	const [messages, setMessages] = useState([
		{
			text: 'Hi there! Whats is your name?',
			type: 'bot',
		},
		{
			text: 'Hi there! my name is Kamran Javed?',
			type: 'user',
		},
	]);

	const handlePromptChange = (e) => {
		setPrompt(e.target.value);
	};

	const handleSubmit = async () => {
		try {
			// Update the user message
			setMessages((prevMessages) => [
				...prevMessages,
				{ text: prompt, type: 'user', sourceDocuments: null },
			]);

			const response = await fetch('/api/memory', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ input: prompt, firstMsg }),
			});

			if (!response.ok) {
				throw new Error(`HTTP Error! Status: ${response.status}`);
			}

			setPrompt(''); // after writing make input field empty
			setFirstMsg(false); // avoid reinitializing everytime

			const searchRes = await response.json();
			// Update bots message
			setMessages((prevState) => [
				...prevState,
				{
					text: searchRes.output.response,
					type: 'bot',
					sourceDocuments: null,
				},
			]);

			setError('');
		} catch (error) {
			console.log(error);
			setError(error);
		}
	};

	return (
		<>
			<Title headingText={'Memmory'} emoji="🧠️" />
			<TwoColumnLayout
				leftChildren={
					<>
						<PageHeader
							heading="I remember everything"
							boldText="Let's see if it can remember your name and favourite food. This tool will let you ask anything contained in a PDF document. "
							description="This tool uses Buffer Memory and Conversation Chain.  Head over to Module X to get started!"
						/>
					</>
				}
				rightChildren={
					<>
						<ResultWithSources messages={messages} pngFile="brain" />
						<PromptBox
							prompt={prompt}
							handleSubmit={handleSubmit}
							placeHolderText="Type Here ......"
							error={error}
							handlePromptChange={handlePromptChange}
						/>
					</>
				}
			/>
		</>
	);
};

export default Memmory;
