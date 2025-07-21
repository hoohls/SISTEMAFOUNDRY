/**
 * Extend the base Item document
 */
export class ClubeItem extends Item {

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareDerivedData() {
    const itemData = this;
    const systemData = itemData.system;
    const flags = itemData.flags.clube || {};

    // Preparar dados específicos por tipo
    this._prepareArmaData(itemData);
    this._prepareArmaduraData(itemData);
    this._prepareMagiaData(itemData);
  }

  /**
   * Preparar dados de arma
   */
  _prepareArmaData(itemData) {
    if (itemData.type !== 'arma') return;
    // Lógica específica para armas
  }

  /**
   * Preparar dados de armadura
   */
  _prepareArmaduraData(itemData) {
    if (itemData.type !== 'armadura') return;
    // Lógica específica para armaduras
  }

  /**
   * Preparar dados de magia
   */
  _prepareMagiaData(itemData) {
    if (itemData.type !== 'magia') return;
    // Lógica específica para magias
  }

  /**
   * Rolar item (ataque, magia, etc.)
   */
  async roll() {
    const item = this;
    const actor = this.actor;
    
    if (!actor) {
      ui.notifications.warn("Este item não está associado a um ator.");
      return;
    }

    // Diferentes tipos de rolagem baseado no tipo do item
    switch (item.type) {
      case 'arma':
        return this._rollAttack();
      case 'magia':
        return this._rollSpell();
      case 'habilidade':
        return this._rollAbility();
      default:
        return this._rollGeneric();
    }
  }

  /**
   * Rolar ataque com arma
   */
  async _rollAttack() {
    const actor = this.actor;
    const itemData = this.system;
    
    // Determinar atributo baseado no tipo de arma
    let atributo;
    if (itemData.tipo === 'corpo-a-corpo') {
      atributo = actor.system.atributos.fisico.value;
    } else {
      atributo = actor.system.atributos.acao.value;
    }

    // Rolar ataque
    const attackRoll = new Roll("2d6 + @attr", { attr: atributo });
    await attackRoll.evaluate();

    // Rolar dano se acertar (assumindo que acertou por simplicidade)
    const damageRoll = new Roll(itemData.dano);
    await damageRoll.evaluate();

    // Criar mensagem no chat
    const template = "systems/clube-dos-taberneiros/templates/chat/attack-roll.html";
    const templateContext = {
      actor: actor,
      item: this,
      attackRoll: attackRoll,
      damageRoll: damageRoll,
      isAttack: true
    };

    const content = await renderTemplate(template, templateContext);

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      content: content,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      rolls: [attackRoll, damageRoll]
    });

    return { attackRoll, damageRoll };
  }

  /**
   * Rolar magia
   */
  async _rollSpell() {
    const actor = this.actor;
    const itemData = this.system;

    // Verificar se tem PM suficientes
    if (actor.system.pm.value < itemData.custo) {
      ui.notifications.warn("Pontos de Magia insuficientes!");
      return;
    }

    // Gastar PM
    await actor.spendMagicPoints(itemData.custo);

    // Rolar efeito da magia (se aplicável)
    let spellRoll = null;
    if (itemData.dano) {
      spellRoll = new Roll(itemData.dano);
      await spellRoll.evaluate();
    }

    // Criar mensagem no chat
    const template = "systems/clube-dos-taberneiros/templates/chat/spell-roll.html";
    const templateContext = {
      actor: actor,
      item: this,
      spellRoll: spellRoll,
      isSpell: true
    };

    const content = await renderTemplate(template, templateContext);

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      content: content,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      rolls: spellRoll ? [spellRoll] : []
    });

    return spellRoll;
  }

  /**
   * Rolar habilidade
   */
  async _rollAbility() {
    const actor = this.actor;
    
    // Criar mensagem simples para habilidades
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      content: `<div class="clube-chat-card">
        <h3>${this.name}</h3>
        <p>${this.system.descricao}</p>
      </div>`,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER
    });
  }

  /**
   * Rolar item genérico
   */
  async _rollGeneric() {
    const actor = this.actor;
    
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      content: `<div class="clube-chat-card">
        <h3>${this.name}</h3>
        <p>${this.system.descricao}</p>
      </div>`,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER
    });
  }
}