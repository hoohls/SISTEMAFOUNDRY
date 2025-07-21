/**
 * Registrar helpers customizados do Handlebars
 */
export function registerHandlebarsHelpers() {

  // Helper para concatenar strings
  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  // Helper para comparação
  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  // Helper para verificar se valor é maior que
  Handlebars.registerHelper('gt', function(a, b) {
    return a > b;
  });

  // Helper para verificar se valor é menor que
  Handlebars.registerHelper('lt', function(a, b) {
    return a < b;
  });

  // Helper para formatação de números
  Handlebars.registerHelper('numberFormat', function(value) {
    return Number(value).toLocaleString();
  });

  // Helper para obter modificador de atributo (para exibição)
  Handlebars.registerHelper('getModifier', function(value) {
    const modifier = value - 10;
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  });

  // Helper para capitalizar primeira letra
  Handlebars.registerHelper('capitalize', function(str) {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  // Helper para loop com índice
  Handlebars.registerHelper('times', function(n, block) {
    var accum = '';
    for(var i = 0; i < n; ++i) {
      block.data.index = i;
      block.data.first = i === 0;
      block.data.last = i === (n - 1);
      accum += block.fn(this);
    }
    return accum;
  });

  // Helper para verificar se item está equipado
  Handlebars.registerHelper('isEquipped', function(item) {
    return item.system.equipado || false;
  });

  // Helper para obter ícone baseado no tipo
  Handlebars.registerHelper('getTypeIcon', function(type) {
    const icons = {
      'arma': 'fas fa-sword',
      'armadura': 'fas fa-shield-alt',
      'escudo': 'fas fa-shield',
      'equipamento': 'fas fa-backpack',
      'habilidade': 'fas fa-fist-raised',
      'magia': 'fas fa-magic'
    };
    return icons[type] || 'fas fa-question';
  });

  // Helper para formatação de dinheiro
  Handlebars.registerHelper('formatMoney', function(value) {
    return `${value} MP`; // Moedas de Prata
  });

  // Helper para obter cor baseada no valor atual vs máximo
  Handlebars.registerHelper('getHealthColor', function(current, max) {
    const percentage = (current / max) * 100;
    if (percentage > 75) return 'green';
    if (percentage > 50) return 'yellow';
    if (percentage > 25) return 'orange';
    return 'red';
  });

  // Helper para verificar se array inclui valor
  Handlebars.registerHelper('includes', function(array, value) {
    if (!Array.isArray(array)) return false;
    return array.includes(value);
  });

  // Helper para checkbox checked
  Handlebars.registerHelper('checked', function(value) {
    return value ? 'checked' : '';
  });
}