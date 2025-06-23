import { supabase } from '../../lib/supabase';
import { Contract } from '../../types/api';

export class PdfService {
  async generateContractPdf(contractId: string): Promise<string> {
    try {
      // Buscar dados do contrato
      const { data: contract, error } = await supabase
        .from('contracts')
        .select(`
          *,
          clients:client_id(*),
          templates:template_id(*)
        `)
        .eq('id', contractId)
        .single();

      if (error) throw error;

      // Gerar PDF usando Edge Function do Supabase
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-contract-pdf', {
        body: {
          contract,
          options: {
            format: 'A4',
            margin: {
              top: '1in',
              right: '1in',
              bottom: '1in',
              left: '1in',
            },
            header: {
              height: '1in',
              contents: `
                <div style="text-align: center; font-size: 12px; color: #666;">
                  ContratPro - Contrato Digital
                </div>
              `,
            },
            footer: {
              height: '1in',
              contents: `
                <div style="text-align: center; font-size: 10px; color: #666;">
                  Página {{page}} de {{pages}} - Gerado em ${new Date().toLocaleString('pt-BR')}
                </div>
              `,
            },
          },
        },
      });

      if (pdfError) throw pdfError;

      // Upload do PDF para storage
      const fileName = `contracts/${contractId}/contract-${contractId}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contract-pdfs')
        .upload(fileName, pdfData.pdf, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Obter URL pública do PDF
      const { data: urlData } = supabase.storage
        .from('contract-pdfs')
        .getPublicUrl(fileName);

      const pdfUrl = urlData.publicUrl;

      // Atualizar contrato com URL do PDF
      await supabase
        .from('contracts')
        .update({ pdf_url: pdfUrl })
        .eq('id', contractId);

      return pdfUrl;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Falha ao gerar PDF do contrato');
    }
  }

  async getContractPdf(contractId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('contracts')
      .select('pdf_url')
      .eq('id', contractId)
      .single();

    if (error) return null;

    return data.pdf_url;
  }

  async regenerateContractPdf(contractId: string): Promise<string> {
    return this.generateContractPdf(contractId);
  }
}

export const pdfService = new PdfService();
