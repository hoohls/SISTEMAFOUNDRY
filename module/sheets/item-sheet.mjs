/**
 * Extend the basic ItemSheet with some very simple modifications
 */
export class ClubeItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["clube-dos-taberneiros", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/clube-dos-taberneiros/templates/item";
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const context = super.getData();
    const itemData = context.item;

    context.system = itemData.system;
    context.flags = itemData.flags;

    // Adicionar dados específicos por tipo
    this._prepareItemTypeData(context);

    // Enriquecer descrição
    context.enrichedDescription = await TextEditor.enrichHTML(this.item.system.descricao, {async: true});

    return context;
  }

  /**
   * Preparar dados específicos por tipo de item
   */
  _prepareItemTypeData(context) {
    const itemType = context.item.type;

    switch (itemType) {
      case 'arma':
        this._prepareArmaData(context);
        break;
      case 'armadura':
        this._prepareArmaduraData(context);
        break;
      case 'magia':
        this._prepareMagiaData(context);
        break;
      case 'habilidade':
        this._prepareHabilidadeData(context);
        break;
    }
  }

  /**
   * Preparar dados específicos de arma
   */
  _prepareArmaData(context) {
    context.tiposArma = {
      "corpo-a-corpo": "Corpo a Corpo",
      "distancia": "À Distância"
    };

    context.propriedadesArma = {
      "duas-maos": "Duas Mãos",
      "versatil": "Versátil", 
      "alcance": "Alcance",
      "finesse": "Finesse",
      "leve": "Leve",
      "pesada": "Pesada"
    };
  }

  /**
   * Preparar dados específicos de armadura
   */
  _prepareArmaduraData(context) {
    context.tiposArmadura = {
      "leve": "Leve",
      "media": "Média",
      "pesada": "Pesada"
    };
  }

  /**
   * Preparar dados específicos de magia
   */
  _prepareMagiaData(context) {
    context.escolasMagia = {
      "elemental": "Elemental",
      "mental": "Mental",
      "natureza": "Natureza", 
      "protecao": "Proteção",
      "ilusao": "Ilusão",
      "necromancia": "Necromancia"
    };

    context.alcancesMagia = {
      "toque": "Toque",
      "pessoal": "Pessoal",
      "curto": "Curto (10m)",
      "medio": "Médio (30m)",
      "longo": "Longo (100m)",
      "visual": "Visual"
    };

    context.duracoesMagia = {
      "instantaneo": "Instantâneo",
      "concentracao": "Concentração",
      "cena": "Cena",
      "dia": "Dia",
      "permanente": "Permanente"
    };
  }

  /**
   * Preparar dados específicos de habilidade
   */
  _prepareHabilidadeData(context) {
    context.categoriasHabilidade = {
      "classe": "Classe",
      "raca": "Raça",
      "geral": "Geral",
      "combate": "Combate",
      "social": "Social",
      "exploracao": "Exploração"
    };
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Tudo abaixo aqui só funciona se a sheet for editável
    if (!this.isEditable) return;

    // Listeners específicos por tipo de item
    this._activateTypeSpecificListeners(html);
  }

  /**
   * Ativar listeners específicos por tipo
   */
  _activateTypeSpecificListeners(html) {
    const itemType = this.item.type;

    switch (itemType) {
      case 'arma':
        this._activateArmaListeners(html);
        break;
      case 'magia':
        this._activateMagiaListeners(html);
        break;
    }
  }

  /**
   * Listeners específicos para armas
   */
  _activateArmaListeners(html) {
    // Adicionar/remover propriedades de arma
    html.find('.property-toggle').click(this._onPropertyToggle.bind(this));
  }

  /**
   * Listeners específicos para magias
   */
  _activateMagiaListeners(html) {
    // Adicionar/remover componentes de magia
    html.find('.component-toggle').click(this._onComponentToggle.bind(this));
  }

  /**
   * Handle toggling weapon properties
   */
  async _onPropertyToggle(event) {
    event.preventDefault();
    const property = event.currentTarget.dataset.property;
    const properties = this.item.system.propriedades || [];
    
    let newProperties;
    if (properties.includes(property)) {
      newProperties = properties.filter(p => p !== property);
    } else {
      newProperties = [...properties, property];
    }
    
    await this.item.update({"system.propriedades": newProperties});
  }

  /**
   * Handle toggling spell components
   */
  async _onComponentToggle(event) {
    event.preventDefault();
    const component = event.currentTarget.dataset.component;
    const components = this.item.system.componentes || [];
    
    let newComponents;
    if (components.includes(component)) {
      newComponents = components.filter(c => c !== component);
    } else {
      newComponents = [...components, component];
    }
    
    await this.item.update({"system.componentes": newComponents});
  }
}