"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("@langchain/openai");
const langgraph_1 = require("@langchain/langgraph");
const messages_1 = require("@langchain/core/messages");
const prebuilt_1 = require("@langchain/langgraph/prebuilt");
const tavily_1 = require("@langchain/tavily");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// Define the tools for the agent to use
const agentTools = [new tavily_1.TavilySearch({ maxResults: 3 })];
const agentModel = new openai_1.ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0
});
// Initialize memory to persist state between graph runs
const agentCheckpointer = new langgraph_1.MemorySaver();
const agent = (0, prebuilt_1.createReactAgent)({
    llm: agentModel,
    tools: agentTools,
    checkpointSaver: agentCheckpointer,
});
// Now it's time to use!
(() => __awaiter(void 0, void 0, void 0, function* () {
    const agentFinalState = yield agent.invoke({ messages: [new messages_1.HumanMessage("what is the current weather in sf")] }, { configurable: { thread_id: "42" } });
    console.log(agentFinalState.messages[agentFinalState.messages.length - 1].content);
    const agentNextState = yield agent.invoke({ messages: [new messages_1.HumanMessage("what about ny")] }, { configurable: { thread_id: "42" } });
    console.log(agentNextState.messages[agentNextState.messages.length - 1].content);
}))();
