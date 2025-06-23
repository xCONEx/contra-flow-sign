
import { Response } from 'express';
import { contractsService } from '../services/ContractsService';
import { pdfService } from '../services/PdfService';
import { webhookService } from '../services/WebhookService';
import { Contract, CreateContractRequest, SendContractRequest } from '../../types/api';
import { AuthenticatedRequest } from '../middleware/auth';

export class ContractsController {
  async getContracts(req: AuthenticatedRequest, res: Response) {
    try {
      const { page = 1, limit = 20, status, client_id } = req.query;
      const userId = req.user?.id;

      const result = await contractsService.getContracts({
        userId,
        page: Number(page),
        limit: Number(limit),
        status: status as string,
        clientId: client_id as string,
      });

      res.json({
        data: result.data,
        pagination: result.pagination,
        success: true,
      });
    } catch (error) {
      console.error('Error fetching contracts:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async getContract(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const contract = await contractsService.getContractById(id, userId);

      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado',
        });
      }

      res.json({
        data: contract,
        success: true,
      });
    } catch (error) {
      console.error('Error fetching contract:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async createContract(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const contractData: CreateContractRequest = req.body;

      // Validar plano premium antes de criar contrato
      const hasValidPlan = await contractsService.validatePremiumPlan(userId);
      if (!hasValidPlan) {
        return res.status(402).json({
          success: false,
          message: 'Plano premium necessário para criar contratos',
        });
      }

      const contract = await contractsService.createContract({
        ...contractData,
        user_id: userId,
      });

      // Gerar PDF do contrato
      await pdfService.generateContractPdf(contract.id);

      res.status(201).json({
        data: contract,
        success: true,
        message: 'Contrato criado com sucesso',
      });
    } catch (error) {
      console.error('Error creating contract:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar contrato',
      });
    }
  }

  async updateContract(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const updateData = req.body;

      const contract = await contractsService.updateContract(id, userId, updateData);

      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado',
        });
      }

      // Regenerar PDF se o conteúdo foi alterado
      if (updateData.content || updateData.title) {
        await pdfService.generateContractPdf(contract.id);
      }

      res.json({
        data: contract,
        success: true,
        message: 'Contrato atualizado com sucesso',
      });
    } catch (error) {
      console.error('Error updating contract:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar contrato',
      });
    }
  }

  async sendContract(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const sendData: SendContractRequest = req.body;

      const contract = await contractsService.sendContract(id, userId, sendData);

      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado',
        });
      }

      // Enviar webhook para FinanceFlow
      await webhookService.notifyContractSent(contract);

      res.json({
        data: contract,
        success: true,
        message: 'Contrato enviado para assinatura',
      });
    } catch (error) {
      console.error('Error sending contract:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar contrato',
      });
    }
  }

  async signContract(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const signData = req.body;

      const contract = await contractsService.signContract(id, signData);

      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado ou token inválido',
        });
      }

      // Enviar webhook para FinanceFlow
      await webhookService.notifyContractSigned(contract);

      res.json({
        data: contract,
        success: true,
        message: 'Contrato assinado com sucesso',
      });
    } catch (error) {
      console.error('Error signing contract:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao assinar contrato',
      });
    }
  }

  async deleteContract(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const deleted = await contractsService.deleteContract(id, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado',
        });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting contract:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir contrato',
      });
    }
  }

  async getContractEvents(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const events = await contractsService.getContractEvents(id, userId);

      res.json({
        data: events,
        success: true,
      });
    } catch (error) {
      console.error('Error fetching contract events:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar eventos do contrato',
      });
    }
  }
}

export const contractsController = new ContractsController();
