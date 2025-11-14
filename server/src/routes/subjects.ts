import { Router } from 'express';
import prisma from '../db';

const router = Router();

// GET all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        mappings: {
          include: {
            teacher: true,
            section: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// GET single subject
router.get('/:id', async (req, res) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: req.params.id },
      include: {
        mappings: {
          include: {
            teacher: true,
            section: true,
          },
        },
      },
    });
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

// POST create subject
router.post('/', async (req, res) => {
  try {
    const { code, name, hoursPerWeek } = req.body;
    const subject = await prisma.subject.create({
      data: {
        code,
        name,
        hoursPerWeek,
      },
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// PUT update subject
router.put('/:id', async (req, res) => {
  try {
    const { code, name, hoursPerWeek } = req.body;
    const subject = await prisma.subject.update({
      where: { id: req.params.id },
      data: {
        code,
        name,
        hoursPerWeek,
      },
    });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// DELETE subject
router.delete('/:id', async (req, res) => {
  try {
    await prisma.subject.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

export default router;

