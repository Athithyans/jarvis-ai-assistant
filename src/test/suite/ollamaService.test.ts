import * as assert from 'assert';
import { suite, test } from 'mocha';
import { OllamaService } from '../../services/ollamaService';

suite('OllamaService Test Suite', () => {
  test('OllamaService should be a singleton', () => {
    const instance1 = OllamaService.getInstance();
    const instance2 = OllamaService.getInstance();
    // Both instances should be the same object
    assert.strictEqual(instance1, instance2);
  });

  test('OllamaService should have required methods', () => {
    const service = OllamaService.getInstance();
    // Check if all required methods exist
    assert.strictEqual(typeof service.initialize, 'function');
    assert.strictEqual(typeof service.generateResponse, 'function');
    assert.strictEqual(typeof service.generateStreamingResponse, 'function');
    assert.strictEqual(typeof service.dispose, 'function');
  });

  // Note: The following tests are commented out because they require Ollama to be running
  // and would make actual API calls. In a real testing environment, these would be
  // mocked or run in a controlled environment.

  /*
  test('OllamaService should check if Ollama is running', async () => {
    const service = OllamaService.getInstance();
    await service.initialize();
    
    // This is a basic test that doesn't actually test the functionality
    // but ensures the method doesn't throw an exception
    assert.ok(true);
  });
  
  test('OllamaService should generate a response', async () => {
    const service = OllamaService.getInstance();
    
    try {
      const response = await service.generateResponse('Hello, how are you?', {
        temperature: 0.7,
        maxTokens: 100,
      });
      
      assert.ok(response);
      assert.strictEqual(typeof response, 'string');
    } catch (error) {
      // If Ollama is not running, this test will be skipped
      if (error instanceof Error && error.message.includes('Ollama is not running')) {
        console.log('Skipping test because Ollama is not running');
        this.skip();
      } else {
        throw error;
      }
    }
  });
  */
});
