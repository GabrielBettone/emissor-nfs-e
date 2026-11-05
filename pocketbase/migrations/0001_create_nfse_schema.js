migrate(
  (app) => {
    // 1. company_settings
    const companyCol = new Collection({
      name: 'company_settings',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'razao_social', type: 'text', required: true },
        { name: 'nome_fantasia', type: 'text' },
        { name: 'cnpj', type: 'text', required: true },
        { name: 'inscricao_municipal', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'telefone', type: 'text' },
        { name: 'logradouro', type: 'text', required: true },
        { name: 'numero', type: 'text', required: true },
        { name: 'complemento', type: 'text' },
        { name: 'bairro', type: 'text', required: true },
        { name: 'municipio', type: 'text', required: true },
        { name: 'uf', type: 'text', required: true },
        { name: 'codigo_municipio_ibge', type: 'text', required: true }, // 3550407 para São Pedro/SP
        { name: 'cep', type: 'text', required: true },
        { name: 'optante_simples_nacional', type: 'bool' },
        { name: 'regime_especial_tributacao', type: 'text' }, // ex: "0" - Nenhum, "1" - Microempresa Municipal, etc.
        { name: 'aliquota_iss_padrao', type: 'number', min: 0, max: 100 },
        {
          name: 'ambiente',
          type: 'select',
          values: ['homologacao', 'producao'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(companyCol)

    // 2. services
    const servicesCol = new Collection({
      name: 'services',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'codigo_lc116', type: 'text', required: true }, // ex: 01.07, 01.03, etc.
        { name: 'cnae', type: 'text' },
        { name: 'nome', type: 'text', required: true },
        { name: 'descricao_padrao', type: 'text' },
        { name: 'aliquota_iss', type: 'number', min: 0, max: 100, required: false },
        { name: 'aliquota_pis', type: 'number', min: 0, max: 100 },
        { name: 'aliquota_cofins', type: 'number', min: 0, max: 100 },
        { name: 'aliquota_irrf', type: 'number', min: 0, max: 100 },
        { name: 'aliquota_csll', type: 'number', min: 0, max: 100 },
        { name: 'aliquota_inss', type: 'number', min: 0, max: 100 },
        { name: 'retencao_iss_padrao', type: 'bool' },
        { name: 'ativo', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(servicesCol)

    // 3. certificates
    const certsCol = new Collection({
      name: 'certificates',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome_arquivo', type: 'text', required: true },
        { name: 'arquivo', type: 'file', maxSelect: 1, maxSize: 10485760 }, // até 10MB para .pfx / .p12
        { name: 'senha', type: 'text' },
        { name: 'validade_inicio', type: 'text' },
        { name: 'validade_fim', type: 'text' },
        { name: 'titular', type: 'text' },
        { name: 'cnpj', type: 'text' },
        { name: 'ativo', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(certsCol)

    // 4. invoices (NFS-e / RPS)
    const invoicesCol = new Collection({
      name: 'invoices',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'numero_rps', type: 'number', min: 1, onlyInt: true, required: true },
        { name: 'serie_rps', type: 'text', required: true }, // ex: "1"
        { name: 'tipo_rps', type: 'text' }, // "1" - RPS
        { name: 'data_emissao', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          values: [
            'rascunho',
            'emitida',
            'enviada',
            'processando',
            'autorizada',
            'cancelada',
            'rejeitada',
          ],
          maxSelect: 1,
          required: true,
        },

        // Tomador
        {
          name: 'tomador_tipo',
          type: 'select',
          values: ['PJ', 'PF', 'EXTERIOR'],
          maxSelect: 1,
          required: true,
        },
        { name: 'tomador_documento', type: 'text', required: true }, // CNPJ ou CPF
        { name: 'tomador_razao_social', type: 'text', required: true },
        { name: 'tomador_email', type: 'email' },
        { name: 'tomador_telefone', type: 'text' },
        { name: 'tomador_logradouro', type: 'text' },
        { name: 'tomador_numero', type: 'text' },
        { name: 'tomador_complemento', type: 'text' },
        { name: 'tomador_bairro', type: 'text' },
        { name: 'tomador_municipio', type: 'text' },
        { name: 'tomador_uf', type: 'text' },
        { name: 'tomador_cep', type: 'text' },
        { name: 'tomador_codigo_municipio', type: 'text' },

        // Serviço
        { name: 'service_id', type: 'relation', collectionId: servicesCol.id, maxSelect: 1 },
        { name: 'codigo_lc116', type: 'text', required: true },
        { name: 'cnae', type: 'text' },
        { name: 'discriminacao', type: 'text', required: true },
        { name: 'municipio_prestacao_codigo', type: 'text', required: true },
        { name: 'municipio_prestacao_nome', type: 'text' },

        // Valores e Impostos
        { name: 'valor_servicos', type: 'number', min: 0, required: false },
        { name: 'valor_deducoes', type: 'number', min: 0 },
        { name: 'desconto_incondicionado', type: 'number', min: 0 },
        { name: 'desconto_condicionado', type: 'number', min: 0 },
        { name: 'base_calculo', type: 'number', min: 0, required: false },

        { name: 'aliquota_iss', type: 'number', min: 0, max: 100, required: false },
        { name: 'valor_iss', type: 'number', min: 0, required: false },
        { name: 'iss_retido', type: 'bool' },

        { name: 'aliquota_pis', type: 'number', min: 0, max: 100 },
        { name: 'valor_pis', type: 'number', min: 0 },

        { name: 'aliquota_cofins', type: 'number', min: 0, max: 100 },
        { name: 'valor_cofins', type: 'number', min: 0 },

        { name: 'aliquota_inss', type: 'number', min: 0, max: 100 },
        { name: 'valor_inss', type: 'number', min: 0 },

        { name: 'aliquota_irrf', type: 'number', min: 0, max: 100 },
        { name: 'valor_irrf', type: 'number', min: 0 },

        { name: 'aliquota_csll', type: 'number', min: 0, max: 100 },
        { name: 'valor_csll', type: 'number', min: 0 },

        { name: 'outras_retencoes', type: 'number', min: 0 },
        { name: 'valor_liquido', type: 'number', min: 0, required: false },

        // Retorno do Sistema Nacional
        {
          name: 'ambiente',
          type: 'select',
          values: ['homologacao', 'producao'],
          maxSelect: 1,
          required: true,
        },
        { name: 'numero_nfse', type: 'text' }, // Número gerado no padrão nacional
        { name: 'codigo_verificacao', type: 'text' },
        { name: 'chave_acesso', type: 'text' },
        { name: 'protocolo_envio', type: 'text' },
        { name: 'data_autorizacao', type: 'text' },
        { name: 'link_danfse', type: 'text' },
        { name: 'xml_conteudo', type: 'text' },
        { name: 'mensagem_retorno', type: 'text' },
        { name: 'motivo_rejeicao', type: 'text' },

        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_invoices_numero_rps ON invoices (numero_rps)',
        'CREATE INDEX idx_invoices_status ON invoices (status)',
        'CREATE INDEX idx_invoices_chave ON invoices (chave_acesso)',
      ],
    })
    app.save(invoicesCol)
  },
  (app) => {
    try {
      const inv = app.findCollectionByNameOrId('invoices')
      app.delete(inv)
    } catch (_) {}
    try {
      const cert = app.findCollectionByNameOrId('certificates')
      app.delete(cert)
    } catch (_) {}
    try {
      const srv = app.findCollectionByNameOrId('services')
      app.delete(srv)
    } catch (_) {}
    try {
      const comp = app.findCollectionByNameOrId('company_settings')
      app.delete(comp)
    } catch (_) {}
  },
)
