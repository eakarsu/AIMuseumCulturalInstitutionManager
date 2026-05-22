import express from 'express';

const router = express.Router();

router.post('/assess', (req, res) => {
  const { object = {}, travel = {}, conditionReports = [] } = req.body || {};
  const reportRows = Array.isArray(conditionReports) ? conditionReports : [];
  const humidityRisk = Math.abs(Number(travel.expectedHumidity || 50) - Number(object.targetHumidity || 50)) * 1.5;
  const tempRisk = Math.abs(Number(travel.expectedTempC || 20) - Number(object.targetTempC || 20)) * 2;
  const ageRisk = Math.min(20, Number(object.ageYears || 0) / 10);
  const reportRisk = reportRows.some((r) => r.status === 'open') ? 20 : 0;
  const score = Math.round(Math.min(100, humidityRisk + tempRisk + ageRisk + reportRisk + (travel.legs || 0) * 5));
  res.json({
    feature: 'Loan Condition Risk',
    objectId: object.id || 'unassigned',
    score,
    band: score >= 70 ? 'registrar hold' : score >= 45 ? 'conservation review' : 'loan ready',
    requirements: [
      score >= 45 ? 'Require courier or condition photo checkpoint.' : 'Standard outgoing condition report is sufficient.',
      humidityRisk > 15 ? 'Add humidity-controlled crate requirement.' : 'Standard humidity controls acceptable.',
      reportRisk ? 'Resolve open condition report before release.' : 'No open condition report blocker.',
    ],
  });
});

export default router;
