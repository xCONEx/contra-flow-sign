
import { Router } from 'express';
import { contractsController } from '../controllers/ContractsController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createContractSchema, sendContractSchema, signContractSchema } from '../schemas/contractSchemas';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas de contratos
router.get('/', contractsController.getContracts);
router.get('/:id', contractsController.getContract);
router.post('/', validateRequest(createContractSchema), contractsController.createContract);
router.put('/:id', contractsController.updateContract);
router.delete('/:id', contractsController.deleteContract);

// Ações específicas
router.post('/:id/send', validateRequest(sendContractSchema), contractsController.sendContract);
router.post('/:id/sign', validateRequest(signContractSchema), contractsController.signContract);
router.get('/:id/events', contractsController.getContractEvents);

export default router;
