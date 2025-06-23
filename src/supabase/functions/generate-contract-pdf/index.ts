
// @deno-types="https://deno.land/x/puppeteer@16.2.0/vendor/puppeteer-core/puppeteer/types.d.ts"
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { contract, options } = await req.json();

    // Gerar HTML do contrato
    const html = generateContractHtml(contract, options);

    // Converter para PDF usando Puppeteer
    const pdfBuffer = await generatePdfFromHtml(html, options);

    return new Response(JSON.stringify({ 
      pdf: Array.from(new Uint8Array(pdfBuffer)),
      success: true 
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  }
});

function generateContractHtml(contract: any, options: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${contract.title}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .contract-title {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .contract-info {
          background-color: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .label {
          font-weight: bold;
          color: #475569;
        }
        .content {
          white-space: pre-wrap;
          text-align: justify;
          margin-bottom: 30px;
        }
        .signature-section {
          margin-top: 50px;
          border-top: 1px solid #e2e8f0;
          padding-top: 30px;
        }
        .signature-box {
          border: 1px solid #cbd5e1;
          padding: 15px;
          margin: 20px 0;
          min-height: 80px;
          background-color: #f8fafc;
        }
        .digital-signature {
          background-color: #22c55e;
          color: white;
          padding: 10px;
          border-radius: 4px;
          text-align: center;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="contract-title">${contract.title}</div>
        <div>Contrato Digital - ContratPro</div>
      </div>

      <div class="contract-info">
        <div class="info-row">
          <span class="label">Cliente:</span>
          <span>${contract.clients?.name || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="label">Email:</span>
          <span>${contract.clients?.email || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="label">Valor:</span>
          <span>${contract.value ? `R$ ${contract.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não especificado'}</span>
        </div>
        <div class="info-row">
          <span class="label">Data de Criação:</span>
          <span>${new Date(contract.created_at).toLocaleDateString('pt-BR')}</span>
        </div>
        ${contract.signed_at ? `
        <div class="info-row">
          <span class="label">Data de Assinatura:</span>
          <span>${new Date(contract.signed_at).toLocaleDateString('pt-BR')}</span>
        </div>
        ` : ''}
      </div>

      <div class="content">
        ${contract.content}
      </div>

      <div class="signature-section">
        <h3>Assinaturas</h3>
        
        <div>
          <strong>Contratante:</strong>
          <div class="signature-box">
            ContratPro - Sistema de Contratos Digitais
          </div>
        </div>

        <div>
          <strong>Contratado:</strong>
          <div class="signature-box">
            ${contract.signature_data ? `
              <div class="digital-signature">
                ✓ ASSINADO DIGITALMENTE
              </div>
              <div style="margin-top: 10px;">
                <strong>Nome:</strong> ${contract.signature_data.signer_name}<br>
                <strong>Email:</strong> ${contract.signature_data.signer_email}<br>
                <strong>Data:</strong> ${new Date(contract.signature_data.signed_at).toLocaleString('pt-BR')}<br>
                <strong>Hash:</strong> ${contract.signature_data.signature_hash.substring(0, 16)}...
              </div>
            ` : 'Aguardando assinatura'}
          </div>
        </div>
      </div>

      <div class="footer">
        <p>Este documento foi gerado pelo ContratPro em ${new Date().toLocaleString('pt-BR')}</p>
        <p>Contrato ID: ${contract.id}</p>
        ${contract.signature_data ? `
          <p style="color: #22c55e; font-weight: bold;">
            ✓ DOCUMENTO ASSINADO DIGITALMENTE - VALIDADE JURÍDICA GARANTIDA
          </p>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}

async function generatePdfFromHtml(html: string, options: any): Promise<ArrayBuffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '1in',
      right: '1in',
      bottom: '1in',
      left: '1in',
    },
    ...options
  });

  await browser.close();
  return pdfBuffer;
}
