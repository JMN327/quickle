export const images = importAll(require.context('../../img', false, /\.(png|jpe?g|svg)$/));


function importAll(r) {
    return r.keys().map(r);
  }