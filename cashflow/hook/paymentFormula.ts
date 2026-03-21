export const paymentFormula = (balance: number, interestRate: number, frequency: string) => {
  if (frequency === 'monthly') {
    return balance * interestRate / 12 / 100;
  } else if (frequency === 'yearly') {
    return balance * interestRate / 100;
  } else {
    return 0;
  }
};