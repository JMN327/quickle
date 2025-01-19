export default function CheckList() {
  let horizontalIds = [];
  let verticalIds = [];

  let matrix = [];
  for (let i = 0; i < 6; i++) {
    matrix[i] = [];
    for (let j = 0; j < 6; j++) {
      matrix[i].push(0);
    }
  }

  function add(direction, color, shape) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        let toAdd;
        if ((i == color && j != shape) || (i != color && j == shape)) {
          toAdd = 1;
        } else {
          toAdd = 0;
        }
        matrix[i][j] += toAdd;
      }
    }
    if (direction == 0) {
      horizontalIds.push([color, shape]);
    } else {
      verticalIds.push([color, shape]);
    }
  }

  return {
    get matrix() {
      return matrix;
    },
    add,
    get horizontalIds() {
      return horizontalIds;
    },
    get verticalIds() {
      return verticalIds;
    },
  };
}
