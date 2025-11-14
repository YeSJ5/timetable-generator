import { Router } from 'express';
import prisma from '../db';

const router = Router();

// GET all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        labs: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// GET single room
router.get('/:id', async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: {
        labs: true,
      },
    });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// POST create room
router.post('/', async (req, res) => {
  try {
    const { name, type } = req.body;
    const room = await prisma.room.create({
      data: {
        name,
        type,
      },
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// PUT update room
router.put('/:id', async (req, res) => {
  try {
    const { name, type } = req.body;
    const room = await prisma.room.update({
      where: { id: req.params.id },
      data: {
        name,
        type,
      },
    });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// DELETE room
router.delete('/:id', async (req, res) => {
  try {
    await prisma.room.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

export default router;

