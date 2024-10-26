class NodeObject {
  constructor(data = {}) {
    this.applyNodeMethods(data);
  }

  applyNodeMethods(obj) {
    Object.assign(this, obj);
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = new NodeObject(obj[key]);
      }
    }
    return this;
  }

  traverse(callback, path = '', results = []) {
    if (callback(this, path)) {
      results.push({ elem: this, path });
    }
    
    for (const key in this) {
      if (typeof this[key] === 'object' && this[key] !== null) {
        this[key].traverse(callback, `${path}/${key}`, results);
      } else {
        if (callback(this[key], `${path}/${key}`)) {
          results.push({ elem: this[key], path: `${path}/${key}` });
        }
      }
    }
    return results;
  }
}

export default NodeObject;