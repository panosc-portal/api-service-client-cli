export function validNumber(value: string) {
  const valid = !isNaN(Number(value));
  return valid || "Please enter a number";
}
