
import { z } from 'zod';

export const createContractSchema = z.object({
  client_id: z.string().uuid('ID do cliente deve ser um UUID válido'),
  template_id: z.string().uuid().optional(),
  title: z.string().min(1, 'Título é obrigatório').max(255, 'Título muito longo'),
  description: z.string().optional(),
  content: z.string().min(1, 'Conteúdo do contrato é obrigatório'),
  value: z.number().optional(),
  variables: z.record(z.any()).optional(),
});

export const sendContractSchema = z.object({
  expires_in_days: z.number().int().min(1).max(365).default(30),
  custom_message: z.string().optional(),
});

export const signContractSchema = z.object({
  signature_token: z.string().min(1, 'Token de assinatura é obrigatório'),
  signer_data: z.object({
    name: z.string().min(1, 'Nome do assinante é obrigatório'),
    email: z.string().email('Email inválido'),
    ip_address: z.string().ip('IP inválido'),
    user_agent: z.string().min(1, 'User agent é obrigatório'),
    geolocation: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
  }),
});

export const updateContractSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  content: z.string().min(1).optional(),
  value: z.number().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Pelo menos um campo deve ser fornecido para atualização',
});
