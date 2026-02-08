import { affiliates } from '@/lib/appwrite/database';
import { Query } from 'appwrite';
import { validateAffiliateCodeFormat } from './code-generator';

/**
 * Check if an affiliate code exists and is active
 */
export async function validateAffiliateCode(code: string): Promise<{
  valid: boolean;
  affiliateId?: string;
  userId?: string;
  error?: string;
}> {
  // Validate format
  if (!validateAffiliateCodeFormat(code)) {
    return {
      valid: false,
      error: 'Invalid affiliate code format',
    };
  }

  try {
    // Check if code exists in database
    interface AffiliateDocument {
      $id: string;
      userId: string;
      code: string;
    }
    
    const affiliateDocs = await affiliates.list<AffiliateDocument>([
      Query.equal('code', code),
      Query.equal('isActive', true),
    ]);

    if (affiliateDocs.documents.length === 0) {
      return {
        valid: false,
        error: 'Affiliate code not found or inactive',
      };
    }

    const affiliate = affiliateDocs.documents[0];

    return {
      valid: true,
      affiliateId: affiliate.$id,
      userId: affiliate.userId,
    };
  } catch (error: any) {
    console.error('Error validating affiliate code:', error);
    return {
      valid: false,
      error: 'Error validating affiliate code',
    };
  }
}
