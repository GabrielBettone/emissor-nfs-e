import pb from '@/lib/pocketbase/client'
import { CompanySettings } from '@/types/nfse'

export async function getCompanySettings(): Promise<CompanySettings | null> {
  try {
    const list = await pb.collection('company_settings').getList<CompanySettings>(1, 1)
    if (list.items.length > 0) {
      return list.items[0]
    }
    return null
  } catch (error) {
    console.error('Erro ao buscar configurações da empresa:', error)
    return null
  }
}

export async function saveCompanySettings(
  data: Partial<CompanySettings>,
  existingId?: string,
): Promise<CompanySettings> {
  if (existingId) {
    return await pb.collection('company_settings').update<CompanySettings>(existingId, data)
  }
  const current = await getCompanySettings()
  if (current) {
    return await pb.collection('company_settings').update<CompanySettings>(current.id, data)
  }
  return await pb.collection('company_settings').create<CompanySettings>(data)
}
