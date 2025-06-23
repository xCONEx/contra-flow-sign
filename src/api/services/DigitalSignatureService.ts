
import crypto from 'crypto';
import { SignatureData } from '@/types/api';

export class DigitalSignatureService {
  private readonly algorithm = 'sha256';
  private readonly secretKey = process.env.DIGITAL_SIGNATURE_SECRET || 'default-secret-key';

  async generateSignature(data: {
    contractId: string;
    signerData: any;
    content: string;
  }): Promise<string> {
    // Criar string única para assinar
    const signatureString = [
      data.contractId,
      data.signerData.name,
      data.signerData.email,
      data.signerData.ip_address,
      data.content,
      new Date().toISOString(),
    ].join('|');

    // Gerar hash HMAC-SHA256
    const signature = crypto
      .createHmac(this.algorithm, this.secretKey)
      .update(signatureString)
      .digest('hex');

    return signature;
  }

  async validateSignature(
    contractId: string,
    signatureHash: string,
    originalData: {
      signerData: any;
      content: string;
      signedAt: string;
    }
  ): Promise<boolean> {
    try {
      // Recriar string de assinatura
      const signatureString = [
        contractId,
        originalData.signerData.name,
        originalData.signerData.email,
        originalData.signerData.ip_address,
        originalData.content,
        originalData.signedAt,
      ].join('|');

      // Gerar hash esperado
      const expectedSignature = crypto
        .createHmac(this.algorithm, this.secretKey)
        .update(signatureString)
        .digest('hex');

      // Comparar hashes
      return crypto.timingSafeEqual(
        Buffer.from(signatureHash, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('Error validating signature:', error);
      return false;
    }
  }

  generateSignatureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async createDigitalCertificate(signatureData: SignatureData): Promise<{
    certificate: string;
    verificationCode: string;
  }> {
    const certificateData = {
      signer: signatureData.signer_name,
      email: signatureData.signer_email,
      timestamp: signatureData.signed_at,
      ip: signatureData.ip_address,
      signature: signatureData.signature_hash,
      issuer: 'ContratPro Digital Signature Authority',
      version: '1.0',
    };

    const certificate = Buffer.from(JSON.stringify(certificateData)).toString('base64');
    const verificationCode = crypto
      .createHash('sha256')
      .update(certificate)
      .digest('hex')
      .substring(0, 16)
      .toUpperCase();

    return {
      certificate,
      verificationCode,
    };
  }

  async verifyDigitalCertificate(certificate: string, verificationCode: string): Promise<boolean> {
    try {
      const expectedCode = crypto
        .createHash('sha256')
        .update(certificate)
        .digest('hex')
        .substring(0, 16)
        .toUpperCase();

      return expectedCode === verificationCode;
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return false;
    }
  }
}

export const digitalSignatureService = new DigitalSignatureService();
