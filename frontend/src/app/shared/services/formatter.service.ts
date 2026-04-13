import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormatterService {

  formatCurrency(value: number): string {
    if (!Number.isFinite(value)) {
      return 'R$ 0,00';
    }

    if (value < 0) {
      return 'R$ 0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatPatrimony(value: string | number): string {
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

  parseCurrency(value: string | number | null | undefined): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    try {
      const onlyNumbers = String(value).replace(/\D/g, '');
      if (!onlyNumbers) return 0;

      const numValue = parseInt(onlyNumbers, 10);
      return numValue / 100;
    } catch {
      console.error('Erro ao fazer parse de moeda:', value);
      return 0;
    }
  }

  formatCnpj(value: string | number): string {
    const onlyNumbers = String(value).replace(/\D/g, '').substring(0, 14);

    let formatted = onlyNumbers;
    if (onlyNumbers.length > 2) {
      formatted = `${onlyNumbers.substring(0, 2)}.${onlyNumbers.substring(2)}`;
    }
    if (onlyNumbers.length > 5) {
      formatted = `${onlyNumbers.substring(0, 2)}.${onlyNumbers.substring(2, 5)}.${onlyNumbers.substring(5)}`;
    }
    if (onlyNumbers.length > 8) {
      formatted = `${onlyNumbers.substring(0, 2)}.${onlyNumbers.substring(2, 5)}.${onlyNumbers.substring(5, 8)}/${onlyNumbers.substring(8)}`;
    }
    if (onlyNumbers.length > 12) {
      formatted = `${onlyNumbers.substring(0, 2)}.${onlyNumbers.substring(2, 5)}.${onlyNumbers.substring(5, 8)}/${onlyNumbers.substring(8, 12)}-${onlyNumbers.substring(12)}`;
    }

    return formatted;
  }

  isValidCnpj(value: string | number): boolean {
    const cnpj = String(value).replace(/\D/g, '');

    if (cnpj.length !== 14) {
      return false;
    }

    if (/^(\d)\1{13}$/.test(cnpj)) {
      return false;
    }

    return this.validateCnpjChecksum(cnpj);
  }

  private validateCnpjChecksum(cnpj: string): boolean {
    let sum = 0;
    let multiplier = 5;

    for (let i = 0; i < 8; i++) {
      sum += parseInt(cnpj[i]) * multiplier;
      multiplier--;
    }

    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cnpj[8]) !== digit1) {
      return false;
    }

    sum = 0;
    multiplier = 6;

    for (let i = 0; i < 9; i++) {
      sum += parseInt(cnpj[i]) * multiplier;
      multiplier--;
    }

    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cnpj[9]) === digit2;
  }
}
