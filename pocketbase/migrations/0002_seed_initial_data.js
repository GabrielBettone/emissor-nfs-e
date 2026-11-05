migrate(
  (app) => {
    // 1. Seed user if not present
    try {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      try {
        app.findAuthRecordByEmail('_pb_users_auth_', 'gabrielgiovani@msn.com')
      } catch (_) {
        const user = new Record(users)
        user.setEmail('gabrielgiovani@msn.com')
        user.setPassword('Skip@Pass')
        user.setVerified(true)
        user.set('name', 'GB Soluções Admin')
        app.save(user)
      }
    } catch (err) {
      console.log('Erro seed user:', err)
    }

    // 2. Seed company_settings: GB SOLUCOES LTDA
    // CNPJ 53.242.055/0001-74, R Heitor Mariotti 185, Mariluz, São Pedro/SP, CEP 13.522-340
    try {
      const compCol = app.findCollectionByNameOrId('company_settings')
      const existing = app.findRecordsByFilter(
        'company_settings',
        "cnpj = '53.242.055/0001-74'",
        '',
        1,
        0,
      )
      if (existing.length === 0) {
        const comp = new Record(compCol)
        comp.set('razao_social', 'GB SOLUCOES LTDA')
        comp.set('nome_fantasia', 'GB Soluções')
        comp.set('cnpj', '53.242.055/0001-74')
        comp.set('inscricao_municipal', '12345/01')
        comp.set('email', 'contato@gbsolucoes.com.br')
        comp.set('telefone', '(19) 3481-9000')
        comp.set('logradouro', 'Rua Heitor Mariotti')
        comp.set('numero', '185')
        comp.set('complemento', 'Sala 01')
        comp.set('bairro', 'Mariluz')
        comp.set('municipio', 'São Pedro')
        comp.set('uf', 'SP')
        comp.set('codigo_municipio_ibge', '3550407') // Código IBGE de São Pedro - SP
        comp.set('cep', '13522-340')
        comp.set('optante_simples_nacional', true)
        comp.set('regime_especial_tributacao', '1')
        comp.set('aliquota_iss_padrao', 2.0)
        comp.set('ambiente', 'homologacao')
        app.save(comp)
      }
    } catch (err) {
      console.log('Erro seed company_settings:', err)
    }

    // 3. Seed services based on GB Soluções activities (TI, Consultoria, Desenvolvimento de Software, Suporte Técnico, Treinamento)
    try {
      const servicesCol = app.findCollectionByNameOrId('services')
      const defaultServices = [
        {
          codigo_lc116: '01.07',
          cnae: '6201-5/01',
          nome: 'Desenvolvimento de Programas de Computador sob Encomenda',
          descricao_padrao:
            'Desenvolvimento de software personalizado, implementação de rotinas de sistemas web e suporte à integração.',
          aliquota_iss: 2.0,
          aliquota_pis: 0.65,
          aliquota_cofins: 3.0,
          aliquota_irrf: 1.5,
          aliquota_csll: 1.0,
          aliquota_inss: 0,
          retencao_iss_padrao: false,
          ativo: true,
        },
        {
          codigo_lc116: '01.03',
          cnae: '6202-3/00',
          nome: 'Processamento de Dados e Serviços de Hospedagem (Cloud)',
          descricao_padrao:
            'Serviços de infraestrutura cloud, processamento de dados e hospedagem de aplicações corporativas.',
          aliquota_iss: 2.0,
          aliquota_pis: 0.65,
          aliquota_cofins: 3.0,
          aliquota_irrf: 1.5,
          aliquota_csll: 1.0,
          aliquota_inss: 0,
          retencao_iss_padrao: false,
          ativo: true,
        },
        {
          codigo_lc116: '01.06',
          cnae: '6204-0/00',
          nome: 'Consultoria em Tecnologia da Informação',
          descricao_padrao:
            'Assessoria e consultoria técnica especializada na especificação e otimização de arquitetura de TI.',
          aliquota_iss: 2.0,
          aliquota_pis: 0.65,
          aliquota_cofins: 3.0,
          aliquota_irrf: 1.5,
          aliquota_csll: 1.0,
          aliquota_inss: 0,
          retencao_iss_padrao: false,
          ativo: true,
        },
        {
          codigo_lc116: '01.08',
          cnae: '6209-1/00',
          nome: 'Suporte Técnico e Manutenção em TI',
          descricao_padrao:
            'Suporte técnico operacional, configuração de rotinas e manutenção preventiva de serviços tecnológicos.',
          aliquota_iss: 2.0,
          aliquota_pis: 0.65,
          aliquota_cofins: 3.0,
          aliquota_irrf: 1.5,
          aliquota_csll: 1.0,
          aliquota_inss: 0,
          retencao_iss_padrao: false,
          ativo: true,
        },
        {
          codigo_lc116: '08.02',
          cnae: '8599-6/03',
          nome: 'Treinamento e Capacitação em Informática e Sistemas',
          descricao_padrao:
            'Treinamento ministrado a equipes corporativas no uso de plataformas digitais e sistemas em nuvem.',
          aliquota_iss: 2.0,
          aliquota_pis: 0.65,
          aliquota_cofins: 3.0,
          aliquota_irrf: 1.5,
          aliquota_csll: 1.0,
          aliquota_inss: 0,
          retencao_iss_padrao: false,
          ativo: true,
        },
      ]

      for (const s of defaultServices) {
        const existing = app.findRecordsByFilter(
          'services',
          `codigo_lc116 = '${s.codigo_lc116}'`,
          '',
          1,
          0,
        )
        if (existing.length === 0) {
          const srv = new Record(servicesCol)
          for (const key of Object.keys(s)) {
            srv.set(key, s[key])
          }
          app.save(srv)
        }
      }
    } catch (err) {
      console.log('Erro seed services:', err)
    }

    // 4. Seed an initial sample invoice
    try {
      const invCol = app.findCollectionByNameOrId('invoices')
      const existing = app.findRecordsByFilter('invoices', 'numero_rps = 1', '', 1, 0)
      if (existing.length === 0) {
        const srvList = app.findRecordsByFilter('services', "codigo_lc116 = '01.07'", '', 1, 0)
        const serviceId = srvList.length > 0 ? srvList[0].id : null

        const inv = new Record(invCol)
        inv.set('numero_rps', 1)
        inv.set('serie_rps', '1')
        inv.set('tipo_rps', '1')
        inv.set('data_emissao', new Date().toISOString().split('T')[0])
        inv.set('status', 'autorizada')
        inv.set('tomador_tipo', 'PJ')
        inv.set('tomador_documento', '06.990.590/0001-23')
        inv.set('tomador_razao_social', 'GOOGLE BRASIL INTERNET LTDA')
        inv.set('tomador_email', 'faturamento@google.com.br')
        inv.set('tomador_telefone', '(11) 2395-6000')
        inv.set('tomador_logradouro', 'Avenida Brigadeiro Faria Lima')
        inv.set('tomador_numero', '3477')
        inv.set('tomador_bairro', 'Itaim Bibi')
        inv.set('tomador_municipio', 'São Paulo')
        inv.set('tomador_uf', 'SP')
        inv.set('tomador_cep', '04538-133')
        inv.set('tomador_codigo_municipio', '3550308')

        if (serviceId) inv.set('service_id', serviceId)
        inv.set('codigo_lc116', '01.07')
        inv.set('cnae', '6201-5/01')
        inv.set(
          'discriminacao',
          'Prestação de serviços de desenvolvimento de software em nuvem e integração de APIs corporativas.',
        )
        inv.set('municipio_prestacao_codigo', '3550407')
        inv.set('municipio_prestacao_nome', 'São Pedro/SP')

        const vServ = 4500.0
        const vIss = 90.0 // 2%
        const vPis = 29.25 // 0.65%
        const vCofins = 135.0 // 3%
        const vIrrf = 67.5 // 1.5%
        const vCsll = 45.0 // 1%
        const vLiq = vServ - (vPis + vCofins + vIrrf + vCsll)

        inv.set('valor_servicos', vServ)
        inv.set('valor_deducoes', 0)
        inv.set('desconto_incondicionado', 0)
        inv.set('desconto_condicionado', 0)
        inv.set('base_calculo', vServ)
        inv.set('aliquota_iss', 2.0)
        inv.set('valor_iss', vIss)
        inv.set('iss_retido', false)

        inv.set('aliquota_pis', 0.65)
        inv.set('valor_pis', vPis)
        inv.set('aliquota_cofins', 3.0)
        inv.set('valor_cofins', vCofins)
        inv.set('aliquota_inss', 0)
        inv.set('valor_inss', 0)
        inv.set('aliquota_irrf', 1.5)
        inv.set('valor_irrf', vIrrf)
        inv.set('aliquota_csll', 1.0)
        inv.set('valor_csll', vCsll)
        inv.set('outras_retencoes', 0)
        inv.set('valor_liquido', vLiq)

        inv.set('ambiente', 'homologacao')
        inv.set('numero_nfse', '20250000000001')
        inv.set('codigo_verificacao', 'A8B9C0D1')
        inv.set('chave_acesso', '352501532420550001740000000000000001')
        inv.set('protocolo_envio', 'PROT-NFS-2025-0019482')
        inv.set('data_autorizacao', new Date().toISOString())
        inv.set('mensagem_retorno', 'NFS-e gerada e autorizada com sucesso no Sistema Nacional.')
        inv.set(
          'xml_conteudo',
          '<?xml version="1.0" encoding="UTF-8"?><NFSe xmlns="http://www.sped.fazenda.gov.br/nfse"><infNFSe Id="NFS352501532420550001740000000000000001"><xLocEmi>São Pedro</xLocEmi><xLocPrestacao>São Pedro</xLocPrestacao><nNFSe>20250000000001</nNFSe><cVerif>A8B9C0D1</cVerif><dhEmi>' +
            new Date().toISOString() +
            '</dhEmi><emit><CNPJ>53242055000174</CNPJ><xNome>GB SOLUCOES LTDA</xNome></emit><toma><CNPJ>06990590000123</CNPJ><xNome>GOOGLE BRASIL INTERNET LTDA</xNome></toma><valores><vServ>4500.00</vServ><vISS>90.00</vISS><vLiq>4223.25</vLiq></valores></infNFSe></NFSe>',
        )

        app.save(inv)
      }
    } catch (err) {
      console.log('Erro seed invoice:', err)
    }
  },
  (app) => {
    // rollback
  },
)
