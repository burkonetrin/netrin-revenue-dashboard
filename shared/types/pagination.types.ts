/**
 * Referência: CORRECOES-GABRIEL.md linha 256 - "A API deve seguir o mesmo padrão
 * de paginação usado em outras rotas"
 */
export interface PaginationInfo {
  hasNext: boolean;
  hasPrevious: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}
