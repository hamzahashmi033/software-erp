import type {
  InvoiceModel,
  InvoiceViewModel,
  ActiveViewerModel,
} from "@/generated/prisma/models.ts";
import type {
  InvoiceStatus,
  Department,
  PaymentMerchant,
} from "@/generated/prisma/enums";

export type { InvoiceStatus, Department, PaymentMerchant };
export type Invoice = InvoiceModel;
export type InvoiceView = InvoiceViewModel;
export type ActiveViewer = ActiveViewerModel;

export type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceWithCounts = Invoice & {
  stripeHostedUrl?: string | null;
  stripeInvoiceId?: string | null;
  _count: {
    views: number;
    activeViewers: number;
  };
};

export type InvoiceWithRelations = Invoice & {
  views: InvoiceView[];
  activeViewers: ActiveViewer[];
  _count: {
    views: number;
    activeViewers: number;
  };
};

export type DashboardStats = {
  total: number;
  paid: number;
  sent: number;
  viewed: number;
  draft: number;
  void: number;
  totalRevenue: number;
  pendingRevenue: number;
  frontCount: number;
  upsellCount: number;
};
