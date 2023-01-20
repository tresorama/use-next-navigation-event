export class LocalStorage<Value> {
  key: string;
  constructor(key: string) {
    this.key = key;
  }
  serialize(x: Value) {
    return JSON.stringify(x);
  }
  deserialize(x: string): Value {
    return JSON.parse(x);
  }
  save(newValue: Value) {
    window.localStorage.setItem(this.key, this.serialize(newValue));
  }
  retrieve() {
    const rawValue = window.localStorage.getItem(this.key);
    if (!rawValue) return null;
    return this.deserialize(rawValue);
  }
  delete() {
    window.localStorage.removeItem(this.key);
  }
}