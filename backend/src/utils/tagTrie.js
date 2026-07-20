/**
 * Prefix Trie for problem title / tag search (DSA).
 */
export class TagTrie {
  constructor() {
    this.root = { children: new Map(), slugs: new Set() };
  }

  insert(word, slug) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, { children: new Map(), slugs: new Set() });
      }
      node = node.children.get(ch);
      node.slugs.add(slug);
    }
  }

  searchPrefix(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return [];
      node = node.children.get(ch);
    }
    return [...node.slugs];
  }
}
