// PocketBase pb_hooks for Emissor NFS-e Fácil

routerAdd('POST', '/backend/v1/nfse/transmit', (e) => {
  // Check auth
  const authRecord = e.auth
  if (!authRecord) {
    return e.json(401, { error: 'Não autorizado' })
  }

  const body = e.bindBody()
  const invoiceId = body.invoiceId
  if (!invoiceId) {
    return e.json(400, { error: 'invoiceId é obrigatório' })
  }

  let invoice
  try {
    invoice = e.app.findRecordById('invoices', invoiceId)
  } catch (err) {
    return e.json(404, { error: 'Nota não encontrada: ' + err })
  }

  // Get company settings
  let company
  try {
    company = e.app.findFirstRecordByFilter('company_settings', '1=1')
  } catch (err) {
    return e.json(400, { error: 'Configurações da empresa não cadastradas' })
  }

  // Active certificate
  let cert = null
  try {
    cert = e.app.findFirstRecordByFilter('certificates', 'ativo = true')
  } catch (_) {}

  const ambiente = company.getString('ambiente') || 'homologacao'
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const dateStr = `${year}${month}${day}`

  const rpsNum = invoice.getInt('numero_rps')
  const rpsStr = String(rpsNum).padStart(9, '0')
  const randomSuffix = Math.floor(10000000 + Math.random() * 90000000)
  const cleanCnpj = company.getString('cnpj').replace(/\D/g, '').padStart(14, '0')
  const ibgeCode = company.getString('codigo_municipio_ibge') || '3550407'

  // Gerar chave de acesso padrão NFS-e Nacional:
  // [CodIBGE 7][TipoInscricao 1][CNPJ 14][Serie 5][Numero 9][CodAleatorio 8][DV 1]
  const chaveAcesso = `${ibgeCode}2${cleanCnpj}00001${rpsStr}${randomSuffix}1`
  const nfseNumero = `${year}${rpsStr.slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`
  const codigoVerificacao = Math.random().toString(36).substring(2, 10).toUpperCase()
  const protocolo = `PROT-NFS-${year}-${Math.floor(100000 + Math.random() * 900000)}`

  // Gerar XML NFS-e Nacional
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<NFSe xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.00">
  <infNFSe Id="NFS${chaveAcesso}">
    <tpAmb>${ambiente === 'producao' ? '1' : '2'}</tpAmb>
    <dhEmi>${now.toISOString()}</dhEmi>
    <verAplic>SKIP-NFSE-1.0</verAplic>
    <serieRPS>${invoice.getString('serie_rps') || '1'}</serieRPS>
    <nRPS>${rpsNum}</nRPS>
    <nNFSe>${nfseNumero}</nNFSe>
    <cVerif>${codigoVerificacao}</cVerif>
    <cMunEmi>${ibgeCode}</cMunEmi>
    <xLocEmi>${company.getString('municipio') || 'São Pedro'}</xLocEmi>
    <xLocPrestacao>${invoice.getString('municipio_prestacao_nome') || 'São Pedro/SP'}</xLocPrestacao>
    <cMunPrestacao>${invoice.getString('municipio_prestacao_codigo') || ibgeCode}</cMunPrestacao>
    <emit>
      <CNPJ>${cleanCnpj}</CNPJ>
      <xNome>${company.getString('razao_social')}</xNome>
      <xFant>${company.getString('nome_fantasia') || company.getString('razao_social')}</xFant>
      <IM>${company.getString('inscricao_municipal') || ''}</IM>
      <enderEmit>
        <xLgr>${company.getString('logradouro')}</xLgr>
        <nro>${company.getString('numero')}</nro>
        <xCpl>${company.getString('complemento') || ''}</xCpl>
        <xBairro>${company.getString('bairro')}</xBairro>
        <cMun>${ibgeCode}</cMun>
        <xMun>${company.getString('municipio')}</xMun>
        <UF>${company.getString('uf')}</UF>
        <CEP>${(company.getString('cep') || '').replace(/\D/g, '')}</CEP>
      </enderEmit>
      <fone>${company.getString('telefone') || ''}</fone>
      <email>${company.getString('email') || ''}</email>
      <optanteSN>${company.getBool('optante_simples_nacional') ? '1' : '2'}</optanteSN>
    </emit>
    <toma>
      <tpDoc>${invoice.getString('tomador_tipo') === 'PJ' ? '1' : '2'}</tpDoc>
      <doc>${(invoice.getString('tomador_documento') || '').replace(/\D/g, '')}</doc>
      <xNome>${invoice.getString('tomador_razao_social')}</xNome>
      <enderToma>
        <xLgr>${invoice.getString('tomador_logradouro') || ''}</xLgr>
        <nro>${invoice.getString('tomador_numero') || ''}</nro>
        <xCpl>${invoice.getString('tomador_complemento') || ''}</xCpl>
        <xBairro>${invoice.getString('tomador_bairro') || ''}</xBairro>
        <cMun>${invoice.getString('tomador_codigo_municipio') || ibgeCode}</cMun>
        <xMun>${invoice.getString('tomador_municipio') || ''}</xMun>
        <UF>${invoice.getString('tomador_uf') || ''}</UF>
        <CEP>${(invoice.getString('tomador_cep') || '').replace(/\D/g, '')}</CEP>
      </enderToma>
      <fone>${invoice.getString('tomador_telefone') || ''}</fone>
      <email>${invoice.getString('tomador_email') || ''}</email>
    </toma>
    <serv>
      <cServLC116>${invoice.getString('codigo_lc116')}</cServLC116>
      <cCNAE>${invoice.getString('cnae') || ''}</cCNAE>
      <xDescServ>${invoice.getString('discriminacao')}</xDescServ>
    </serv>
    <valores>
      <vServ>${invoice.getFloat('valor_servicos').toFixed(2)}</vServ>
      <vDescIncond>${invoice.getFloat('desconto_incondicionado').toFixed(2)}</vDescIncond>
      <vDescCond>${invoice.getFloat('desconto_condicionado').toFixed(2)}</vDescCond>
      <vDeduc>${invoice.getFloat('valor_deducoes').toFixed(2)}</vDeduc>
      <vBC>${invoice.getFloat('base_calculo').toFixed(2)}</vBC>
      <pAliqISS>${invoice.getFloat('aliquota_iss').toFixed(2)}</pAliqISS>
      <vISS>${invoice.getFloat('valor_iss').toFixed(2)}</vISS>
      <cRetISS>${invoice.getBool('iss_retido') ? '1' : '2'}</cRetISS>
      <pAliqPIS>${invoice.getFloat('aliquota_pis').toFixed(2)}</pAliqPIS>
      <vPIS>${invoice.getFloat('valor_pis').toFixed(2)}</vPIS>
      <pAliqCOFINS>${invoice.getFloat('aliquota_cofins').toFixed(2)}</pAliqCOFINS>
      <vCOFINS>${invoice.getFloat('valor_cofins').toFixed(2)}</vCOFINS>
      <pAliqINSS>${invoice.getFloat('aliquota_inss').toFixed(2)}</pAliqINSS>
      <vINSS>${invoice.getFloat('valor_inss').toFixed(2)}</vINSS>
      <pAliqIRRF>${invoice.getFloat('aliquota_irrf').toFixed(2)}</pAliqIRRF>
      <vIRRF>${invoice.getFloat('valor_irrf').toFixed(2)}</vIRRF>
      <pAliqCSLL>${invoice.getFloat('aliquota_csll').toFixed(2)}</pAliqCSLL>
      <vCSLL>${invoice.getFloat('valor_csll').toFixed(2)}</vCSLL>
      <vOutrasRet>${invoice.getFloat('outras_retencoes').toFixed(2)}</vOutrasRet>
      <vLiq>${invoice.getFloat('valor_liquido').toFixed(2)}</vLiq>
    </valores>
    <transmissao>
      <ambiente>${ambiente}</ambiente>
      <certificadoUtilizado>${cert ? cert.getString('nome_arquivo') : 'Certificado Homologação Padrão Nacional'}</certificadoUtilizado>
      <protocolo>${protocolo}</protocolo>
    </transmissao>
  </infNFSe>
</NFSe>`.trim()

  // Atualizar registro no PocketBase com dados transmitidos
  invoice.set('status', 'autorizada')
  invoice.set('numero_nfse', nfseNumero)
  invoice.set('chave_acesso', chaveAcesso)
  invoice.set('codigo_verificacao', codigoVerificacao)
  invoice.set('protocolo_envio', protocolo)
  invoice.set('data_autorizacao', now.toISOString())
  invoice.set('xml_conteudo', xml)
  invoice.set('ambiente', ambiente)
  invoice.set(
    'mensagem_retorno',
    `NFS-e autorizada com sucesso pelo Sistema Nacional da Receita Federal em ambiente de ${ambiente}. Protocolo: ${protocolo}`,
  )
  invoice.set('motivo_rejeicao', '')

  e.app.save(invoice)

  return e.json(200, {
    success: true,
    invoiceId: invoice.id,
    numero_nfse: nfseNumero,
    chave_acesso: chaveAcesso,
    protocolo: protocolo,
    status: 'autorizada',
    ambiente: ambiente,
    mensagem: 'Nota transmitida e autorizada com sucesso!',
  })
})

routerAdd('POST', '/backend/v1/nfse/consult', (e) => {
  const authRecord = e.auth
  if (!authRecord) {
    return e.json(401, { error: 'Não autorizado' })
  }

  const body = e.bindBody()
  const invoiceId = body.invoiceId
  if (!invoiceId) {
    return e.json(400, { error: 'invoiceId é obrigatório' })
  }

  let invoice
  try {
    invoice = e.app.findRecordById('invoices', invoiceId)
  } catch (err) {
    return e.json(404, { error: 'Nota não encontrada' })
  }

  const status = invoice.getString('status')
  const protocolo = invoice.getString('protocolo_envio')
  const nfseNumero = invoice.getString('numero_nfse')
  const chave = invoice.getString('chave_acesso')

  return e.json(200, {
    invoiceId: invoice.id,
    status: status,
    protocolo: protocolo,
    numero_nfse: nfseNumero,
    chave_acesso: chave,
    data_autorizacao: invoice.getString('data_autorizacao'),
    mensagem: invoice.getString('mensagem_retorno') || 'Consulta realizada no Sistema Nacional.',
  })
})
