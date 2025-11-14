import { Router } from 'express';
import prisma from '../db';

const router = Router();

// GET all sections
router.get('/', async (req, res) => {
  try {
    const sections = await prisma.section.findMany({
      include: {
        mappings: {
          include: {
            teacher: true,
            subject: true,
          },
        },
        labs: true,
        timetables: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// GET single section
router.get('/:id', async (req, res) => {
  try {
    const section = await prisma.section.findUnique({
      where: { id: req.params.id },
      include: {
        mappings: {
          include: {
            teacher: true,
            subject: true,
          },
        },
        labs: true,
        timetables: true,
      },
    });
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch section' });
  }
});

// POST create section
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const section = await prisma.section.create({
      data: {
        name,
      },
    });
    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// PUT update section
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const section = await prisma.section.update({
      where: { id: req.params.id },
      data: {
        name,
      },
    });
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// DELETE section
router.delete('/:id', async (req, res) => {
  try {
    await prisma.section.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

export default router;

