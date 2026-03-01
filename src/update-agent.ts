import { config } from 'dotenv';
config({ path: '.env' });

async function updateAgent() {
  const { AGENT_ID } = await import('../constants.ts');
  const { client } = await import('./11labs.ts');
  const { prompt } = await import('../prompt.ts');

  console.log('Updating agent...', AGENT_ID);
  
  try {
    const result = await client.conversationalAi.agents.update(AGENT_ID, {
      name: 'Mistral Hackathon Agent',
      platformSettings: {
        dataCollection: {
          interestedTopic: {
            type: 'string',
            description: 'The specific topic the user is interested in (prizes, schedule, format, etc.)',
          },
          projectIdea: {
            type: 'string',
            description: "The user's idea for a hackathon project, if they mention one",
          },
          participationType: {
            type: 'string',
            description: 'Whether the user is interested in the online or in-person edition',
          }
        }
      },
      conversationConfig: {
        agent: {
          prompt: {
            prompt: prompt,
          }
        }
      }
    });
    console.log('Agent successfully updated!', result);
  } catch (error) {
    console.error('Failed to update agent:', error);
  }
}

updateAgent();

