/**
 * Interface for AI model configuration
 */
export interface ModelConfig {
  name: string;
  version: string;
  size: string; // e.g., "small", "medium", "large"
  downloadUrl: string;
  checksum: string;
  contextSize: number;
  quantization: string; // e.g., "Q4_0", "Q5_K_M", "F16"
}

/**
 * Interface for model inference parameters
 */
export interface InferenceParams {
  temperature: number;
  topP: number;
  maxTokens: number;
  stopSequences: string[];
  frequencyPenalty: number;
  presencePenalty: number;
}

/**
 * Default inference parameters
 */
export const DEFAULT_INFERENCE_PARAMS: InferenceParams = {
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  stopSequences: [],
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
};

/**
 * Available model configurations
 */
export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    name: 'jarvis-small',
    version: '1.0.0',
    size: 'small',
    downloadUrl: 'https://example.com/models/jarvis-small.bin',
    checksum: 'abcdef1234567890',
    contextSize: 4096,
    quantization: 'Q4_0',
  },
  {
    name: 'jarvis-medium',
    version: '1.0.0',
    size: 'medium',
    downloadUrl: 'https://example.com/models/jarvis-medium.bin',
    checksum: '1234567890abcdef',
    contextSize: 8192,
    quantization: 'Q5_K_M',
  },
  {
    name: 'jarvis-large',
    version: '1.0.0',
    size: 'large',
    downloadUrl: 'https://example.com/models/jarvis-large.bin',
    checksum: '0987654321fedcba',
    contextSize: 16384,
    quantization: 'F16',
  },
];
