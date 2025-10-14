class UrlStorage {
  constructor() {
    this.storage = new Map();
  }

  async save(shortCode, originalUrl) {
    return new Promise((resolve) => {
      this.storage.set(shortCode, originalUrl);
      resolve(shortCode);
    });
  }

  async get(shortCode) {
    return new Promise((resolve) => {
      resolve(this.storage.get(shortCode) || null);
    });
  }

  async has(shortCode) {
    return new Promise((resolve) => {
      resolve(this.storage.has(shortCode));
    });
  }
}

export const urlStorage = new UrlStorage();
