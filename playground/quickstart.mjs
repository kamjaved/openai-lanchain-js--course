// prettier-ignore
/* eslint-disable */

import { OpenAI } from 'langchain/llms/openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { SerpAPI } from 'langchain/tools';
import { Calculator } from 'langchain/tools/calculator';
import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { PlanAndExecuteAgentExecutor } from 'langchain/experimental/plan_and_execute';
import { exec } from 'child_process';

// export OPENAI_API_KEY=
// export SERPAPI_API_KEY=
// Replace with your API keys!

// to run, go to terminal and enter: cd playground
// then enter: node quickstart.mjs

///////////////////////////////////////////
//////---- FORMAT PROMPT
///////////////////////////////////////////

const template =
	'i am a directcor of youutbe channel. please give me some idea on {topics} topic. how to make video better. the contentis for {socialMedia}. translate to {language}.';

const prompt = new PromptTemplate({
	template: template,
	inputVariables: ['topics', 'socialMedia', 'language'],
});

const formatPromptTemplate = await prompt.format({
	topics: 'gadgets',
	socialMedia: 'youtube',
	language: 'english',
});

console.log({ formatPromptTemplate });

///////////////////////////////////////////
//////---- LLM CHAIN
///////////////////////////////////////////

// LLM Chain -1 create prompt template (format) 2- Call to OpenAI

/* 0 not-cretaive 1-Very Creative
 */

const modal = new OpenAI({ temperature: 0.8 });

const template2 =
	'i am a directcor of youutbe channel. please give me some idea on {topics} topic. how to make video better. the contentis for {socialMedia}. translate to {language}.';

const prompt2 = new PromptTemplate({
	template: template2,
	inputVariables: ['topics', 'socialMedia', 'language'],
});

const chain = new LLMChain({ prompt: prompt2, llm: modal });

const resChain = await chain.call({
	topics: 'gadgets',
	socialMedia: 'youtube',
	language: 'english',
});

console.log({ resChain });

///////////////////////////////////////////
//////---- LLM AGENT
///////////////////////////////////////////

/* Agent= task+tools+template=>it figures out what to do? */

const agentModal = new OpenAI({
	temperature: 0,
	modelName:
		'text-davinci-003' /* know more OpenAI modal https://platform.openai.com/docs/models */,
});

const tools = [
	new SerpAPI(process.env.SERPAPI_API_KEY, {
		location: 'kolkata, india',
		hl: 'en',
		gl: 'in',
	}),
	new Calculator(),
];

///----------------------------------------------------------
// TYPE-1  initializeAgentExecutorWithOptions
///----------------------------------------------------------

const executer = await initializeAgentExecutorWithOptions(tools, agentModal, {
	agentType: 'zero-shot-react-description',
	maxIterations: 2,
	verbose: true,
});

const inputPrompt =
	'what is langchain?'; /* if you ask this on chatgpt-3 its will not give you answer due to knowledge cuttoff 2021.but with the help of serpAPI it search the result first then after some internal talks it gives us desired result */
const result = await executer.call({ input: inputPrompt });

console.log({ result });

///----------------------------------------------------------
//  TYPE-2 planAndExecution
/*  The above method only works with ChatOPenAI modal & benifit of this agent approach is we don't tell how to do it we just have to tell what to do.*/
///----------------------------------------------------------

const chatModal2 = new ChatOpenAI({
	temperature: 0,
	modelName: 'gpt-3.5-turbo',
});

const tools2 = [
	new SerpAPI(process.env.SERPAPI_API_KEY, {
		location: 'kolkata, india',
		hl: 'en',
		gl: 'in',
	}),
	new Calculator(),
];

const executer2 = PlanAndExecuteAgentExecutor.fromLLMAndTools({
	llm: chatModal2,
	tools: tools2,
});

const result2 = await executer2.call({
	input: 'who is the Pm of india? what is their chest age? double the age?',
});

console.log({ result2 });

///----------------------------------------------------------
// TYPE-3  Memmory
///----------------------------------------------------------

const agentModal2 = new OpenAI({});
const memory = new BufferMemory();
const conversationChain = new ConversationChain({ llm: agentModal2, memory });

const input1 = 'My name is Kamran Javed';
const res1 = await conversationChain.call({
	input: input1,
});

console.log({ input1 });
console.log({ res1 });

const input2 = 'what is my name?';
const res2 = await conversationChain.call({
	input: input2,
});

console.log({ input2 });
console.log({ res2 });
