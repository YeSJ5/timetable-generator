import { Router } from 'express';
import prisma from '../db';

const router = Router();

// GET teacher preferences
router.get('/teacher/:id', async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.params.id },
    });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json({
      availabilityMatrix: teacher.availabilityMatrix ? JSON.parse(teacher.availabilityMatrix) : null,
      maxClassesPerDay: teacher.maxClassesPerDay,
      maxClassesPerWeek: teacher.maxClassesPerWeek,
      gapPreference: teacher.gapPreference,
      consecutivePreference: teacher.consecutivePreference,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teacher preferences' });
  }
});

// PUT teacher preferences
router.put('/teacher/:id', async (req, res) => {
  try {
    const { availabilityMatrix, maxClassesPerDay, maxClassesPerWeek, gapPreference, consecutivePreference } = req.body;
    const teacher = await prisma.teacher.update({
      where: { id: req.params.id },
      data: {
        availabilityMatrix: availabilityMatrix ? JSON.stringify(availabilityMatrix) : null,
        maxClassesPerDay,
        maxClassesPerWeek,
        gapPreference,
        consecutivePreference,
      },
    });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update teacher preferences' });
  }
});

// GET subject constraints
router.get('/subject/:id', async (req, res) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: req.params.id },
    });
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({
      spreadAcrossWeek: subject.spreadAcrossWeek,
      noConsecutiveDays: subject.noConsecutiveDays,
      preferredTimes: subject.preferredTimes ? JSON.parse(subject.preferredTimes) : null,
      labConstraints: subject.labConstraints ? JSON.parse(subject.labConstraints) : null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subject constraints' });
  }
});

// PUT subject constraints
router.put('/subject/:id', async (req, res) => {
  try {
    const { spreadAcrossWeek, noConsecutiveDays, preferredTimes, labConstraints } = req.body;
    const subject = await prisma.subject.update({
      where: { id: req.params.id },
      data: {
        spreadAcrossWeek,
        noConsecutiveDays,
        preferredTimes: preferredTimes ? JSON.stringify(preferredTimes) : null,
        labConstraints: labConstraints ? JSON.stringify(labConstraints) : null,
      },
    });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject constraints' });
  }
});

// GET section workload rules
router.get('/section/:id', async (req, res) => {
  try {
    const section = await prisma.section.findUnique({
      where: { id: req.params.id },
    });
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json({
      maxHoursPerDay: section.maxHoursPerDay,
      maxBackToBack: section.maxBackToBack,
      minimumBreaks: section.minimumBreaks,
      preferredStart: section.preferredStart,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch section rules' });
  }
});

// PUT section workload rules
router.put('/section/:id', async (req, res) => {
  try {
    const { maxHoursPerDay, maxBackToBack, minimumBreaks, preferredStart } = req.body;
    const section = await prisma.section.update({
      where: { id: req.params.id },
      data: {
        maxHoursPerDay,
        maxBackToBack,
        minimumBreaks,
        preferredStart,
      },
    });
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update section rules' });
  }
});

// GET room allocation rules
router.get('/room/:id', async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
    });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({
      capacity: room.capacity,
      equipment: room.equipment ? JSON.parse(room.equipment) : null,
      availability: room.availability ? JSON.parse(room.availability) : null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch room rules' });
  }
});

// PUT room allocation rules
router.put('/room/:id', async (req, res) => {
  try {
    const { capacity, equipment, availability } = req.body;
    const room = await prisma.room.update({
      where: { id: req.params.id },
      data: {
        capacity,
        equipment: equipment ? JSON.stringify(equipment) : null,
        availability: availability ? JSON.stringify(availability) : null,
      },
    });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update room rules' });
  }
});

export default router;

