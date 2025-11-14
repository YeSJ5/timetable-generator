import { Router } from 'express';
import prisma from '../db';

const router = Router();

// GET all labs
router.get('/', async (req, res) => {
  try {
    const labs = await prisma.lab.findMany({
      include: {
        teacher: true,
        section: true,
        room: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(labs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch labs' });
  }
});

// GET single lab
router.get('/:id', async (req, res) => {
  try {
    const lab = await prisma.lab.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: true,
        section: true,
        room: true,
      },
    });
    if (!lab) {
      return res.status(404).json({ error: 'Lab not found' });
    }
    res.json(lab);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lab' });
  }
});

// POST create lab
router.post('/', async (req, res) => {
  try {
    const { name, durationSlots, teacherId, sectionId, roomId } = req.body;
    const lab = await prisma.lab.create({
      data: {
        name,
        durationSlots,
        teacherId,
        sectionId,
        roomId,
      },
      include: {
        teacher: true,
        section: true,
        room: true,
      },
    });
    res.status(201).json(lab);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lab' });
  }
});

// PUT update lab
router.put('/:id', async (req, res) => {
  try {
    const { name, durationSlots, teacherId, sectionId, roomId } = req.body;
    const lab = await prisma.lab.update({
      where: { id: req.params.id },
      data: {
        name,
        durationSlots,
        teacherId,
        sectionId,
        roomId,
      },
      include: {
        teacher: true,
        section: true,
        room: true,
      },
    });
    res.json(lab);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lab' });
  }
});

// DELETE lab
router.delete('/:id', async (req, res) => {
  try {
    await prisma.lab.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lab' });
  }
});

export default router;

