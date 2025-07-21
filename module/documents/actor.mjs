/**
 * Extend the base Actor document
 */
export class ClubeActor extends Actor {

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Dados disponíveis para todos os tipos de ator
  }

  /** @override */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.clube || {};

    // Fazer diferentes preparações baseado no tipo
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Preparar dados específicos de personagem
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    const systemData = actorData.system;

    // Calcular valores derivados
    this._calculateDerivedValues(systemData);
  }

  /**
   * Preparar dados específicos de NPC
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    const systemData = actorData.system;

    // Calcular valores derivados
    this._calculateDerivedValues(systemData);
  }

  /**
   * Calcular valores derivados dos atributos
   */
  _calculateDerivedValues(systemData) {
    const atributos = systemData.atributos;

    // Pontos de Vida = Físico × 3 + 10
    systemData.pv.max = (atributos.fisico.value * 3) + 10;
    if (systemData.pv.value > systemData.pv.max) {
      systemData.pv.value = systemData.pv.max;
    }

    // Pontos de Magia = Mental × 2 + 5
    systemData.pm.max = (atributos.mental.value * 2) + 5;
    if (systemData.pm.value > systemData.pm.max) {
      systemData.pm.value = systemData.pm.max;
    }

    // Defesa = 10 + Ação + modificador da armadura
    systemData.defesa.value = 10 + atributos.acao.value + systemData.defesa.armadura;
  }

  /**
   * Rolar teste de atributo
   */
  async rollAttribute(attributeName, options = {}) {
    const attribute = this.system.atributos[attributeName];
    if (!attribute) return;

    const roll = new Roll("2d6 + @attr", { attr: attribute.value });
    await roll.evaluate();

    const attributeNames = {
      fisico: "Físico",
      acao: "Ação", 
      mental: "Mental",
      social: "Social"
    };

    // Criar mensagem no chat
    const template = "systems/clube-dos-taberneiros/templates/chat/attribute-roll.html";
    const templateContext = {
      actor: this,
      attributeName: attributeNames[attributeName] || attributeName,
      roll: roll
    };

    const content = await renderTemplate(template, templateContext);

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: content,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      rolls: [roll]
    });

    return roll;
  }

  /**
   * Rolar iniciativa
   */
  async rollInitiative(options = {}) {
    const acao = this.system.atributos.acao.value;
    const roll = new Roll("2d6 + @acao", { acao });
    await roll.evaluate();

    return roll;
  }

  /**
   * Aplicar dano
   */
  async applyDamage(damage, type = "normal") {
    const currentPV = this.system.pv.value;
    const newPV = Math.max(0, currentPV - damage);
    
    await this.update({ "system.pv.value": newPV });
    
    // Notificar sobre o dano
    ui.notifications.info(`${this.name} recebeu ${damage} pontos de dano.`);
    
    if (newPV === 0) {
      ui.notifications.warn(`${this.name} foi derrotado!`);
    }
  }

  /**
   * Curar pontos de vida
   */
  async heal(amount) {
    const currentPV = this.system.pv.value;
    const maxPV = this.system.pv.max;
    const newPV = Math.min(maxPV, currentPV + amount);
    
    await this.update({ "system.pv.value": newPV });
    
    ui.notifications.info(`${this.name} recuperou ${newPV - currentPV} pontos de vida.`);
  }

  /**
   * Gastar pontos de magia
   */
  async spendMagicPoints(cost) {
    const currentPM = this.system.pm.value;
    if (currentPM < cost) {
      ui.notifications.warn("Pontos de Magia insuficientes!");
      return false;
    }
    
    const newPM = currentPM - cost;
    await this.update({ "system.pm.value": newPM });
    
    return true;
  }
}