
import jsPDF from 'jspdf';
import { Contract } from '@/hooks/useContracts';

export const generateContractPDF = (contract: Contract, signatureUrl?: string) => {
  const pdf = new jsPDF();
  
  // Configurações
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Função para adicionar texto com quebra de linha
  const addText = (text: string, fontSize = 12, isBold = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
    
    for (let i = 0; i < lines.length; i++) {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(lines[i], margin, yPosition);
      yPosition += lineHeight;
    }
    
    yPosition += 5; // Espaço extra após o parágrafo
  };

  // Cabeçalho
  addText('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', 16, true);
  yPosition += 10;

  // Informações do contrato
  addText(`Título: ${contract.title}`, 14, true);
  addText(`Cliente: ${contract.client?.name || 'N/A'}`);
  addText(`E-mail: ${contract.client?.email || 'N/A'}`);
  
  if (contract.total_value) {
    addText(`Valor: R$ ${contract.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  }
  
  if (contract.due_date) {
    addText(`Data de Vencimento: ${new Date(contract.due_date).toLocaleDateString('pt-BR')}`);
  }
  
  addText(`Status: ${getStatusLabel(contract.status)}`);
  addText(`Data de Criação: ${new Date(contract.created_at).toLocaleDateString('pt-BR')}`);
  
  if (contract.sent_at) {
    addText(`Data de Envio: ${new Date(contract.sent_at).toLocaleDateString('pt-BR')}`);
  }
  
  if (contract.signed_at) {
    addText(`Data de Assinatura: ${new Date(contract.signed_at).toLocaleDateString('pt-BR')}`);
  }

  yPosition += 10;

  // Separador
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Conteúdo do contrato
  addText('CONTEÚDO DO CONTRATO:', 14, true);
  addText(contract.content);

  // Assinatura (se disponível)
  if (signatureUrl && contract.status === 'signed') {
    yPosition += 20;
    
    // Verificar se há espaço para a assinatura
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
    }
    
    addText('ASSINATURA:', 12, true);
    
    try {
      // Adicionar imagem da assinatura
      pdf.addImage(signatureUrl, 'PNG', margin, yPosition, 80, 40);
      yPosition += 50;
    } catch (error) {
      console.error('Erro ao adicionar assinatura:', error);
      addText('Assinatura eletrônica aplicada');
    }
  }

  // Rodapé
  const today = new Date().toLocaleDateString('pt-BR');
  pdf.setFontSize(8);
  pdf.text(`Documento gerado em ${today}`, margin, pageHeight - 10);

  return pdf;
};

const getStatusLabel = (status: string) => {
  const statusLabels = {
    draft: 'Rascunho',
    sent: 'Enviado',
    signed: 'Assinado',
    expired: 'Expirado',
    cancelled: 'Cancelado'
  };
  return statusLabels[status as keyof typeof statusLabels] || status;
};

export const downloadContractPDF = (contract: Contract, signatureUrl?: string) => {
  const pdf = generateContractPDF(contract, signatureUrl);
  const fileName = `contrato-${contract.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`;
  pdf.save(fileName);
};
