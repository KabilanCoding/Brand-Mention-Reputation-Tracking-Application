const DB = require('./db');
const nlp = require('./nlp');
const kmeans = require('ml-kmeans');

class Clusterer {
  constructor(opts = {}){
    this.k = opts.k || 5;
    this.minDocs = opts.minDocs || 10;
    this.maxDocs = opts.maxDocs || 500; // limit to recent docs
    this.vocab = [];
  }

  async run() {
    // fetch recent mentions
    const rows = await DB.all('SELECT id, title, content FROM mentions ORDER BY created_at DESC LIMIT ?', [this.maxDocs]);
    if (!rows || rows.length < this.minDocs) return;

    // build token lists
    const docs = rows.map(r => {
      const txt = `${r.title || ''}\n${r.content || ''}`;
      return nlp.normalizeTokens(txt);
    });

    // build vocabulary
    const vocabMap = new Map();
    docs.forEach(tokens => {
      tokens.forEach(t => {
        if (!vocabMap.has(t)) vocabMap.set(t, vocabMap.size);
      });
    });
    const vocab = Array.from(vocabMap.keys());
    if (vocab.length === 0) return;

    // vectorize (term frequency)
    const vectors = docs.map(tokens => {
      const vec = new Array(vocab.length).fill(0);
      tokens.forEach(t => {
        const i = vocabMap.get(t);
        if (i !== undefined) vec[i] += 1;
      });
      return vec;
    });

    // run kmeans
    const k = Math.min(this.k, vectors.length);
    let res;
    try {
      res = kmeans(vectors, k);
    } catch (err) {
      console.error('kmeans error', err && err.message ? err.message : err);
      return;
    }

    // for each cluster, compute top terms by centroid weights
    const clusters = res.clusters; // array of cluster index per doc
    const centroids = res.centroids || res.centroid || [];

    const clusterTerms = {};
    for (let ci = 0; ci < centroids.length; ci++){
      // support both ml-kmeans shapes: centroids[i].centroid or centroids[i] array
      const centroidObj = centroids[ci];
      const centroid = Array.isArray(centroidObj) ? centroidObj : (centroidObj && centroidObj.centroid) ? centroidObj.centroid : null;
      if (!centroid) { clusterTerms[ci] = []; continue; }
      // pick top 5 term indices
      const idxs = centroid
        .map((v,i)=>[v,i])
        .sort((a,b)=>b[0]-a[0])
        .slice(0,5)
        .map(e=>e[1]);
      clusterTerms[ci] = idxs.map(i => vocab[i]).filter(Boolean);
    }

    // update mentions with cluster id and label
    for (let i = 0; i < rows.length; i++){
      const row = rows[i];
      const cid = clusters[i];
      const label = clusterTerms[cid] ? clusterTerms[cid].join(', ') : '';
      try {
        await DB.run('UPDATE mentions SET cluster_id = ?, cluster_label = ? WHERE id = ?', [cid, label, row.id]);
      } catch (err) {
        // ignore individual update errors
      }
    }

    console.log('Clusterer: updated', rows.length, 'docs into', centroids.length, 'clusters');
  }
}

module.exports = Clusterer;
