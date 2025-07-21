import { onManageActiveEffect, prepareActiveEffectCategories } from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet
 */
export class ClubeActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["clube-dos-taberneiros", "sheet", "actor"],
      width: 720,
      height: 680,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "atributos" }]
    });
  }

  /** @override */
  get template() {
    return `systems/clube-dos-taberneiros/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const context = super.getData();
    const actorData = this.actor.toObject(false);

    context.system = actorData.system;
    context.flags = actorData.flags;

    // Preparar dados específicos do tipo de ator
    if (actorData.type == 'character') {
      this._prepareCharacterData(context);
    }

    if (actorData.type == 'npc') {
      this._prepareNpcData(context);
    }

    // Preparar itens
    this._prepareItems(context);

    // Enriquecer biografia
    context.enrichedBiography = await TextEditor.enrichHTML(this.actor.system.detalhes?.historia, {async: true});

    return context;
  }

  /**
   * Organizar e classificar itens do ator para exibição na sheet
   */
  _prepareItems(context) {
    // Inicializar containers
    const armas = [];
    const armaduras = [];
    const equipamentos = [];
    const habilidades = [];
    const magias = [];

    // Iterar pelos itens e classificá-los
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      
      // Classificar por tipo
      if (i.type === 'arma') {
        armas.push(i);
      } else if (i.type === 'armadura' || i.type === 'escudo') {
        armaduras.push(i);
      } else if (i.type === 'equipamento') {
        equipamentos.push(i);
      } else if (i.type === 'habilidade') {
        habilidades.push(i);
      } else if (i.type === 'magia') {
        magias.push(i);
      }
    }

    // Atribuir e retornar
    context.armas = armas;
    context.armaduras = armaduras;
    context.equipamentos = equipamentos;
    context.habilidades = habilidades;
    context.magias = magias;
  }

  /**
   * Preparar dados específicos de personagem
   */
  _prepareCharacterData(context) {
    // Calcular total de pontos de atributos usados
    const atributos = context.system.atributos;
    context.pontosUsados = atributos.fisico.value + atributos.acao.value + 
                          atributos.mental.value + atributos.social.value;
    
    // Definir opções de raça e classe
    context.racas = {
      "humano": "Humano",
      "elfo": "Elfo", 
      "anao": "Anão",
      "halfling": "Halfling",
      "tiefling": "Tiefling",
      "goblin": "Goblin"
    };

    context.classes = {
      "guerreiro": "Guerreiro",
      "mago": "Mago",
      "ladino": "Ladino", 
      "diplomata": "Diplomata"
    };
  }

  /**
   * Preparar dados específicos de NPC
   */
  _prepareNpcData(context) {
    // Lógica específica para NPCs
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Renderizar apenas para proprietários
    if (!this.isEditable) return;

    // Adicionar inventário
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Atualizar inventário
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Deletar inventário
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities
    html.find('.rollable').click(this._onRoll.bind(this));

    // Rolar atributos
    html.find('.attribute-roll').click(this._onAttributeRoll.bind(this));

    // Rolar iniciativa
    html.find('.initiative-roll').click(this._onInitiativeRoll.bind(this));

    // Drag events for macros
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = duplicate(header.dataset);
    const name = `Novo ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    delete itemData.system["type"];
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  /**
   * Handle rolling attributes
   */
  async _onAttributeRoll(event) {
    event.preventDefault();
    const attribute = event.currentTarget.dataset.attribute;
    return this.actor.rollAttribute(attribute);
  }

  /**
   * Handle rolling initiative
   */
  async _onInitiativeRoll(event) {
    event.preventDefault();
    const roll = await this.actor.rollInitiative();
    
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: "Teste de Iniciativa",
      rollMode: game.settings.get('core', 'rollMode'),
    });
  }
}