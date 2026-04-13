import { Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';


@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private toastService = inject(ToastService);

  handleApiError(error: any, defaultMessage: string = 'Algo deu errado. Tente novamente.'): void {
    const message = this.extractErrorMessage(error, defaultMessage);
    console.error('API Error:', error);
    this.show(message);
  }

  show(message: string): void {
    this.toastService.error(message, 0);
  }

  showSuccess(message: string, duration: number = 5000): void {
    this.toastService.success(message, duration);
  }

  private extractErrorMessage(error: any, defaultMessage: string): string {
    if (error?.status === 0) {
      return 'Erro de conexão com o servidor. Verifique sua internet.';
    }

    const statusMessages: Record<number, string> = {
      400: 'Solicitação inválida. Verifique seus dados.',
      401: 'Você não está autenticado. Faça login novamente.',
      403: 'Você não tem permissão para acessar este recurso.',
      404: 'Recurso não encontrado.',
      409: 'Há um conflito com os dados existentes.',
      500: 'Erro interno do servidor. Tente novamente mais tarde.',
      503: 'Serviço indisponível. Tente novamente mais tarde.'
    };

    if (error?.status && statusMessages[error.status]) {
      return statusMessages[error.status];
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.statusText) {
      return error.statusText;
    }

    return defaultMessage;
  }
}
