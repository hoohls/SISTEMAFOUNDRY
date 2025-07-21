/**
 * Definir um conjunto de caminhos de template para pré-carregar
 * Estes templates são armazenados no cache do Handlebars e estão disponíveis para uso
 */
export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([
    // Sheets de Ator
    "systems/clube-dos-taberneiros/templates/actor/actor-character-sheet.html",
    "systems/clube-dos-taberneiros/templates/actor/actor-npc-sheet.html",
    
    // Sheets de Item
    "systems/clube-dos-taberneiros/templates/item/item-arma-sheet.html",
    "systems/clube-dos-taberneiros/templates/item/item-armadura-sheet.html",
    "systems/clube-dos-taberneiros/templates/item/item-equipamento-sheet.html",
    "systems/clube-dos-taberneiros/templates/item/item-habilidade-sheet.html",
    "systems/clube-dos-taberneiros/templates/item/item-magia-sheet.html",
    
    // Partials de Ator
    "systems/clube-dos-taberneiros/templates/actor/parts/actor-atributos.html",
    "systems/clube-dos-taberneiros/templates/actor/parts/actor-habilidades.html",
    "systems/clube-dos-taberneiros/templates/actor/parts/actor-equipamentos.html",
    "systems/clube-dos-taberneiros/templates/actor/parts/actor-magias.html",
    
    // Templates de Chat
    "systems/clube-dos-taberneiros/templates/chat/attack-roll.html",
    "systems/clube-dos-taberneiros/templates/chat/spell-roll.html",
    "systems/clube-dos-taberneiros/templates/chat/attribute-roll.html"
  ]);
};