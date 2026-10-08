import type { ApiBillingTaskResponse } from "../types/billing-api.types";

/** JSON somente leitura no formato exposto pelo Administrator / tenant (`billing_task` snake_case). */
export function formatBillingTaskResponseAsJson(response: ApiBillingTaskResponse): string {
  const task = response.billingTask;
  const payload: Record<string, unknown> = {
    client: {
      id: response.client.id,
      name: response.client.name,
      tenant: response.client.tenant,
    },
    billing_task: {
      id: task.id,
      user_id: task.userId ?? null,
      user_username: task.userUsername ?? null,
      request_origin: task.requestOrigin ?? null,
      provider_name: task.providerName ?? null,
      data_source: task.dataSource ?? null,
      process_id: task.processId ?? null,
      service_type: task.serviceType ?? null,
      request_url: task.requestUrl ?? null,
      request_body: task.requestBody ?? null,
    },
  };

  if (task.responseBody !== undefined && task.responseBody !== null) {
    (payload.billing_task as Record<string, unknown>).response_body = task.responseBody;
  }
  if (task.statusCode != null) {
    (payload.billing_task as Record<string, unknown>).status_code = task.statusCode;
  }
  if (task.createdAt != null) {
    (payload.billing_task as Record<string, unknown>).created_at = task.createdAt;
  }
  if (task.expireAt != null) {
    (payload.billing_task as Record<string, unknown>).expire_at = task.expireAt;
  }
  if (task.isBillable != null) {
    (payload.billing_task as Record<string, unknown>).is_billable = task.isBillable;
  }

  return JSON.stringify(payload, null, 2);
}
