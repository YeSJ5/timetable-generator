import { Router } from 'express';
import { getScheduleRules, updateScheduleRules, ScheduleRules } from '../config/scheduleRules';

const router = Router();

// GET current rules
router.get('/', (req, res) => {
  res.json(getScheduleRules());
});

// PUT update rules (partial)
router.put('/', (req, res) => {
  const patch: Partial<ScheduleRules> = req.body;
  try {
    updateScheduleRules(patch);
    res.json({ success: true, rules: getScheduleRules() });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to update rules' });
  }
});

export default router;
