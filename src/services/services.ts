import pb from '@/lib/pocketbase/client'
import { ServiceItem } from '@/types/nfse'

export async function listServices(): Promise<ServiceItem[]> {
  try {
    return await pb.collection('services').getFullList<ServiceItem>({
      sort: 'codigo_lc116',
    })
  } catch (error) {
    console.error('Erro ao listar serviços:', error)
    return []
  }
}

export async function getServiceById(id: string): Promise<ServiceItem | null> {
  try {
    return await pb.collection('services').getOne<ServiceItem>(id)
  } catch (error) {
    console.error('Erro ao buscar serviço:', error)
    return null
  }
}

export async function createService(
  data: Omit<ServiceItem, 'id' | 'created' | 'updated'>,
): Promise<ServiceItem> {
  return await pb.collection('services').create<ServiceItem>(data)
}

export async function updateService(id: string, data: Partial<ServiceItem>): Promise<ServiceItem> {
  return await pb.collection('services').update<ServiceItem>(id, data)
}

export async function deleteService(id: string): Promise<boolean> {
  return await pb.collection('services').delete(id)
}
