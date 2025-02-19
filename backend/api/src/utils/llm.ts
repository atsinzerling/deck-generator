import { LLMParseError } from '../errors/LLMParseError';

export function parseLlmResponse(response: string) {
	if (response.includes("```json")) {
		response = response.replace("```json", "").replace("```", "");
	}
    try {
        return JSON.parse(response);
    } catch (error: any) {
        throw new LLMParseError("Failed to parse LLM response", error);
    }
}