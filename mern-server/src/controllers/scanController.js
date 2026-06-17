const Scan = require('../models/Scan');
const Doc = require('../models/Doc');
const Review = require('../models/Review');
const Test = require('../models/Test');
const SecurityReport = require('../models/SecurityReport');

const parserService = require('../services/parserService');
const securityService = require('../services/securityService');
const aiAgentService = require('../services/aiAgentService');
const asyncWrapper = require('../utils/asyncWrapper');

exports.initScan = asyncWrapper(async (req, res) => {
  const { repoId, files, triggeredBy } = req.body;
  const startedAt = new Date();

  // 1. Input validations
  if (typeof repoId !== 'string' || repoId.trim() === '') {
    res.status(400);
    throw new Error('Validation error: repoId must be a non-empty string');
  }

  if (!Array.isArray(files) || files.length === 0) {
    res.status(400);
    throw new Error('Validation error: files must be a non-empty array');
  }

  // Create Scan document (status: "pending")
  const scan = await Scan.create({
    repoId,
    status: 'pending',
    triggeredBy: triggeredBy || 'anonymous',
    startedAt
  });
  console.log(`[Scan ${scan._id}] State: pending`);

  // Placeholders for partial collection persistence on error
  let parsedData = null;
  let securityReport = null;
  let aiResults = null;

  try {
    // 2. Update status -> parsing
    await Scan.findByIdAndUpdate(scan._id, { status: 'parsing' });
    console.log(`[Scan ${scan._id}] State: parsing`);
    parsedData = await parserService.parseCode(files);

    // 3. Update status -> scanning
    await Scan.findByIdAndUpdate(scan._id, { status: 'scanning' });
    console.log(`[Scan ${scan._id}] State: scanning`);
    securityReport = await securityService.runSecurityScan(files);

    // 4. Update status -> analyzing
    await Scan.findByIdAndUpdate(scan._id, { status: 'analyzing' });
    console.log(`[Scan ${scan._id}] State: analyzing`);
    aiResults = await aiAgentService.generateAIResults(parsedData, securityReport);

    // 5. Store results in Mongoose collections
    await Doc.create({
      scanId: scan._id,
      summary: aiResults.docs.summary || '',
      routes: aiResults.docs.routes || [],
      models: aiResults.docs.models || []
    });

    await Review.create({
      scanId: scan._id,
      comments: (aiResults.reviews.comments || []).map(comment => ({
        file: comment.file,
        line: comment.line,
        message: comment.suggestion || '', // Map mock suggestion -> message
        severity: comment.severity
      }))
    });

    await Test.create({
      scanId: scan._id,
      testCases: aiResults.tests.functions || []
    });

    await SecurityReport.create({
      scanId: scan._id,
      vulnerabilities: securityReport.vulnerabilities || [],
      secrets: securityReport.secrets || [],
      dependencyFlags: securityReport.dependencyFlags || [],
      owaspFlags: securityReport.owaspFlags || [],
      summary: aiResults.securitySummary || ''
    });

    // 6. Final update
    const completedAt = new Date();
    const duration = completedAt - startedAt;

    await Scan.findByIdAndUpdate(scan._id, {
      status: 'completed',
      completedAt,
      duration
    });

    console.log(`[Scan ${scan._id}] State: completed (Duration: ${duration}ms)`);

    // 7. Response
    return res.status(200).json({
      scanId: scan._id,
      status: 'completed'
    });

  } catch (error) {
    const failedAt = new Date();
    const duration = failedAt - startedAt;

    // Fail state update
    await Scan.findByIdAndUpdate(scan._id, {
      status: 'failed',
      completedAt: failedAt,
      duration
    });

    console.error(`[Scan ${scan._id}] State: failed (Duration: ${duration}ms). Reason: ${error.message}`);

    // Persist any partial data successfully computed before failure
    try {
      if (parsedData) {
        await Doc.create({
          scanId: scan._id,
          summary: 'Partial generated documentation',
          routes: parsedData.routes || [],
          models: parsedData.models || []
        });
      }
      if (securityReport) {
        await SecurityReport.create({
          scanId: scan._id,
          vulnerabilities: securityReport.vulnerabilities || [],
          secrets: securityReport.secrets || [],
          dependencyFlags: securityReport.dependencyFlags || [],
          owaspFlags: securityReport.owaspFlags || [],
          summary: 'Partial security report'
        });
      }
    } catch (dbErr) {
      console.error(`[Scan ${scan._id}] Failed to save partial data: ${dbErr.message}`);
    }

    return res.status(500).json({
      error: error.message
    });
  }
});
