import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const azureConfig = {
      hasAzureEndpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
      hasAzureApiKey: !!process.env.AZURE_OPENAI_API_KEY,
      hasAzureDeployment: !!process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT ? 'Set' : 'Not set',
      apiKey: process.env.AZURE_OPENAI_API_KEY ? 'Set' : 'Not set',
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME ? 'Set' : 'Not set'
    };

    return NextResponse.json({
      azureConfigured: azureConfig.hasAzureEndpoint && azureConfig.hasAzureApiKey && azureConfig.hasAzureDeployment,
      config: azureConfig
    });
  } catch (error) {
    console.error('Error checking Azure config:', error);
    return NextResponse.json({ error: 'Failed to check configuration' }, { status: 500 });
  }
}
