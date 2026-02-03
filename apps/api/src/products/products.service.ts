import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ListProductsQueryDto } from "./dto/list-products.query";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(q: ListProductsQueryDto) {
    const normalized = this.normalizeQuery(q);
    const where = this.buildWhere(normalized);

    const [total, items] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: normalized.offset,
        take: normalized.limit,
      }),
    ]);

    return {
      ok: true,
      meta: {
        total,
        limit: normalized.limit,
        offset: normalized.offset,
      },
      data: items,
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) throw new NotFoundException("Product not found");
    return { ok: true, data: product };
  }

  // -----------------------
  // helpers
  // -----------------------

  private normalizeQuery(q: ListProductsQueryDto) {
    return {
      search: (q.search ?? "").trim(),
      category: (q.category ?? "").trim(),
      limit: q.limit ?? 24,
      offset: q.offset ?? 0,
    };
  }

  private buildWhere(q: { search: string; category: string }) {
    const where: any = {};

    if (q.category) {
      where.category = { equals: q.category, mode: "insensitive" };
    }

    if (q.search) {
      where.OR = [
        { title: { contains: q.search, mode: "insensitive" } },
        { description: { contains: q.search, mode: "insensitive" } },
      ];
    }

    return where;
  }
}
