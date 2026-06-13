import api from './client';

export const aiService = {
  /**
   * Parses unstructured natural language brief into structured task data
   * @param {string} text - The brief text from the user
   * @returns {Promise<Object>} - Parsed JSON object matching the Task Creation Schema
   */
  parseTaskBrief: async (text) => {
    try {
      const response = await api.post('/ai/parse-task', { text });
      return response.data.data;
    } catch (error) {
      console.error('AI parsing error:', error);
      throw error;
    }
  }
};
