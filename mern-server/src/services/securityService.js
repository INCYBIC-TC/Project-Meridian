exports.runSecurityScan = async (files) => {
  // Simulate tool execution delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    vulnerabilities: [
      {
        file: 'src/config/db.js',
        line: 4,
        severity: 'HIGH',
        rule: 'B105',
        description: 'Hardcoded database credentials detected'
      }
    ],
    secrets: [
      {
        file: 'src/config/db.js',
        line: 4,
        type: 'PASSWORD'
      }
    ],
    dependencyFlags: [],
    owaspFlags: []
  };
};
