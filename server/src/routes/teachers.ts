import { Router } from 'express';
import prisma from '../db';

const router = Router();

// GET all teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        mappings: {
          include: {
            subject: true,
            section: true,
          },
        },
        labs: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// GET single teacher
router.get('/:id', async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.params.id },
      include: {
        mappings: {
          include: {
            subject: true,
            section: true,
          },
        },
        labs: true,
      },
    });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
});

// POST create teacher
router.post('/', async (req, res) => {
  try {
    const { name, initials, preferredTime } = req.body;
    const teacher = await prisma.teacher.create({
      data: {
        name,
        initials,
        preferredTime,
      },
    });
    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create teacher' });
  }
});

// PUT update teacher
router.put('/:id', async (req, res) => {
  try {
    const { name, initials, preferredTime } = req.body;
    const teacher = await prisma.teacher.update({
      where: { id: req.params.id },
      data: {
        name,
        initials,
        preferredTime,
      },
    });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update teacher' });
  }
});

// DELETE teacher
router.delete('/:id', async (req, res) => {
  try {
    await prisma.teacher.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

export default router;

