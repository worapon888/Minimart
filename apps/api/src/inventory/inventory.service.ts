import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async get(productId: string) {
    const inv = await this.prisma.inventory.findUnique({
      where: { productId },
    });
    if (!inv) throw new NotFoundException("Inventory not found");
    return inv;
  }

  async checkStock(productId: string, qty: number) {
    if (!Number.isInteger(qty) || qty <= 0)
      throw new BadRequestException("qty must be positive integer");
    const inv = await this.prisma.inventory.findUnique({
      where: { productId },
      select: { productId: true, onHand: true, reserved: true },
    });
    if (!inv) throw new NotFoundException("Inventory not found");

    return {
      productId: inv.productId,
      onHand: inv.onHand,
      reserved: inv.reserved,
      ok: inv.onHand >= qty,
      requested: qty,
    };
  }

  // ✅ Atomic: updateMany with where onHand >= qty (กัน oversell)
  async decrementOnHand(productId: string, qty: number) {
    if (!Number.isInteger(qty) || qty <= 0)
      throw new BadRequestException("qty must be positive integer");

    const res = await this.prisma.inventory.updateMany({
      where: {
        productId,
        onHand: { gte: qty },
      },
      data: {
        onHand: { decrement: qty },
        version: { increment: 1 },
      },
    });

    if (res.count === 0) {
      // แยกเคส: ไม่มี record vs ของไม่พอ
      const exists = await this.prisma.inventory.findUnique({
        where: { productId },
        select: { productId: true },
      });
      if (!exists) throw new NotFoundException("Inventory not found");
      throw new ConflictException("Out of stock");
    }

    return this.get(productId);
  }

  async incrementOnHand(productId: string, qty: number) {
    if (!Number.isInteger(qty) || qty <= 0)
      throw new BadRequestException("qty must be positive integer");

    try {
      return await this.prisma.inventory.update({
        where: { productId },
        data: {
          onHand: { increment: qty },
          version: { increment: 1 },
        },
      });
    } catch {
      throw new NotFoundException("Inventory not found");
    }
  }
}
