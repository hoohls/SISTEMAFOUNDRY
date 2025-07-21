/**
 * Sistema Clube dos Taberneiros para FoundryVTT
 */

// Importar módulos do sistema
import { ClubeActor } from "./documents/actor.mjs";
import { ClubeItem } from "./documents/item.mjs";
import { ClubeActorSheet } from "./sheets/actor-sheet.mjs";
import { ClubeItemSheet } from "./sheets/item-sheet.mjs";
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { registerHandlebarsHelpers } from "./helpers/handlebars.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {
  console.log('Sistema Clube dos Taberneiros | Inicializando sistema');

  // Definir classes customizadas
  CONFIG.Actor.documentClass = ClubeActor;
  CONFIG.Item.documentClass = ClubeItem;

  // Registrar sheets
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("clube-dos-taberneiros", ClubeActorSheet, {
    types: ["character", "npc"],
    makeDefault: true
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("clube-dos-taberneiros", ClubeItemSheet, {
    makeDefault: true
  });

  // Registrar helpers do Handlebars
  registerHandlebarsHelpers();

  // Precarregar templates
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  console.log('Sistema Clube dos Taberneiros | Sistema pronto');
});

/* -------------------------------------------- */
/*  Hotbar Macros                              */
/* -------------------------------------------- */

Hooks.on("hotbarDrop", (bar, data, slot) => {
  if (data.type !== "Item") return;
  createItemMacro(data, slot);
  return false;
});

/**
 * Criar macro para item
 */
async function createItemMacro(data, slot) {
  const item = await Item.implementation.fromDropData(data);
  if (!item) return;

  const command = `game.clube.rollItemMacro("${item.name}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "clube-dos-taberneiros.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Executar macro de item
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  
  if (!actor) {
    ui.notifications.warn("Você deve selecionar um token para usar esta macro.");
    return;
  }

  const item = actor.items.find(i => i.name === itemName);
  if (!item) {
    ui.notifications.warn(`Seu personagem não possui um item chamado ${itemName}`);
    return;
  }

  return item.roll();
}

// Expor funções globalmente
window.clube = {
  rollItemMacro
};