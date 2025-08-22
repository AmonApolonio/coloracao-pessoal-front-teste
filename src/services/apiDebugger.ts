import { ApiClient } from './apiClient';
import { validateApiConfiguration } from './apiConfig';

/**
 * Debugging utilities for API services
 */
export class ApiDebugger {
  /**
   * Test API configuration
   */
  static testConfiguration() {
    console.group('🔧 API Configuration Test');
    
    const validation = validateApiConfiguration();
    
    if (validation.valid) {
      console.log('✅ All required endpoints are configured');
    } else {
      console.error('❌ Missing endpoints:', validation.missingEndpoints);
    }
    
    console.groupEnd();
    return validation;
  }

  /**
   * Test a specific API endpoint
   */
  static async testEndpoint(
    envKey: string, 
    testData: any = { test: true },
    description: string = 'Test endpoint'
  ): Promise<any> {
    console.group(`🚀 Testing ${description} (${envKey})`);
    
    try {
      console.log('Sending test data:', testData);
      
      const result = await ApiClient.post(envKey, testData);
      
      console.log('✅ Response received:', result);
      console.groupEnd();
      
      return result;
    } catch (error: any) {
      console.error('❌ Request failed:', error.message);
      console.error('Full error:', error);
      console.groupEnd();
      
      throw error;
    }
  }

  /**
   * Test polling with a specific ID
   */
  static async testPolling(
    envKey: string, 
    id: string,
    description: string = 'Test polling'
  ): Promise<any> {
    console.group(`⏱️ Testing ${description} polling (${envKey})`);
    
    const controller = new AbortController();
    
    // Set a shorter timeout for testing
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log('⏰ Test polling timeout (30 seconds)');
    }, 30000);

    try {
      console.log('Polling for ID:', id);
      
      const result = await ApiClient.pollForResult(
        envKey,
        id,
        controller,
        (status) => console.log(`📊 Status update: ${status}`)
      );
      
      console.log('✅ Polling completed:', result);
      console.groupEnd();
      
      return result;
    } catch (error: any) {
      console.error('❌ Polling failed:', error.message);
      console.error('Full error:', error);
      console.groupEnd();
      
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Test color analysis workflow
   */
  static async testColorAnalysis(imageUrl: string = 'https://example.com/test-image.jpg') {
    console.group('🎨 Testing Color Analysis Workflow');
    
    try {
      // Test submission
      const submitResult = await this.testEndpoint(
        'VITE_COLOR_ANALYSIS_URL',
        { url: imageUrl, type: 'frente_solto' },
        'Color Analysis Submission'
      );
      
      if (submitResult?.id) {
        // Test polling
        await this.testPolling(
          'VITE_COLOR_ANALYSIS_POLL_URL',
          submitResult.id,
          'Color Analysis Polling'
        );
      } else {
        console.warn('⚠️ No ID returned from submission, skipping polling test');
      }
      
      console.groupEnd();
    } catch (error) {
      console.groupEnd();
      throw error;
    }
  }

  /**
   * Test background removal workflow
   */
  static async testBackgroundRemoval(imageUrl: string = 'https://example.com/test-image.jpg') {
    console.group('🖼️ Testing Background Removal Workflow');
    
    try {
      // Test submission
      const submitResult = await this.testEndpoint(
        'VITE_REMOVE_BACKGROUND_URL',
        { url: imageUrl },
        'Background Removal Submission'
      );
      
      if (submitResult?.id) {
        // Test polling
        await this.testPolling(
          'VITE_REMOVE_BACKGROUND_POLL_URL',
          submitResult.id,
          'Background Removal Polling'
        );
      } else {
        console.warn('⚠️ No ID returned from submission, skipping polling test');
      }
      
      console.groupEnd();
    } catch (error) {
      console.groupEnd();
      throw error;
    }
  }

  /**
   * Run all API tests
   */
  static async runAllTests(testImageUrl?: string) {
    console.group('🔍 Running All API Tests');
    
    try {
      // Test configuration
      this.testConfiguration();
      
      console.log('\n');
      
      // Test color analysis
      if (testImageUrl) {
        try {
          await this.testColorAnalysis(testImageUrl);
        } catch (error) {
          console.error('Color analysis test failed:', error);
        }
        
        console.log('\n');
        
        // Test background removal
        try {
          await this.testBackgroundRemoval(testImageUrl);
        } catch (error) {
          console.error('Background removal test failed:', error);
        }
      }
      
      console.log('✅ All tests completed');
      console.groupEnd();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      console.groupEnd();
      throw error;
    }
  }
}

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).ApiDebugger = ApiDebugger;
  console.log('🔧 ApiDebugger available in console. Try: ApiDebugger.testConfiguration()');
}
