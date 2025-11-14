import { Router } from 'express';
import prisma from '../db';

const router = Router();

// GET all mappings
router.get('/', async (req, res) => {
  try {
    const mappings = await prisma.teacherSubjectMapping.findMany({
      include: {
        teacher: true,
        subject: true,
        section: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(mappings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mappings' });
  }
});

// GET single mapping
router.get('/:id', async (req, res) => {
  try {
    const mapping = await prisma.teacherSubjectMapping.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: true,
        subject: true,
        section: true,
      },
    });
    if (!mapping) {
      return res.status(404).json({ error: 'Mapping not found' });
    }
    res.json(mapping);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mapping' });
  }
});

// POST create mapping
router.post('/', async (req, res) => {
  try {
    const { teacherId, subjectId, sectionId } = req.body;
    const mapping = await prisma.teacherSubjectMapping.create({
      data: {
        teacherId,
        subjectId,
        sectionId,
      },
      include: {
        teacher: true,
        subject: true,
        section: true,
      },
    });
    res.status(201).json(mapping);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mapping' });
  }
});

// PUT update mapping
router.put('/:id', async (req, res) => {
  try {
    const { teacherId, subjectId, sectionId } = req.body;
    const mapping = await prisma.teacherSubjectMapping.update({
      where: { id: req.params.id },
      data: {
        teacherId,
        subjectId,
        sectionId,
      },
      include: {
        teacher: true,
        subject: true,
        section: true,
      },
    });
    res.json(mapping);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mapping' });
  }
});

// DELETE mapping
router.delete('/:id', async (req, res) => {
  try {
    await prisma.teacherSubjectMapping.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete mapping' });
  }
});

export default router;

