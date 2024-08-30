import NodeObject from './nodeobject.js';

class JObject extends NodeObject {
  constructor(data = {}) {
    if (typeof data !== 'object' || data === null) {
      throw new Error('Le constructeur JObject attend un objet en argument');
    }
    super();
    this.applyNodeMethods(data);
  }

  applyNodeMethods(obj) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        this[key] = new JObject(value);
      } else {
        this[key] = value;
      }
    }
    return this;
  }

  toJSON() {
    // Convertir en JSON
    return JSON.stringify(this.toObject());
  }

  toObject() {
    // Convertir en objet
    const obj = {};
    for (const [key, value] of Object.entries(this)) {
      if (key !== 'children') {
        obj[key] = value instanceof JObject ? value.toObject() : value;
      }
    }
    return obj;
  }

  static fromJSON(jsonString) {
    // Convertir en JObject
    // Prend une chaîne JSON en argument et retourne un JObject
    if (typeof jsonString !== 'string') {
      throw new Error('fromJSON attend une chaîne JSON en argument');
    }
    try {
      const parsedData = JSON.parse(jsonString);
      return new JObject(parsedData);
    } catch (error) {
      throw new Error('Erreur lors du parsing JSON: ' + error.message);
    }
  }

  deepMerge(other) {
    // Fusionner deux JObject
    // Prend un JObject en argument et retourne un JObject
    // Si une clé existe déjà dans l'objet, elle est remplacée par la valeur de l'autre objet
    const merged = new JObject(this.toObject());
    for (const [key, value] of Object.entries(other)) {
      if (key !== 'children') {
        merged[key] = value instanceof JObject ? value.deepMerge(merged[key]) : value;
      }
    }
    return merged;
  }

  clone() {
    // Cloner un JObject
    // Retourne un JObject identique à l'original
    return new JObject(this.toObject());
  }

  find(callback) {
    // Rechercher un élément dans le JObject
    // Prend une fonction en argument et retourne l'élément trouvé
    // exemple:
    // const result = jobject.find((node) => node.age < 21);
    // const result = jobject.find((elem) => elem === 'John');
    // console.log(result);
    const results = this.traverse(callback);
    return results.length > 0 ? results : null;
  }

  set(key, value) {
    // Ajouter ou modifier une valeur dans le JObject
    // Si la valeur est un Object, elle est convertie en JObject
    if (typeof key === 'string') {
      switch (typeof value) {
        case 'object':
          this[key] = value instanceof JObject ? value : new JObject(value);
          break;
        default:
          this[key] = value; // tout autre type (string, number, function, etc.)
          break;
      }
    } else {
      throw new Error('La clé doit être une chaîne de caractères');
    }
  }

  get(key) {
    // Récupérer une valeur dans le JObject
    // Prend une clé en argument et retourne la valeur
    return this[key];
  }


  isEmpty() {
    // Vérifier si le JObject est vide
    // Retourne true si le JObject est vide, sinon false
    return Object.keys(this).length === 0;
  }


}

export default JObject;