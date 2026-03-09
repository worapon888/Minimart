import { SetMetadata } from "@nestjs/common";

export const AUDIT_META = "AUDIT_META";
export const AUDIT_SKIP = "AUDIT_SKIP";

export type AuditMeta = {
  action: string; // e.g. "CHECKOUT_START"
  entity?: string; // e.g. "Order"
  // entityId จะเอาจาก req.params / req.body / req.query ผ่าน resolver ใน interceptor
};

export const Audit = (meta: AuditMeta) => SetMetadata(AUDIT_META, meta);
export const SkipAudit = () => SetMetadata(AUDIT_SKIP, true);
