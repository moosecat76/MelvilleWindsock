'use server';

/**
 * @fileOverview An AI agent that selects the most reliable weather API.
 *
 * - selectWeatherApi - A function that selects the most reliable weather API.
 * - SelectWeatherApiInput - The input type for the selectWeatherApi function.
 * - SelectWeatherApiOutput - The return type for the selectWeatherApi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WeatherApiSchema = z.object({
  name: z.string().describe('The name of the weather API.'),
  description: z.string().describe('A description of the weather API.'),
  accuracy: z.number().describe('The historical accuracy of the API (0-1).'),
  recency: z.number().describe('How recent the data provided by the API is (in hours).'),
  consistency: z.number().describe('The consistency of the API data with other sources (0-1).'),
});

const SelectWeatherApiInputSchema = z.object({
  availableApis: z.array(WeatherApiSchema).describe('A list of available weather APIs to choose from.'),
});
export type SelectWeatherApiInput = z.infer<typeof SelectWeatherApiInputSchema>;

const SelectWeatherApiOutputSchema = z.object({
  selectedApiName: z.string().describe('The name of the selected weather API.'),
  reason: z.string().describe('The reason for selecting this API.'),
});
export type SelectWeatherApiOutput = z.infer<typeof SelectWeatherApiOutputSchema>;

export async function selectWeatherApi(input: SelectWeatherApiInput): Promise<SelectWeatherApiOutput> {
  return selectWeatherApiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'selectWeatherApiPrompt',
  input: {schema: SelectWeatherApiInputSchema},
  output: {schema: SelectWeatherApiOutputSchema},
  prompt: `You are an expert in evaluating weather APIs and selecting the most reliable one based on accuracy, recency, and consistency.

You are provided with a list of available APIs, their descriptions, and their performance metrics.

Based on this information, select the best API and explain your reasoning.

Available APIs:
{{#each availableApis}}
  Name: {{this.name}}
  Description: {{this.description}}
  Accuracy: {{this.accuracy}}
  Recency: {{this.recency}} hours
  Consistency: {{this.consistency}}
{{/each}}

Consider all factors to choose the API that will provide the most reliable weather data.

Return your decision in the following format:
{
  "selectedApiName": "[The name of the selected API]",
  "reason": "[Your detailed reasoning for selecting this API]"
}
`,
});

const selectWeatherApiFlow = ai.defineFlow(
  {
    name: 'selectWeatherApiFlow',
    inputSchema: SelectWeatherApiInputSchema,
    outputSchema: SelectWeatherApiOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
