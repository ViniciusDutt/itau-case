export function formatPatrimonyValue(value: string | number): string {
  const onlyNumbers = String(value).replace(/\D/g, '').substring(0, 20);

  if (!onlyNumbers) {
    return '';
  }

  const numValue = parseInt(onlyNumbers, 10);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue / 100);
}

export function hasPatrimonyValueChanged(formatted: string, original: string | number): boolean {
  return formatted !== String(original);
}
