export function parseLlmResponse(response: string) {
	if (response.includes("```json")) {
		response = response.replace("```json", "").replace("```", "");
	}
    try {
        return JSON.parse(response);
    } catch (error) {
        throw new Error(`Failed to parse LLM response: ${error}`);
    }
}