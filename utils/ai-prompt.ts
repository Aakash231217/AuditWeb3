import OpenAI from "openai";
import AnthropicAPI  from "@anthropic-ai/sdk"; // Import the actual Anthropic API library

const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const anthropicApiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

const openai = new OpenAI({
  apiKey: openaiApiKey,
  dangerouslyAllowBrowser: true,
});

const anthropic = new AnthropicAPI({
  apiKey: anthropicApiKey,
  dangerouslyAllowBrowser: true,
});

// const msg = await anthropic.messages.create({
//   model: "claude-3-5-sonnet-20240620",
//   max_tokens: 1024,
//   messages: [{ role: "user", content: "Hello, Claude" }],
// });
//console.log(msg);

async function getCompletion(prompt: string) {
  try {
    // Try Claude first
    const claudeResponse = await anthropic.completions.create({
      model:"claude-instant-1.2",
      prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
      max_tokens_to_sample: 1000,
    });
    return claudeResponse.completion;
  } catch (error) {
    console.warn("Claude API error, falling back to GPT-4:", error);
    
    
    // Fallback to GPT-4
    const gptResponse = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
    });
    return gptResponse.choices[0]?.message?.content || null;
  }
}
export const analyzeContract = async (contract: string) => {
  const prompt = `Your role and goal is to be an AI Smart Contract Auditor. Your job is to perform an audit on the given smart contract. Here is the smart contract: ${contract}.

  Please provide the results in the following JSON format for easy front-end display:
  {
    "auditReport": "A detailed audit report of the smart contract, covering security, performance, and any other relevant aspects.",
    "metricScores": [
      { "metric": "Security", "score": 0 },
      { "metric": "Performance", "score": 0 },
      { "metric": "Other Key Areas", "score": 0 },
      { "metric": "Gas Efficiency", "score": 0 },
      { "metric": "Code Quality", "score": 0 },
      { "metric": "Documentation", "score": 0 }
    ],
    "suggestionsForImprovement": "Suggestions for improving the smart contract in terms of security, performance, and any other identified weaknesses."
  }

  Ensure that your response is a valid JSON object. Replace the placeholder values with your actual analysis. For scores, use integers between 0 and 10.`;

  const content = await getCompletion(prompt);

  if (typeof content === 'string') {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error("The AI response was not valid JSON. Please try again.");
    }
  } else {
    console.error("Unexpected response format");
    throw new Error("Unable to parse the data, please check if it is correct");
  }
};

export const fixIssues = async (
  contract: string,
  suggestions: string,
  setContract: (contract: string) => void,
  setLoading: (loading: boolean) => void
) => {
  setLoading(true);
  const prompt = `Here is the smart contract with the following issues: ${suggestions}. Please provide a fixed version of the contract:\n\n${contract}`;

  try {
    const fixedContract = await getCompletion(prompt);

    if (fixedContract) {
      setContract(fixedContract.trim());
    } else {
      console.error("No fixed contract was returned from the API");
      // Handle the error case, maybe set an error state or show a message to the user
    }
  } catch (error) {
    console.error("Error fixing issues:", error);
    // Handle the error, maybe set an error state or show a message to the user
  } finally {
    setLoading(false);
  }
};