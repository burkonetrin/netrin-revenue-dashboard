"use client";

import { BillingAddInvoiceDrawer } from "@/features/billing/components/BillingAddInvoiceDrawer";
import { BillingClientSearch } from "@/features/billing/components/BillingClientSearch";
import { BillingFiltersDrawer } from "@/features/billing/components/BillingFiltersDrawer";
import { BillingListPaginationFooter } from "@/features/billing/components/BillingListPaginationFooter";
import { BillingListToolbarActions } from "@/features/billing/components/BillingListToolbarActions";
import { BillingTable } from "@/features/billing/components/BillingTable";
import {
  BILLING_INVOICE_PERMISSIONS,
  canClientsOrBillingInvoice,
} from "@/features/billing/constants/billingInvoicePermissions.constants";
import { useBillingList } from "@/features/billing/hooks/useBillingList";
import { useRefreshBillingConsumption } from "@/features/billing/hooks/useRefreshBillingConsumption";
import { useBillingCsvExportStore } from "@/features/billing/store/billing-csv-export.store";
import type { BillingFilters, BillingInvoiceRecord } from "@/features/billing/types/billing.types";
import {
  parseBillingCompetenceToYearMonth,
  resolveExportCompetenceFromFilters,
} from "@/features/billing/utils/billing-csv-export.utils";
import {
  deriveBillingListTableState,
  getBillingInvoiceDetailHref,
} from "@/features/billing/utils/billing-list.utils";
import { refreshBillingConsumptionWithFeedback } from "@/features/billing/utils/billing-refresh.utils";
import { hasBillingFilters, formatBillingCompetence } from "@/features/billing/utils/billing.utils";
import { getCurrentMonth } from "@/features/billing/utils/billing-list.utils";
import {
  mergeStatusIntoRecord,
} from "@/features/billing/utils/billing-invoice-status.utils";
import {
  listCloseEligibleKeysForFilters,
  useBillingInvoiceStatusStore,
} from "@/features/billing/store/billing-invoice-status.store";
import { getBillClientsBatchPreview } from "@/features/billing/utils/billing-bill-clients.utils";
import type { BillingInvoiceStatusKey } from "@/features/billing/types/billing-invoice-status.types";
import {
  BillingBillClientsConfirmModal,
  BillingBulkCloseConfirmModal,
} from "@/features/billing/components/BillingListConfirmModals";
import { CLIENTS_PERMISSIONS } from "@/features/clients/constants/clientsPermissions.constants";
import { PRODUCTS_PERMISSIONS } from "@/features/products/constants/productsPermissions.constants";
import { PageTitle } from "@/shared/components/PageTitle";
import { FinancialIcon } from "@/shared/components/sidebar/icons";
import { usePermission } from "@/shared/hooks/usePermission";
import { formatCurrency } from "@/shared/utils/currency";
import { Button } from "@heroui/react";
import { Funnel, X } from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PAGE_SIZE = 10;

function BillingListContent() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = usePermission();
  const canListClients =
    can(BILLING_INVOICE_PERMISSIONS.listClients) || can(CLIENTS_PERMISSIONS.access);
  const canListProfitCenters =
    canClientsOrBillingInvoice(can, CLIENTS_PERMISSIONS.listInvoiceProfitCenters) ||
    can(CLIENTS_PERMISSIONS.paymentInfo) ||
    can(CLIENTS_PERMISSIONS.updateProfitCenter);
  const canCreateInvoiceReadClient =
    can(BILLING_INVOICE_PERMISSIONS.createInvoiceReadClient) || can(CLIENTS_PERMISSIONS.overview);
  const canReadClient =
    canCreateInvoiceReadClient || can(BILLING_INVOICE_PERMISSIONS.invoiceDetailsReadClient);
  const canListCreateInvoiceProfitCenters =
    can(BILLING_INVOICE_PERMISSIONS.createInvoiceListProfitCenters) ||
    can(CLIENTS_PERMISSIONS.paymentInfo) ||
    can(CLIENTS_PERMISSIONS.updateProfitCenter);
  const canListCreateInvoiceContracts =
    can(BILLING_INVOICE_PERMISSIONS.createInvoiceListContracts) ||
    can(CLIENTS_PERMISSIONS.contracts);
  const canListCreateInvoiceProducts =
    can(BILLING_INVOICE_PERMISSIONS.createInvoiceListProducts) || can(PRODUCTS_PERMISSIONS.access);
  const hasCreateInvoicePermission = canClientsOrBillingInvoice(
    can,
    CLIENTS_PERMISSIONS.createInvoice,
  );
  const canCreateInvoice =
    hasCreateInvoicePermission &&
    canListClients &&
    canCreateInvoiceReadClient &&
    canListCreateInvoiceProfitCenters &&
    canListCreateInvoiceContracts &&
    canListCreateInvoiceProducts;
  const canExportCsv = canClientsOrBillingInvoice(can, CLIENTS_PERMISSIONS.generateHistory);
  const isExportingCsv = useBillingCsvExportStore((state) => state.isDownloading);
  const downloadCsv = useBillingCsvExportStore((state) => state.downloadCsv);
  const [page, setPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);

  const startMonthParam = searchParams.get("startMonth") || undefined;
  const endMonthParam = searchParams.get("endMonth") || undefined;
  const profitCenterIdParam = searchParams.get("profitCenterId") || undefined;
  const clientIdParam = searchParams.get("client") || undefined;
  const invoiceStatusParam = searchParams.get("invoiceStatus") || undefined;

  const filters = useMemo<BillingFilters>(
    () => ({
      startMonth: startMonthParam,
      endMonth: endMonthParam,
      profitCenterId: profitCenterIdParam,
      clientId: clientIdParam,
      invoiceStatus: invoiceStatusParam as BillingInvoiceStatusKey | undefined,
    }),
    [startMonthParam, endMonthParam, profitCenterIdParam, clientIdParam, invoiceStatusParam],
  );

  const statusRevision = useBillingInvoiceStatusStore((state) => state.byKey);
  const closeMany = useBillingInvoiceStatusStore((state) => state.closeMany);
  const billClientsClosedInCompetence = useBillingInvoiceStatusStore(
    (state) => state.billClientsClosedInCompetence,
  );

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());
  const [isBulkCloseModalOpen, setIsBulkCloseModalOpen] = useState(false);
  const [isBillClientsModalOpen, setIsBillClientsModalOpen] = useState(false);

  const hasFilters = useMemo(() => hasBillingFilters(filters), [filters]);

  const exportCompetence = useMemo(() => resolveExportCompetenceFromFilters(filters), [filters]);
  const isExportDisabled = !parseBillingCompetenceToYearMonth(exportCompetence);

  const {
    data: invoicesResponse,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useBillingList({
    filters,
    page,
    limit: PAGE_SIZE,
  });

  const refreshConsumption = useRefreshBillingConsumption();

  const { isTableLoading, records: rawRecords, totalPages, totalRecords, showPagination } =
    deriveBillingListTableState({
      isLoading,
      isFetching,
      data: invoicesResponse?.data,
      pagination: invoicesResponse?.pagination,
    });

  const records = useMemo(() => {
    void statusRevision;
    return rawRecords.map((record) =>
      mergeStatusIntoRecord(record, useBillingInvoiceStatusStore.getState().getState(
        record.source ?? "invoice",
        record.id,
      )),
    );
  }, [rawRecords, statusRevision]);

  const eligibleKeysAllFilters = useMemo(
    () => listCloseEligibleKeysForFilters(filters),
    [filters, statusRevision],
  );

  const headerChecked =
    eligibleKeysAllFilters.length > 0 &&
    eligibleKeysAllFilters.every((key) => selectedKeys.has(key));
  const headerIndeterminate =
    !headerChecked && eligibleKeysAllFilters.some((key) => selectedKeys.has(key));

  const handleToggleRow = useCallback((key: string, selected: boolean) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (selected) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const handleToggleHeader = useCallback(
    (selected: boolean) => {
      if (!selected) {
        setSelectedKeys(new Set());
        return;
      }
      setSelectedKeys(new Set(eligibleKeysAllFilters));
    },
    [eligibleKeysAllFilters],
  );

  const selectedCount = selectedKeys.size;
  const currentCompetence = getCurrentMonth();
  const billClientsPreview = useMemo(() => {
    void statusRevision;
    return getBillClientsBatchPreview(currentCompetence);
  }, [currentCompetence, statusRevision]);
  const closedInCompetenceCount = billClientsPreview.closedClientCount;
  const openInCompetenceCount = billClientsPreview.openInvoiceCount;
  const totalAmount = invoicesResponse?.totalizer?.totalValue ?? 0;
  const totalizerLabel =
    invoicesResponse?.totalizer?.label ||
    (filters.startMonth || filters.endMonth ? "Total no período" : "Total na competência");

  const updateURL = (nextFilters: BillingFilters) => {
    const params = new URLSearchParams(searchParams.toString());

    const entries = {
      startMonth: nextFilters.startMonth,
      endMonth: nextFilters.endMonth,
      profitCenterId: nextFilters.profitCenterId,
      client: nextFilters.clientId,
      invoiceStatus: nextFilters.invoiceStatus,
    };

    for (const [key, value] of Object.entries(entries)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    setSearchParams(params, { replace: false });
  };

  const clearDrawerFilters = () => {
    setPage(1);
    updateURL({
      clientId: filters.clientId,
      invoiceStatus: undefined,
    });
    setIsFiltersOpen(false);
  };

  const handleClientChange = (nextClientId: string | undefined) => {
    setPage(1);
    updateURL({
      ...filters,
      clientId: nextClientId,
    });
  };

  const handleRefreshConsumption = () =>
    refreshBillingConsumptionWithFeedback({
      isPending: refreshConsumption.isPending,
      mutateAsync: () => refreshConsumption.mutateAsync(),
      refetch,
      setPage,
      beforeRefresh: hasFilters ? clearDrawerFilters : undefined,
    });

  const handleDetailsClick = (record: BillingInvoiceRecord) => {
    navigate(getBillingInvoiceDetailHref(record));
  };

  return (
    <div className="relative min-h-full space-y-6 bg-white -m-6 md:-m-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] max-w-none p-6 md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <PageTitle icon={<FinancialIcon color="currentColor" />} label="Faturamento" />

        <div className="relative flex items-center gap-2">
          {selectedCount > 0 ? (
            <Button
              radius="sm"
              color="primary"
              onPress={() => setIsBulkCloseModalOpen(true)}
            >
              Fechar faturas selecionadas ({selectedCount})
            </Button>
          ) : null}

          <div
            className={`flex items-center rounded-lg ${
              hasFilters ? "bg-primary-600" : "bg-transparent"
            }`}
          >
            <Button
              startContent={<Funnel size={18} className="text-gray-400" />}
              radius="sm"
              variant={hasFilters ? "solid" : "bordered"}
              color={hasFilters ? "primary" : "default"}
              onPress={() => setIsFiltersOpen(true)}
              className={hasFilters ? "text-white" : ""}
            >
              {hasFilters ? "Filtros ativos" : "Filtros"}
            </Button>
            {hasFilters && (
              <>
                <div className="h-6 w-px bg-white/70" />
                <Button
                  isIconOnly
                  size="sm"
                  color="primary"
                  aria-label="Limpar filtros"
                  className="min-w-0 text-white"
                  onPress={clearDrawerFilters}
                >
                  <X size={20} />
                </Button>
              </>
            )}
          </div>

          <Button radius="sm" variant="bordered" onPress={() => setIsBillClientsModalOpen(true)}>
            Faturar clientes
          </Button>

          <BillingListToolbarActions
            isRefreshing={refreshConsumption.isPending}
            onRefresh={handleRefreshConsumption}
            canCreateInvoice={canCreateInvoice}
            onAddInvoice={() => setIsAddInvoiceOpen(true)}
            canExportCsv={canExportCsv}
            isExportingCsv={isExportingCsv}
            isExportDisabled={isExportDisabled}
            onExportCsv={() => {
              void downloadCsv(exportCompetence);
            }}
          />
        </div>
      </div>

      <div className="rounded-sm bg-sky-50 px-4 py-3">
        <p className="text-xs text-gray-500">{totalizerLabel}</p>
        <p className="mt-1 text-xl font-semibold text-gray-900">
          {isTableLoading ? "—" : formatCurrency(totalAmount)}
        </p>
      </div>

      {canListClients ? (
        <BillingClientSearch
          clientId={filters.clientId}
          canReadClient={canReadClient}
          onClientChange={handleClientChange}
          className="w-full max-w-md"
        />
      ) : null}

      {isError ? (
        <div className="flex items-center justify-between rounded-sm border border-danger-200 bg-danger-50 px-4 py-3">
          <p className="text-sm text-danger-700">Não foi possível carregar as faturas.</p>
          <Button size="sm" color="danger" variant="flat" onPress={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <BillingTable
          records={records}
          showClientColumn
          monthColumn="both"
          isLoading={isTableLoading}
          onDetailsClick={handleDetailsClick}
          selection={{
            selectedKeys,
            onToggleRow: handleToggleRow,
            headerChecked,
            headerIndeterminate,
            onToggleHeader: handleToggleHeader,
          }}
        />
      )}

      <BillingListPaginationFooter
        isTableLoading={isTableLoading}
        recordsCount={records.length}
        totalRecords={totalRecords}
        page={page}
        totalPages={totalPages}
        showPagination={showPagination}
        onPageChange={setPage}
      />

      <BillingFiltersDrawer
        isOpen={isFiltersOpen}
        canListProfitCenters={canListProfitCenters}
        filters={filters}
        onOpenChange={setIsFiltersOpen}
        onClear={clearDrawerFilters}
        onApply={(nextFilters) => {
          setPage(1);
          updateURL({
            ...nextFilters,
            clientId: filters.clientId,
          });
          setIsFiltersOpen(false);
        }}
      />

      {isAddInvoiceOpen && canCreateInvoice ? (
        <BillingAddInvoiceDrawer
          isOpen
          onOpenChange={setIsAddInvoiceOpen}
          onSuccess={() => {
            refetch();
            setPage(1);
          }}
        />
      ) : null}

      <BillingBulkCloseConfirmModal
        isOpen={isBulkCloseModalOpen}
        selectedCount={selectedCount}
        onClose={() => setIsBulkCloseModalOpen(false)}
        onConfirm={() => {
          closeMany(Array.from(selectedKeys));
          setSelectedKeys(new Set());
          setIsBulkCloseModalOpen(false);
          void refetch();
        }}
      />

      <BillingBillClientsConfirmModal
        isOpen={isBillClientsModalOpen}
        onClose={() => setIsBillClientsModalOpen(false)}
        description={
          <div className="flex flex-col gap-4">
            <p className="m-0">
              Faturando {closedInCompetenceCount} clientes para a competência{" "}
              {formatBillingCompetence(currentCompetence)}
            </p>
            {openInCompetenceCount > 0 ? (
              <p className="m-0">
                Ainda existem {openInCompetenceCount} faturas abertas nesta competência. Esses
                clientes não serão faturados.
              </p>
            ) : null}
          </div>
        }
        onConfirm={() => {
          billClientsClosedInCompetence(currentCompetence);
          setIsBillClientsModalOpen(false);
          void refetch();
        }}
      />
    </div>
  );
}

export function BillingListPage() {
  return <BillingListContent />;
}
