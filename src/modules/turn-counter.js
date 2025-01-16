export default function TurnCounter() {
    let turnNumber = 1;

    const turn = () => turnNumber;
    const increment = () => turnNumber++;
    const reset = () => (turnNumber = 1);

    return {
      turn,
      increment,
      reset,
    };
  }