import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { config } from "dotenv";
import readlineSync from "readline-sync";
import axios from "axios"



config();
const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiNDZmNDVkNi1jYzgwLTRmYjktYTA3MC1mMTg5ZWJmMDFhNjIiLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc0NzU3NTk4MywiZXhwIjoxNzQ4MTgwNzgzfQ.mn1oIrUazh7e9Iu548NFh6O9HlqTXcGFX-jHNhXXfPc';``

const searchDoctors = tool(
  async (input: { search?: string; specialty?: string }) => {
    try {
      const params: Record<string, string> = {};
      if (input.search) params.search = input.search;
      if (input.specialty) params.specialty = input.specialty;

      const res = await axios.get("https://api.swastify.life/patient/get-doctors", {
        params,
         headers: {
          Cookie: `auth_token=${authToken}`,
        },
      });

      const data = res.data;

      if (!data.doctors || data.doctors.length === 0) {
        return "No doctors matched your search criteria.";
      }

     const doctorsList = data.doctors
  .map(
    (doc: any, i: number) =>
      `${i + 1}. Dr. ${doc.name} (ID: ${doc.id}) - ${doc.specialty} (${doc.experience} years), Fee: ₹${doc.consultationFee}, Clinic: ${doc.clinicAddress}`
  )
  .join("\n");


      return `Here are the doctors I found:\n\n${doctorsList}`;
    } catch (error) {
      console.error("Error searching doctors:", error);
      return "Sorry, I couldn't search doctors right now. Try again later.";
    }
  },
  {
    name: "searchDoctors",
    description: "Search doctors by name and/or specialty.",
    schema: z.object({
      search: z.string().optional().describe("Doctor name to search for"),
      specialty: z.string().optional().describe("Specialty to filter doctors"),
    }),
  }
);

const getAvailableDatesForMonth = tool(
  async (input: { doctorId: string; year: number; month: number }) => {
    try {
      const { doctorId, year, month } = input;

      

      const res = await axios.get(
        "https://api.swastify.life/patient/get-available-dates", // put the actual endpoint URL here
        {
          params: { doctorId, year, month },
          headers: {
            Cookie: `auth_token=${authToken}`,
          },
        }
      );

      const data = res.data;

      if (!data.availableDates || data.availableDates.length === 0) {
        return `No available dates found for doctor ${doctorId} in ${month}/${year}.`;
      }

      const datesList = data.availableDates.join(", ");

      return `Available dates for doctor ${doctorId} in ${month}/${year} are:\n${datesList}`;
    } catch (error) {
      console.error("Error fetching available dates:", error);
      return "Sorry, I couldn't fetch available dates right now. Try again later.";
    }
  },
  {
    name: "getAvailableDatesForMonth",
    description: "Get available appointment dates for a doctor in a specific month and year.",
    schema: z.object({
      doctorId: z.string().describe("The ID of the doctor"),
      year: z.number().int().describe("Year as a 4-digit number, e.g., 2025"),
      month: z.number().int().min(1).max(12).describe("Month as a number between 1 and 12"),
    }),
  }
);



const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: "gpt-4.1-mini", // ← this one works perfectly with tools
  temperature: 0.2,
  verbose:false
});


const agent = createReactAgent({
  llm,
  tools: [searchDoctors,getAvailableDatesForMonth],
  prompt: `
  You are a Medical Assistant for Company Swastify. You have access to two tools: searchDoctors and getAvailableDatesForMonth.
- When the user asks for doctors, use searchDoctors.
- When the user wants available appointment dates for a doctor, use getAvailableDatesForMonth.
- If the user does not mention the doctor explicitly, then just call searchdoctor tool with the doctor name and extract doctor Id of the specific doctor and call the getAvailableDatesForMonth toolwith doctorId
- If you don't know the answer, politely say you can't answer right now.

Keep your answers clear and helpful.
  `,
});

const chat = async () => {
  const messages = [];

  console.log('👋 Yo! Gundu is here. Ask me anything bro...\n');

  while (true) {
    const userInput = readlineSync.question('🧍 You: ');

    if (userInput.toLowerCase() === 'exit') {
      console.log('👋 Bye from Gundu! Peace out ✌️');
      break;
    }

    messages.push({ role: 'user', content: userInput });

    const response:any = await agent.invoke({ messages });

    const gunduReply:any = response.messages[response.messages.length - 1];
    messages.push(gunduReply);

    console.log(`🤖 Gundu: ${gunduReply.content}\n`);
  }
};

chat();


