export default function Cell() {
  let value = "";

  const mark = (playerMark) => {
    value = playerMark;
  };

  const getValue = () => value;

  const reset = () => {
    value = "";
  };

  return {
    mark,
    getValue,
    reset,
  };
}
