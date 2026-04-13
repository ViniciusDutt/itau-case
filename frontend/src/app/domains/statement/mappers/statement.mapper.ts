import { DatePipe, registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import { Injectable } from '@angular/core';
import { TransactionDTO } from '../dtos/statement.dto';
import { Transaction } from '../models/transaction.model';
import { CurrencyFormatterService } from '../../../shared/services/currency-formatter.service';

registerLocaleData(localePtBr);

@Injectable({ providedIn: 'root' })
export class StatementMapper {
  private readonly datePipe = new DatePipe('pt-BR');

  constructor(private currencyFormatter: CurrencyFormatterService) {}

  toDomain(dto: TransactionDTO): Transaction {
    try {
      const date = dto.createdAt ? this.formatDateTime(dto.createdAt) : '';

      return {
        codigo: dto.codigo,
        nome: dto.nome,
        cnpj: dto.cnpj ? this.currencyFormatter.formatCnpj(dto.cnpj) : '',
        tema: dto.type?.nome || 'N/A',
        data: date,
        codigoTipo: dto.codigoTipo,
        rawPatrimonio: dto.patrimonio,
        patrimonio: this.currencyFormatter.formatCurrency(dto.patrimonio)
      };
    } catch (error) {
      console.error('Erro ao mapear transação:', error, dto);
      throw error;
    }
  }

  private formatDateTime(dateString: string): string {
    return this.datePipe.transform(dateString, 'dd/MM/yy') || '';
  }
}
