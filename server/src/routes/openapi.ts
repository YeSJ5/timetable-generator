/**
 * OpenAPI Spec Route
 * 
 * Serves the OpenAPI specification
 */

import { Router, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

const router = Router();

/**
 * GET /openapi.json
 * Returns the OpenAPI specification as JSON
 */
router.get('/openapi.json', (req: Request, res: Response) => {
  try {
    const yamlPath = join(__dirname, '../../docs/openapi.yaml');
    const yamlContent = readFileSync(yamlPath, 'utf-8');
    
    // For now, return YAML (in production, convert to JSON using js-yaml)
    res.setHeader('Content-Type', 'application/yaml');
    res.send(yamlContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to load OpenAPI specification',
      },
    });
  }
});

export default router;

