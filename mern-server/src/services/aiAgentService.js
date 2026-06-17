exports.generateAIResults = async (codeStructure, securityReport) => {
  // Simulate LangGraph agent pipeline execution delay
  await new Promise((resolve) => setTimeout(resolve, 150));

  return {
    docs: {
      summary: 'Express core backend documentation with authentication APIs.',
      routes: codeStructure.routes,
      models: []
    },
    reviews: {
      comments: [
        {
          file: 'src/controllers/authController.js',
          line: 15,
          severity: 'warning',
          suggestion: 'Validate that the JWT token is signed using the HS256 algorithm.'
        }
      ]
    },
    tests: {
      functions: [
        {
          name: 'loginController',
          testSkeleton: 'describe("loginController", () => { it("should return 200 on correct login", () => {}) })'
        }
      ]
    },
    securitySummary: 'Found 1 high vulnerability in static analysis. Remediation recommended.'
  };
};
