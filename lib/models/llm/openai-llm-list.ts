import { LLM } from "@/types"
import { VALID_ENV_KEYS } from "@/types/valid-keys"

const OPENAI_PLATORM_LINK = "https://platform.openai.com/docs/overview"

// OpenAI Models (UPDATED 1/25/24) -----------------------------

const GPT41: LLM = {
  modelId: "gpt-4.1",
  modelName: "GPT-4.1",
  provider: "openai",
  hostedId: "gpt-4.1",
  platformLink: OPENAI_PLATORM_LINK,
  azureDeploymentEnvKey: VALID_ENV_KEYS.AZURE_GPT_41_O_NAME,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 5,
    outputCost: 15
  }
}

const GPT5: LLM = {
  modelId: "gpt-5",
  modelName: "GPT-5",
  provider: "openai",
  hostedId: "gpt-5",
  platformLink: OPENAI_PLATORM_LINK,
  azureDeploymentEnvKey: VALID_ENV_KEYS.AZURE_GPT_5_NAME,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 5,
    outputCost: 15
  }
}



const GPT4o: LLM = {
  modelId: "gpt-4o",
  modelName: "GPT-4o",
  provider: "openai",
  hostedId: "gpt-4o",
  platformLink: OPENAI_PLATORM_LINK,
  azureDeploymentEnvKey: VALID_ENV_KEYS.AZURE_GPT_45_O_NAME,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 5,
    outputCost: 15
  }
}

// GPT-4 Turbo (UPDATED 1/25/24)
const GPT4Turbo: LLM = {
  modelId: "gpt-4-turbo",
  modelName: "GPT-4 Turbo",
  provider: "openai",
  hostedId: "gpt-4-turbo",
  platformLink: OPENAI_PLATORM_LINK,
  azureDeploymentEnvKey: VALID_ENV_KEYS.AZURE_GPT_45_TURBO_NAME,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 10,
    outputCost: 30
  }
}

// GPT-4 Vision (UPDATED 12/18/23)
const GPT4Vision: LLM = {
  modelId: "gpt-4-vision-preview",
  modelName: "GPT-4 Vision",
  provider: "openai",
  hostedId: "gpt-4-vision-preview",
  platformLink: OPENAI_PLATORM_LINK,
  azureDeploymentEnvKey: VALID_ENV_KEYS.AZURE_GPT_45_VISION_NAME,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 10
  }
}

// GPT-4 (UPDATED 1/29/24)
const GPT4: LLM = {
  modelId: "gpt-4",
  modelName: "GPT-4",
  provider: "openai",
  hostedId: "gpt-4",
  platformLink: OPENAI_PLATORM_LINK,
  azureDeploymentEnvKey: null,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 30,
    outputCost: 60
  }
}

// GPT-3.5 Turbo (UPDATED 1/25/24)
const GPT3_5Turbo: LLM = {
  modelId: "gpt-3.5-turbo",
  modelName: "GPT-3.5 Turbo",
  provider: "openai",
  hostedId: "gpt-3.5-turbo",
  platformLink: OPENAI_PLATORM_LINK,
  azureDeploymentEnvKey: VALID_ENV_KEYS.AZURE_GPT_35_TURBO_NAME,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.5,
    outputCost: 1.5
  }
}

export const OPENAI_LLM_LIST: LLM[] = [
  GPT5,
  GPT41,
  GPT4o,
  GPT4Turbo,
  GPT4Vision,
  GPT4,
  GPT3_5Turbo
]
